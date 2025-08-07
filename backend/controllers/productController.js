const productService = require("../services/productService");

// ✅ Create a product
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle thumbnailImage upload
    if (req.files?.thumbnailImage) {
      productData.thumbnailImage = req.files.thumbnailImage[0].filename;
    }

    // Handle previewPdf upload
    if (req.files?.previewPdf) {
      productData.previewPdf = req.files.previewPdf[0].filename;
    }

    // Handle courseThumbnail(s) inside modules
    if (req.files?.courseThumbnails && productData.modules) {
      const courseThumbnails = req.files.courseThumbnails.map((f) => f.filename);

      let parsedModules = typeof productData.modules === "string"
        ? JSON.parse(productData.modules)
        : productData.modules;

      parsedModules = parsedModules.map((module, moduleIdx) => ({
        ...module,
        lessons: module.lessons.map((lesson, lessonIdx) => ({
          ...lesson,
          courseThumbnail: courseThumbnails.shift() || lesson.courseThumbnail || "",
        })),
      }));

      productData.modules = parsedModules;
    }

    // Handle optional nested JSON fields
    if (typeof productData.instructors === "string") {
      productData.instructors = JSON.parse(productData.instructors);
    }

    if (typeof productData.faqs === "string") {
      productData.faqs = JSON.parse(productData.faqs);
    }

    // Create the product
    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create product. Please try again!",
      error: error.message,
    });
  }
};


// ✅ Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = { ...req.body };

    // Handle thumbnailImage upload
    if (req.files?.thumbnailImage) {
      productData.thumbnailImage = req.files.thumbnailImage[0].filename;
    }

    // Handle previewPdf upload
    if (req.files?.previewPdf) {
      productData.previewPdf = req.files.previewPdf[0].filename;
    }

    // Handle courseThumbnail(s) inside modules
    if (req.files?.courseThumbnails && productData.modules) {
      const courseThumbnails = req.files.courseThumbnails.map((f) => f.filename);

      let parsedModules =
        typeof productData.modules === "string"
          ? JSON.parse(productData.modules)
          : productData.modules;

      parsedModules = parsedModules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          courseThumbnail: courseThumbnails.shift() || lesson.courseThumbnail || "",
        })),
      }));

      productData.modules = parsedModules;
    } else if (typeof productData.modules === "string") {
      // Parse modules even if no files were uploaded
      productData.modules = JSON.parse(productData.modules);
    }

    // Handle optional nested JSON fields
    if (typeof productData.instructors === "string") {
      productData.instructors = JSON.parse(productData.instructors);
    }

    if (typeof productData.faqs === "string") {
      productData.faqs = JSON.parse(productData.faqs);
    }

    // Call the service to update the product
    const updatedProduct = await productService.updateProduct(productId, productData);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update product. Please try again!",
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
  getSimilarProducts,
  updateProduct
};
