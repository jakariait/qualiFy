import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrebookByProduct from "./PrebookByProduct.jsx";

const API_BASE = (import.meta.env.VITE_API_URL || "") + "/products";

const ProductWithPrebook = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_BASE);

      if (res?.data?.success && Array.isArray(res?.data?.data)) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError(err.message || "Error fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (id) => {
    if (id) {
      setSelectedProductId(id);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProductId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="m-4">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
            Products and Service Pre-Book History
          </h1>

          {products.length === 0 ? (
            <Alert severity="info">No products found.</Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => {
                const hasImage = Boolean(product?.thumbnailImage);
                const imageUrl = hasImage
                  ? `${(import.meta.env.VITE_API_URL || "").replace(
                      "/api",
                      "",
                    )}/uploads/${product.thumbnailImage}`
                  : null;

                return (
                  <div
                    key={product?._id || Math.random()}
                    onClick={() => handleOpenDialog(product?._id)}
                    className="cursor-pointer rounded-lg p-3 flex flex-col items-center shadow-md transition-shadow hover:shadow-lg"
                  >
                    {hasImage ? (
                      <img
                        src={imageUrl}
                        alt={product?.name || "Product"}
                        className="w-full h-40 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-300 rounded-md mb-2" />
                    )}
                    <span className="text-center primaryTextColor mt-3">
                      {product?.name || "Unnamed Product"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Pre-Book History
          <IconButton
            onClick={handleCloseDialog}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {selectedProductId ? (
          <div className={"p-4 -mt-10"}>
            <PrebookByProduct productId={selectedProductId}/>
          </div>
        ) : (
          <Alert severity="info" style={{ margin: "16px" }}>
            No product selected.
          </Alert>
        )}
      </Dialog>
    </>
  );
};

export default ProductWithPrebook;
