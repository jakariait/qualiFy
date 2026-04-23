const axios = require("axios");
const PathaoConfig = require("../models/PathaoConfigModel");

// Helper to get current config
const getConfig = async () => {
  let config = await PathaoConfig.findOne();
  if (!config) {
    config = await PathaoConfig.create({});
  }
  return config;
};

// Issue/Refresh Access Token
const issueToken = async (config) => {
  try {
    const response = await axios.post(`${config.baseUrl}/aladdin/api/v1/issue-token`, {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "password",
      username: config.username,
      password: config.password,
    });

    const { token_type, expires_in, access_token, refresh_token } = response.data;

    // Update config with new tokens
    await PathaoConfig.findByIdAndUpdate(config._id, {
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenType: token_type,
      expiresIn: expires_in,
    });

    return {
      success: true,
      access_token,
      refresh_token,
      expires_in,
    };
  } catch (error) {
    console.error("Error issuing Pathao token:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Refresh token
const refreshToken = async (config) => {
  try {
    const response = await axios.post(`${config.baseUrl}/aladdin/api/v1/issue-token`, {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: config.refreshToken,
    });

    const { token_type, expires_in, access_token, refresh_token } = response.data;

    // Update config with new tokens
    await PathaoConfig.findByIdAndUpdate(config._id, {
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenType: token_type,
      expiresIn: expires_in,
    });

    return {
      success: true,
      access_token,
      refresh_token,
      expires_in,
    };
  } catch (error) {
    console.error("Error refreshing Pathao token:", error.response?.data || error.message);
    // If refresh fails, try issuing new token
    return await issueToken(config);
  }
};

// Get valid access token (checks expiry and refreshes if needed)
const getValidToken = async () => {
  const config = await getConfig();

  if (!config.accessToken || !config.refreshToken) {
    // No token exists, issue new one
    const result = await issueToken(config);
    return result.success ? result.access_token : null;
  }

  // Check if token might be expired (refresh if expires within 1 hour)
  const bufferTime = 3600; // 1 hour in seconds
  if (config.expiresIn && config.expiresIn < bufferTime) {
    const result = await refreshToken(config);
    return result.success ? result.access_token : null;
  }

  return config.accessToken;
};

// API Helper - Make authenticated request
const makeRequest = async (endpoint, method = "GET", data = null) => {
  const token = await getValidToken();
  if (!token) {
    throw new Error("Failed to get valid Pathao access token");
  }

  const config = await getConfig();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios({
      url: `${config.baseUrl}${endpoint}`,
      method,
      headers,
      data,
    });

    return {
      success: true,
      data: response.data,
      ...response.data,
    };
  } catch (error) {
    console.error(`Pathao API Error [${endpoint}]:`, error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Get City List
exports.getCityList = async () => {
  return await makeRequest("/aladdin/api/v1/city-list");
};

// Get Zone List by City ID
exports.getZoneList = async (cityId) => {
  return await makeRequest(`/aladdin/api/v1/cities/${cityId}/zone-list`);
};

// Get Area List by Zone ID
exports.getAreaList = async (zoneId) => {
  return await makeRequest(`/aladdin/api/v1/zones/${zoneId}/area-list`);
};

// Get Store List
exports.getStoreList = async () => {
  return await makeRequest("/aladdin/api/v1/stores");
};

// Calculate Price
exports.calculatePrice = async ({ storeId, itemType, deliveryType, itemWeight, recipientCity, recipientZone }) => {
  return await makeRequest("/aladdin/api/v1/merchant/price-plan", "POST", {
    store_id: storeId,
    item_type: itemType,
    delivery_type: deliveryType,
    item_weight: itemWeight,
    recipient_city: recipientCity,
    recipient_zone: recipientZone,
  });
};

// Create Order
exports.createOrder = async (orderData) => {
  const {
    storeId,
    merchantOrderId,
    recipientName,
    recipientPhone,
    recipientAddress,
    deliveryType,
    itemType,
    itemQuantity,
    itemWeight,
    itemDescription,
    amountToCollect,
    specialInstruction,
    recipientCity,
    recipientZone,
    recipientArea,
  } = orderData;

  return await makeRequest("/aladdin/api/v1/orders", "POST", {
    store_id: storeId,
    merchant_order_id: merchantOrderId,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    recipient_address: recipientAddress,
    delivery_type: deliveryType,
    item_type: itemType,
    item_quantity: itemQuantity,
    item_weight: itemWeight,
    item_description: itemDescription || "",
    amount_to_collect: amountToCollect,
    special_instruction: specialInstruction || "",
    recipient_city: recipientCity,
    recipient_zone: recipientZone,
    recipient_area: recipientArea,
  });
};

// Get Order Info
exports.getOrderInfo = async (consignmentId) => {
  return await makeRequest(`/aladdin/api/v1/orders/${consignmentId}/info`);
};

// Issue new token manually
exports.issueNewToken = async () => {
  const config = await getConfig();
  return await issueToken(config);
};

// Get config helper
exports.getConfig = getConfig;