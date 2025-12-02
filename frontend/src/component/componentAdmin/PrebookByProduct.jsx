import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import useAuthAdminStore from "../../store/AuthAdminStore.js";
import DeleteIcon from "@mui/icons-material/Delete";

const PrebookByProduct = ({ productId }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();
  const [prebookData, setPrebookData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    const fetchPrebookData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `${apiUrl}/pre-book/product/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setPrebookData(result.data);
      } catch (e) {
        setError(e.message);
        console.error("Error fetching prebook data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrebookData();
  }, [productId, token]);

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsConfirmDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsConfirmDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      try {
        const response = await fetch(`${apiUrl}/pre-book/${deleteTargetId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setPrebookData(
          prebookData.filter((item) => item._id !== deleteTargetId),
        );
        setSnackbarMessage("Prebook entry deleted successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (e) {
        console.error("Error deleting prebook data:", e);
        setSnackbarMessage(`Failed to delete prebook entry: ${e.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        handleCloseDialog();
      }
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center" style={{ padding: "2rem" }}>
        Error: {error}
      </Typography>
    );
  }

  if (prebookData.length === 0) {
    return (
      <Typography align="center" style={{ padding: "2rem" }}>
        No prebook data found for this product.
      </Typography>
    );
  }

  const filteredPrebookData = prebookData.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesName = item.userId?.fullName?.toLowerCase().includes(query);
    const matchesEmail = item.userId?.email?.toLowerCase().includes(query);
    const matchesPhone = item.userId?.phone?.includes(query);
    return matchesName || matchesEmail || matchesPhone;
  });

  return (
    <div style={{ padding: "1rem" }}>
      <div
        className={"flex items-center justify-between pb-5 primaryTextColor"}
      >
        <Typography variant="h6" gutterBottom>
          Prebook Details for {prebookData[0]?.productId?.name || "N/A"}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Number of Pre-Book: {prebookData.length}
        </Typography>
      </div>
      <Box mb={2}>
        <TextField
          label="Search by Name, Email, or Phone Number"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Booked Price</TableCell>
              <TableCell>Prebooked Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrebookData.map((item) => (
              <TableRow key={item._id} hover>
                <TableCell>{item.userId?.fullName || "N/A"}</TableCell>
                <TableCell>{item.userId?.phone || "N/A"}</TableCell>
                <TableCell>{item.userId?.email || "N/A"}</TableCell>
                <TableCell>{item.userId?.address || "N/A"}</TableCell>
                <TableCell>{item.bookedPrice}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isConfirmDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this prebook entry?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PrebookByProduct;
