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

const ProductSalesHistory = ({ productId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError("");

    axios
      .get(`/api/product-sales/${productId}`)
      .then((res) => {
        setData(res.data);
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

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6">Product Sales Summary</Typography>
          <Typography variant="body1">
            <strong>Total Units Sold:</strong> {data.totalUnitsSold}
          </Typography>
          <Typography variant="body1">
            <strong>Total Revenue:</strong> ৳{data.totalRevenue}
          </Typography>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales by Order Status
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Units Sold</TableCell>
                <TableCell>Revenue (৳)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data.statusBreakdown || {}).map(
                ([status, stats]) => (
                  <TableRow key={status}>
                    <TableCell>{status}</TableCell>
                    <TableCell>{stats.units}</TableCell>
                    <TableCell>{stats.revenue}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales History
          </Typography>
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
              {data.salesHistory.map((order, index) => (
                order.items.map((item, idx) => (
                  <TableRow key={`${index}-${idx}`}>
                    <TableCell>{order.orderNo}</TableCell>
                    <TableCell>{order.orderStatus}</TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSalesHistory;
