const ProductModel = require("../models/ProductModel");
const OrderModel = require("../models/OrderModel");
const mongoose = require("mongoose");

// ✅ Create a new product
const createProduct = async (data) => {
  try {
    const product = new ProductModel(data);
    await product.save();
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateProduct = async (productId, productData) => {
  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      return null;
    }

    // Overwrite product fields with productData fields
    Object.assign(product, productData);

    // Mongoose can track changes in nested arrays if you mark them as modified
    if (productData.modules) {
      product.markModified("modules");
    }

    await product.save({ runValidators: true });
    return product;
  } catch (error) {
    console.error("Service error updating product:", error);
    throw error;
  }
};

// ✅ Get all products by filter (type, isActive)
const getFilteredProducts = async ({ type, isActive }) => {
  try {
    const filter = {};

    if (type) {
      filter.type = type; // book, course, exam
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true"; // convert string to boolean
    }

    const products = await ProductModel.find(filter)
      .populate({
        path: "instructors",
        select: "name title teachersImg teacherUniversity bio",
      })
      .sort({ createdAt: -1 });

    return products;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ✅ Get product by ID (productId is your custom auto-increment field)
const getProductById = async (productId) => {
  try {
    const product = await ProductModel.findOne({ productId }).populate({
      path: "instructors",
      select: "name title teachersImg teacherUniversity bio",
    });
    if (!product) throw new Error("Product not found");
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ✅ Get product by slug
const getProductBySlug = async (slug) => {
  try {
    const product = await ProductModel.findOne({ slug }).populate({
      path: "instructors",
      select: "name title teachersImg teacherUniversity bio scholarship",
    });
    if (!product) throw new Error("Product not found");
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ✅ Delete product by productId (custom id)
const deleteProduct = async (productId) => {
  try {
    const deleted = await ProductModel.findOneAndDelete({ productId });
    if (!deleted) throw new Error("Product not found");
    return deleted;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getSimilarProductsByType = async (type, excludeId) => {
  return ProductModel.find({
    type,
    _id: { $ne: excludeId },
    isActive: true,
  })
    .limit(9)
    .sort({ createdAt: -1 });
};

const countOrdersByProduct = async (productId) => {
  try {
    const count = await OrderModel.countDocuments({
      "items.productId": productId,
    });
    return count;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createProduct,
  getFilteredProducts,
  getProductBySlug,
  getProductById,
  deleteProduct,
  getSimilarProductsByType,
  updateProduct,
  countOrdersByProduct,
};
