import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Send as SendIcon } from "@mui/icons-material";

const SendToPathao = ({ order, open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [itemDescription, setItemDescription] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    // Format phone number for Pathao (11 digits starting with 0)
    let phone = order.shippingInfo.mobileNo || order.shippingInfo.phone;
    // Remove +88 if present
    phone = phone.replace(/^\+88/, "");
    // Ensure it starts with 0
    if (!phone.startsWith("0")) {
      phone = "0" + phone;
    }
    // Take only first 11 digits
    phone = phone.substring(0, 11);

    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/pathao/orders`,
        {
          merchantOrderId: order.orderNo,
          recipientName: order.shippingInfo.fullName,
          recipientPhone: phone,
          recipientAddress: order.shippingInfo.address,
          deliveryType: 48, // Normal Delivery
          itemType: 2, // Parcel
          itemQuantity: order.items?.length || 1,
          itemWeight: "0.5",
          itemDescription:
            itemDescription ||
            `${order.items?.length || 1} item(s) from qualiFy`,
          amountToCollect: 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success || response.data.type === "success") {
        const consignmentId = response.data.data?.consignment_id;

// Update order with courier info
        await axios.put(
          `${apiUrl}/orders/${order._id}`,
          {
            courierName: "Pathao",
            trackingNumber: consignmentId || "",
            sentToCourier: true,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSnackbar({
          open: true,
          message: `Order sent to Pathao! Consignment ID: ${consignmentId || "N/A"}`,
          severity: "success",
        });

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Failed to send to Pathao",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Pathao Error:", error.response?.data || error.message);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.response?.data?.error?.description ||
          "Failed to send to Pathao",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setItemDescription("");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SendIcon color="primary" />
            Send Order to Pathao Courier
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: "text.secondary" }}
          >
            Order No: <strong>{order?.orderNo}</strong>
          </Typography>

          <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Customer:</strong> {order?.shippingInfo?.fullName}
            </Typography>
            <Typography variant="body2">
              <strong>Phone:</strong> {order?.shippingInfo?.mobileNo}
            </Typography>
            <Typography variant="body2">
              <strong>Address:</strong> {order?.shippingInfo?.address}
            </Typography>
            <Typography variant="body2">
              <strong>Total Amount:</strong> ৳{order?.totalAmount?.toFixed(2)}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Item Description (Optional)"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            multiline
            rows={2}
            placeholder="Describe the items being delivered..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? "Sending..." : "Send to Pathao"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendToPathao;
