import React, { useState } from "react";
import AuthAdminStore from "../../store/AuthAdminStore.js";

const escapeCSV = (value) => {
  const str = String(value ?? "N/A");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatBDT = (amount) => `৳${Number(amount || 0).toFixed(2)}`;

const DownloadAllOrder = () => {
  const [loading, setLoading] = useState(false);
  const { token } = AuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleExport = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${apiUrl}/orders/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders for export");
      }

      const { orders } = await response.json();

      const headers = [
        "Order ID",
        "Customer Name",
        "Customer Phone",
        "Customer Email",
        "Address",
        "Products",
        "Subtotal",
        "Delivery Charge",
        "VAT",
        "Discount",
        "Total",
        "Status",
        "Payment Method",
        "Payment Status",
        "Order Date",
      ];

      const rows = orders.map((order) => [
        order.orderNo,
        order.userId?.fullName || order.shippingInfo.fullName,
        order.userId?.phone || order.shippingInfo.mobileNo,
        order.userId?.email || order.shippingInfo.email,
        `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.area}`,
        order.items
          .map(
            (item) =>
              `${item.productId ? item.productId.name : "N/A"} (Qty: ${item.quantity})`,
          )
          .join(", "),
        formatBDT(order.subtotalAmount),
        formatBDT(order.deliveryCharge),
        formatBDT(order.vat),
        formatBDT(order.promoDiscount),
        formatBDT(order.totalAmount),
        order.orderStatus,
        order.paymentMethod,
        order.paymentStatus,
        new Date(order.createdAt).toLocaleString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "all-orders.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-200 ease-in-out cursor-pointer"
      >
        {loading ? "Exporting..." : "Export All Orders to CSV"}
      </button>
    </div>
  );
};

export default DownloadAllOrder;