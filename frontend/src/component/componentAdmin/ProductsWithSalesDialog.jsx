import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ProductSalesHistory from "./ProductSalesHistory";

const API_BASE = import.meta.env.VITE_API_URL + "/products";

const ProductsWithSalesDialog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      if (res.data.success) {
        setProducts(res.data.data);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (id) => {
    setSelectedProductId(id);
    setDialogOpen(true);
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
            Products and Service Sales History
          </h1>
          <div className="grid grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleOpenDialog(product._id)}
                className="cursor-pointer  rounded-lg p-3 flex flex-col items-center shadow-md transition-shadow"
              >
                {product.thumbnailImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL.replace(
                      "/api",
                      ""
                    )}/uploads/${product.thumbnailImage}`}
                    alt={product.name}
                    className=" w-full h-40 object-contain "
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-md mb-2" />
                )}
                <span className="text-center primaryTextColor mt-3 ">{product.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>




      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Sales History
          <IconButton
            onClick={handleCloseDialog}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {selectedProductId && (
          <div style={{ padding: "16px" }}>
            <ProductSalesHistory productId={selectedProductId} />
          </div>
        )}
      </Dialog>
    </>
  );
};

export default ProductsWithSalesDialog;
