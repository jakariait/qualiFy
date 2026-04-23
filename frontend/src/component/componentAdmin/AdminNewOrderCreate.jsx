import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  Typography,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import useOrderStore from "../../store/useOrderStore.js";

const AdminNewOrderCreate = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { fetchAllOrders } = useOrderStore();

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);

  // Customer selection
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Delivery info (pre-filled from selected customer, editable)
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    mobileNo: "",
    email: "",
    address: "",
  });

  // Products
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Order items cart
  const [orderItems, setOrderItems] = useState([]);

  // Check if any product has free shipping
  const hasFreeShippingProduct = orderItems.some((item) => item.freeShipping);

  // No shipping charge when all items have chargeDelivery disabled
  const hasDeliveryChargeProduct = orderItems.every((item) => item.chargeDelivery !== false);

  // No shipping charge when all items are exams (same logic as Checkout.jsx)
  const isExamOnly =
    orderItems.length > 0 &&
    orderItems.every((item) => item.productType === "exam");

  const noShippingCharge = hasFreeShippingProduct || isExamOnly || !hasDeliveryChargeProduct;

  // Shipping & Payment
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  // Discounts & advance
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // Notes
  const [adminNote, setAdminNote] = useState("");

  // Calculations
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    vat: 0,
    deliveryCharge: 0,
    total: 0,
  });
  const [vatPercentage, setVatPercentage] = useState(0);

  // Loading & Alerts
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    address: false,
    selectedCustomer: false,
    selectedShipping: false,
  });

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchShippingOptions();
    fetchVatPercentage();
  }, []);

  // Fetch customers when dialog opens
  useEffect(() => {
    if (openDialog) {
      fetchCustomers();
    }
  }, [openDialog]);

  useEffect(() => {
    calculateTotals();
  }, [orderItems, selectedShipping, specialDiscount, vatPercentage]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllProductsAdmin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data?.success) {
        setProducts(res.data.data || []);
      } else {
        showSnackbar("Failed to fetch products", "error");
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to fetch products",
        "error",
      );
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllUsers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data?.users) {
        setCustomers(res.data.users);
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to fetch customers",
        "error",
      );
    }
  };

  const fetchShippingOptions = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllShipping`);
      if (res.data?.success && res.data.data?.length > 0) {
        const options = res.data.data;
        setShippingOptions(options);
        // Auto-select first option as default (same as ShippingOptions.jsx)
        setSelectedShipping(options[0]);
      }
    } catch (err) {
      showSnackbar("Failed to fetch shipping options", "error");
    }
  };

  const fetchVatPercentage = async () => {
    try {
      const res = await axios.get(`${apiUrl}/getVatPercentage`);
      if (res.data?.success && res.data.data) {
        const vatValue = res.data.data.percentage || res.data.data.value || 0;
        setVatPercentage(parseFloat(vatValue) || 0);
      } else {
        setVatPercentage(0);
      }
    } catch (err) {
      setVatPercentage(0);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to build variant name from attributes
  const getVariantName = (variant) => {
    if (!variant) return "Unknown";

    // If variant has attributes, build name from them (e.g., "M - Red")
    if (variant.attributes && variant.attributes.length > 0) {
      return variant.attributes
        .map((attr) => attr.value) // attr.value is the actual value (e.g., "M", "Red")
        .join(" - ");
    }

    // Fallback to _id if no attributes
    return `Variant ${variant._id.slice(-4)}`;
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      showSnackbar("Please select a product", "error");
      return;
    }

    // Check if product has variants
    const hasVariants =
      selectedProduct.variants && selectedProduct.variants.length > 0;

    if (hasVariants && !selectedVariant) {
      showSnackbar("Please select a variant", "error");
      return;
    }

    if (quantity < 1) {
      showSnackbar("Please enter a valid quantity", "error");
      return;
    }

    // Handle both products with and without variants
    let price, variantId, variantName;

    if (hasVariants) {
      // Use discount price if available, otherwise use regular price (matching Checkout.jsx logic)
      price =
        selectedVariant.discount > 0
          ? selectedVariant.discount
          : selectedVariant.price || 0;
      variantId = selectedVariant._id;
      variantName = getVariantName(selectedVariant);
    } else {
      // For products without variants, use discount price if available (matching Checkout.jsx logic)
      price =
        selectedProduct.finalDiscount > 0
          ? selectedProduct.finalDiscount
          : selectedProduct.finalPrice || 0;
      variantId = null;
      variantName = "Default";
    }

    const newItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.name, // Use 'name' not 'productName'
      variantId,
      variantName,
      quantity: parseInt(quantity),
      price,
      freeShipping: selectedProduct.freeShipping || false,
      productType: selectedProduct.type || "",
      chargeDelivery: selectedProduct.chargeDelivery,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    showSnackbar("Product added to order", "success");
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const hasFreeShipping = orderItems.some(
      (item) => item.freeShipping === true,
    );

    const hasDeliveryCharge = orderItems.every(
      (item) => item.chargeDelivery !== false,
    );

    const subtotal = orderItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );

    // Use 'value' instead of 'deliveryCharge' - shipping model uses 'value' field
    // If any product has freeShipping or chargeDelivery=false, delivery charge is 0
    const deliveryCharge = hasFreeShipping || !hasDeliveryCharge ? 0 : selectedShipping?.value || 0;
    const discount = parseFloat(specialDiscount) || 0;

    // Calculate amount after discounts (matching Checkout.jsx logic)
    const amountAfterDiscount = subtotal - discount;

    // VAT is calculated on the amount AFTER discounts (matching Checkout.jsx)
    const vatPercent = parseFloat(vatPercentage) || 0;
    const vat = Math.max(0, (amountAfterDiscount * vatPercent) / 100);

    // Total = subtotal - discount + vat + delivery
    const total = Math.max(0, subtotal + deliveryCharge + vat - discount);

    setCalculatedTotals({
      subtotal: Math.round(subtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      deliveryCharge: Math.round(deliveryCharge * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  };

  const handleCreateOrder = async () => {
    try {
      if (orderItems.length === 0) {
        showSnackbar("Add at least one product to the order", "error");
        return;
      }

      if (!noShippingCharge && !selectedShipping) {
        showSnackbar("Please select a shipping option", "error");
        return;
      }

      // Validate customer information
      if (!selectedCustomer) {
        showSnackbar("Please select a customer", "error");
        return;
      }
      if (!deliveryInfo.address?.trim()) {
        showSnackbar("Address is required", "error");
        return;
      }

      setIsLoading(true);

      const orderData = {
        userId: selectedCustomer._id,
        items: orderItems,
        paymentMethod: "cash_on_delivery",
        paymentStatus,
        shippingInfo: {
          fullName: deliveryInfo.fullName,
          mobileNo: deliveryInfo.mobileNo,
          email: deliveryInfo.email,
          address: deliveryInfo.address,
        },
        billingInfo: {
          fullName: deliveryInfo.fullName,
          address: deliveryInfo.address,
        },
        shippingId: noShippingCharge ? null : selectedShipping._id,
        deliveryCharge: noShippingCharge ? 0 : selectedShipping.value,
        deliveryMethod: "home_delivery",
        subtotalAmount: calculatedTotals.subtotal,
        vat: calculatedTotals.vat,
        specialDiscount: specialDiscount,
        advanceAmount: advanceAmount,
        promoCode: null,
        promoDiscount: 0,
        adminNote,
        orderSource: "admin", // Mark as admin order
      };

      const res = await axios.post(`${apiUrl}/orders/admin/create`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data?.success) {
        showSnackbar("Order created successfully!", "success");
        // Refetch all orders to show the new order
        fetchAllOrders();
        handleCloseDialog();
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to create order",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setOrderItems([]);
    setSelectedCustomer(null);
    setDeliveryInfo({ fullName: "", mobileNo: "", email: "", address: "" });
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    setSpecialDiscount(0);
    setAdvanceAmount(0);
    setAdminNote("");
    setPaymentStatus("unpaid");
    setFormErrors({
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
    });
  };

  // Real-time form validation
  const validateForm = () => {
    const errors = {
      address: false,
      selectedCustomer: false,
      selectedShipping: false,
    };

    if (!selectedCustomer) errors.selectedCustomer = true;
    if (!deliveryInfo.address?.trim()) errors.address = true;
    if (!noShippingCharge && !selectedShipping) errors.selectedShipping = true;

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  // Trigger validation whenever relevant fields change
  useEffect(() => {
    if (openDialog) {
      validateForm();
    }
  }, [deliveryInfo.address, selectedCustomer, selectedShipping, orderItems]);

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        + Create New Order
      </Button>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Create New Admin Order</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Customer Selection */}
            <Card>
              <CardContent>
                <h3 className={"pb-5"}>Customer Information</h3>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) =>
                    `${option.fullName} (${option.phone || option.email})`
                  }
                  filterOptions={(options, { inputValue }) => {
                    const q = inputValue.toLowerCase();
                    return options.filter(
                      (o) =>
                        o.fullName?.toLowerCase().includes(q) ||
                        o.email?.toLowerCase().includes(q) ||
                        o.phone?.includes(q),
                    );
                  }}
                  value={selectedCustomer}
                  onChange={(e, value) => {
                    setSelectedCustomer(value);
                    setDeliveryInfo({
                      fullName: value?.fullName || "",
                      mobileNo: value?.phone || "",
                      email: value?.email || "",
                      address: value?.address || "",
                    });
                  }}
                  renderOption={({ key, ...optionProps }, option) => (
                    <li key={key} {...optionProps}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {option.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.phone} · {option.email}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Customer"
                      placeholder="Search by name, phone or email..."
                      error={formErrors.selectedCustomer}
                      helperText={
                        formErrors.selectedCustomer
                          ? "Customer is required"
                          : ""
                      }
                    />
                  )}
                />
                {selectedCustomer && (
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    >
                      Delivery Details (Editable)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={deliveryInfo.fullName}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Mobile Number"
                          value={deliveryInfo.mobileNo}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              mobileNo: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={deliveryInfo.email}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              email: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={deliveryInfo.address}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              address: e.target.value,
                            })
                          }
                          error={formErrors.address}
                          helperText={
                            formErrors.address ? "Address is required" : ""
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardContent>
                <h3 className={"pb-5"}>Add Products</h3>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => option.name || ""}
                      value={selectedProduct}
                      onChange={(e, value) => {
                        setSelectedProduct(value);
                        setSelectedVariant(null);
                      }}
                      renderOption={({ key, ...optionProps }, option) => (
                        <li key={key} {...optionProps}>
                          {option.name}
                          {option.freeShipping && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "green",
                                fontSize: "0.75rem",
                              }}
                            >
                              (Free Shipping)
                            </span>
                          )}
                          {option.chargeDelivery === false && (
                            <span
                              style={{
                                marginLeft: 8,
                                color: "blue",
                                fontSize: "0.75rem",
                              }}
                            >
                              (No Delivery Charge)
                            </span>
                          )}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Product"
                          placeholder="Search products..."
                        />
                      )}
                      noOptionsText="No products found"
                      loading={!products || products.length === 0}
                    />
                  </Grid>

                  {selectedProduct &&
                    selectedProduct.variants &&
                    selectedProduct.variants.length > 0 && (
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Variant</InputLabel>
                          <Select
                            value={selectedVariant?._id || ""}
                            onChange={(e) => {
                              const variant = (
                                selectedProduct.variants || []
                              ).find((v) => v._id === e.target.value);
                              setSelectedVariant(variant);
                            }}
                            label="Variant"
                          >
                            {selectedProduct.variants &&
                            selectedProduct.variants.length > 0 ? (
                              selectedProduct.variants.map((variant) => (
                                <MenuItem key={variant._id} value={variant._id}>
                                  {getVariantName(variant)} - ৳
                                  {variant.discount > 0
                                    ? variant.discount
                                    : variant.price || 0}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                No variants available
                              </MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddProduct}
                      sx={{ mt: 1 }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>

                {/* Order Items Table */}
                {orderItems.length > 0 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Variant</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="right">
                              {item.variantName}
                            </TableCell>
                            <TableCell align="right">৳{item.price}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              ৳{item.price * item.quantity}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Shipping & Payment */}
            <Card>
              <CardContent>
                <h3 className={"pb-5"}>Shipping & Payment</h3>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {noShippingCharge ? (
                      <TextField
                        fullWidth
                        label="Shipping Option"
                        value={
                          isExamOnly
                            ? "No Shipping (Exam Only)"
                            : !hasDeliveryChargeProduct
                            ? "No Delivery Charge"
                            : "Free Shipping"
                        }
                        InputProps={{
                          readOnly: true,
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "green",
                            fontWeight: "bold",
                          },
                        }}
                      />
                    ) : (
                      <FormControl
                        fullWidth
                        error={formErrors.selectedShipping}
                      >
                        <InputLabel>Shipping Option</InputLabel>
                        <Select
                          value={selectedShipping?._id || ""}
                          onChange={(e) => {
                            const shipping = shippingOptions.find(
                              (s) => s._id === e.target.value,
                            );
                            setSelectedShipping(shipping);
                          }}
                          label="Shipping Option"
                        >
                          {shippingOptions.map((option) => (
                            <MenuItem key={option._id} value={option._id}>
                              {option.name} - ৳{option.value}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.selectedShipping && (
                          <Box
                            sx={{
                              color: "#d32f2f",
                              fontSize: "0.75rem",
                              mt: 0.5,
                            }}
                          >
                            Shipping Option is required
                          </Box>
                        )}
                      </FormControl>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Status</InputLabel>
                      <Select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        label="Payment Status"
                      >
                        <MenuItem value="unpaid">Unpaid</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Special Discount (৳)"
                      type="number"
                      value={specialDiscount}
                      onChange={(e) =>
                        setSpecialDiscount(parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Advance Amount (৳)"
                      type="number"
                      value={advanceAmount}
                      onChange={(e) =>
                        setAdvanceAmount(parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Notes"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              variant="outlined"
            />

            {/* Order Summary */}
            <Card>
              <CardContent>
                <h3>Order Summary</h3>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <strong>Subtotal:</strong>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    ৳{calculatedTotals.subtotal.toFixed(2)}
                  </Grid>

                  {vatPercentage > 0 && (
                    <>
                      <Grid item xs={6}>
                        <strong>VAT ({vatPercentage}%):</strong>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: "right" }}>
                        ৳{calculatedTotals.vat.toFixed(2)}
                      </Grid>
                    </>
                  )}

                  <Grid item xs={6}>
                    <strong>Delivery Charge:</strong>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    {isExamOnly ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        ৳0 (Exam)
                      </span>
                    ) : !hasDeliveryChargeProduct ? (
                      <span style={{ color: "blue", fontWeight: "bold" }}>
                        No Charge
                      </span>
                    ) : noShippingCharge ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        Free
                      </span>
                    ) : (
                      `৳${calculatedTotals.deliveryCharge.toFixed(2)}`
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <strong>Discount:</strong>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    -৳{specialDiscount.toFixed(2)}
                  </Grid>

                  <Grid
                    item
                    xs={6}
                    sx={{
                      borderTop: "2px solid #ddd",
                      pt: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Total:
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sx={{
                      textAlign: "right",
                      borderTop: "2px solid #ddd",
                      pt: 2,
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                  >
                    ৳{calculatedTotals.total.toFixed(2)}
                  </Grid>

                  {advanceAmount > 0 && (
                    <>
                      <Grid item xs={6}>
                        <strong>Advance:</strong>
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        sx={{ textAlign: "right", color: "green" }}
                      >
                        ৳{advanceAmount.toFixed(2)}
                      </Grid>

                      <Grid item xs={6} sx={{ fontWeight: "bold" }}>
                        Due:
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        sx={{
                          textAlign: "right",
                          fontWeight: "bold",
                          color:
                            Math.max(
                              0,
                              calculatedTotals.total - advanceAmount,
                            ) > 0
                              ? "#d32f2f"
                              : "green",
                        }}
                      >
                        ৳
                        {Math.max(
                          0,
                          calculatedTotals.total - advanceAmount,
                        ).toFixed(2)}
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            color="primary"
            disabled={
              isLoading ||
              orderItems.length === 0 ||
              Object.values(formErrors).some((error) => error)
            }
          >
            {isLoading ? <CircularProgress size={24} /> : "Create Order"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminNewOrderCreate;
