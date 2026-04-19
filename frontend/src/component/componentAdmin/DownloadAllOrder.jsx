import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AuthAdminStore from "../../store/AuthAdminStore.js";

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

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      worksheet.columns = [
        { header: "Order ID", key: "orderNo", width: 15 },
        { header: "Customer Name", key: "customerName", width: 25 },
        { header: "Customer Phone", key: "customerPhone", width: 20 },
        { header: "Customer Email", key: "customerEmail", width: 30 },
        { header: "Address", key: "address", width: 40 },
        { header: "Products", key: "products", width: 50 },
        {
          header: "Subtotal",
          key: "subtotalAmount",
          width: 15,
          style: { numFmt: '"৳"#,##0.00' },
        },
        {
          header: "Delivery Charge",
          key: "deliveryCharge",
          width: 15,
          style: { numFmt: '"৳"#,##0.00' },
        },
        {
          header: "VAT",
          key: "vat",
          width: 15,
          style: { numFmt: '"৳"#,##0.00' },
        },
        {
          header: "Discount",
          key: "promoDiscount",
          width: 15,
          style: { numFmt: '"৳"#,##0.00' },
        },
        {
          header: "Total",
          key: "totalAmount",
          width: 15,
          style: { numFmt: '"৳"#,##0.00' },
        },
        { header: "Status", key: "orderStatus", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 20 },
        { header: "Payment Status", key: "paymentStatus", width: 15 },
        {
          header: "Order Date",
          key: "createdAt",
          width: 20,
          style: { numFmt: "yyyy-mm-dd hh:mm:ss" },
        },
      ];

      worksheet.getRow(1).font = { bold: true };

      orders.forEach((order) => {
        worksheet.addRow({
          orderNo: order.orderNo,
          customerName: order.userId?.fullName || order.shippingInfo.fullName,
          customerPhone: order.userId?.phone || order.shippingInfo.mobileNo,
          customerEmail: order.userId?.email || order.shippingInfo.email,
          address: `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.area}`,
          products: order.items
            .map(
              (item) =>
                `${item.productId ? item.productId.name : "N/A"} (Qty: ${
                  item.quantity
                })`,
            )
            .join(", "),
          subtotalAmount: order.subtotalAmount,
          deliveryCharge: order.deliveryCharge,
          vat: order.vat,
          promoDiscount: order.promoDiscount,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: new Date(order.createdAt),
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "all-orders.xlsx");
    } catch (error) {
      console.error("Export failed", error);
      // Consider showing an error message to the user
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
        {loading ? "Exporting..." : "Export All Orders to Excel"}
      </button>
    </div>
  );
};

export default DownloadAllOrder;