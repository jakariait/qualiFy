const productService = require("../services/productService");

// ✅ Create a product
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle thumbnail upload
    if (req.files?.thumbnailImage) {
      productData.thumbnailImage = req.files.thumbnailImage[0].filename;
    }

    // Handle additional images
    if (req.files?.images) {
      productData.images = req.files.images.map((file) => file.filename);
    }

    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create product. Please try again!",
      error: error.message,
    });
  }
};

// ✅ Get all products (with optional filtering: type, isActive)
const getAllProducts = async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const products = await productService.getFilteredProducts({ type, isActive });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully!",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ✅ Get a product by ID
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Product retrieved successfully!",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product. Please try again!",
      error: error.message,
    });
  }
};

// ✅ Get a product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Product retrieved successfully!",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product. Please try again!",
      error: error.message,
    });
  }
};

// ✅ Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productService.deleteProduct(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found for deletion!",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Product deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product. Please try again!",
      error: error.message,
    });
  }
};

// ✅ Get similar products by type excluding a specific product
const getSimilarProducts = async (req, res) => {
  try {
    const { id, type } = req.params;

    const similarProducts = await productService.getSimilarProductsByType(type, id);

    res.status(200).json({
      success: true,
      message: "✅ Similar products retrieved successfully!",
      data: similarProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch similar products",
      error: error.message,
    });
  }
};


module.exports = {
  createProduct,
  getProductBySlug,
  getAllProducts,
  getProductById,
  deleteProduct,
  getSimilarProducts
};
