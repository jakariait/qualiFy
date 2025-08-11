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
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_URL || "";

const ProductSalesHistory = ({ productId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    setError("");

    axios
      .get(`${API_BASE}/product-sales/${productId}`)
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          setData(null);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Error fetching sales data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

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

  if (!data) {
    return <Alert severity="info">No sales data available.</Alert>;
  }

  const totalUnitsSold = data?.totalUnitsSold ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;
  const statusBreakdown = data?.statusBreakdown || {};
  const salesHistory = data?.salesHistory || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6">Product Sales Summary</Typography>
          <Typography variant="body1">
            <strong>Total Units Sold:</strong> {totalUnitsSold}
          </Typography>
          <Typography variant="body1">
            <strong>Total Revenue:</strong> ৳{totalRevenue}
          </Typography>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales by Order Status
          </Typography>
          {Object.keys(statusBreakdown).length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Units Sold</TableCell>
                  <TableCell>Revenue (৳)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(statusBreakdown).map(([status, stats]) => (
                  <TableRow key={status}>
                    <TableCell>{status}</TableCell>
                    <TableCell>{stats?.units ?? 0}</TableCell>
                    <TableCell>{stats?.revenue ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2">No status breakdown available.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales History
          </Typography>
          {salesHistory.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order No</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesHistory.map((order, index) =>
                  (order.items || []).map((item, idx) => (
                    <TableRow key={`${index}-${idx}`}>
                      <TableCell>{order?.orderNo ?? "N/A"}</TableCell>
                      <TableCell>{order?.orderStatus ?? "Unknown"}</TableCell>
                      <TableCell>
                        {order?.orderDate
                          ? new Date(order.orderDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{item?.quantity ?? 0}</TableCell>
                      <TableCell>{item?.price ?? 0}</TableCell>
                      <TableCell>{item?.total ?? 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2">No sales history available.</Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSalesHistory;
