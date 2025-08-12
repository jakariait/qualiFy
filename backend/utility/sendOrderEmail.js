const nodemailer = require("nodemailer");
const ProductModel = require("../models/ProductModel");


const transporter = nodemailer.createTransport({
  host: "mail.qualifybd.com",
  port: 465,
  secure: true,
  auth: {
    user: "order@qualifybd.com",
    pass: "fm#!#6bStkW}",
  },
});

 const sendOrderEmail = async (order) => {
  // Extract product ObjectIds from order items
  const productObjectIds = order.items.map(
    (item) => item.productId.$oid || item.productId,
  );

  // Fetch products by _id (MongoDB ObjectId)
  const products = await ProductModel.find({
    _id: { $in: productObjectIds },
  }).lean();

  // Map products by _id string for lookup
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p.name || "Unnamed Product";
  });

  const {
    shippingInfo: { fullName, email, address, mobileNo },
    orderNo,
    items,
    promoCode,
    promoDiscount,
    vat,
    deliveryCharge,
    subtotalAmount,
    totalAmount,
    dueAmount,
    paymentMethod,
    paymentStatus,
    orderStatus,
    deliveryMethod,
    orderDate,
  } = order;

  const formattedDate = new Date(orderDate).toLocaleString();

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #4CAF50;">Order Confirmation - #${orderNo}</h2>
      <p>Hi ${fullName},</p>
      <p>Thank you for your order! Here are your order details:</p>

      <h3>Shipping Information:</h3>
      <p>
        <strong>Name:</strong> ${fullName}<br/>
        <strong>Mobile:</strong> ${mobileNo}<br/>
        <strong>Email:</strong> ${email}<br/>
        <strong>Address:</strong> ${address}
      </p>

      <h3>Order Details:</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Product / Service</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Price (Each)</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((item) => {
              const productId = item.productId.$oid || item.productId;
              const productName = productMap[productId] || "Product";
              return `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Tk. ${item.price.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Tk. ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>

      <p><strong>Subtotal:</strong> Tk. ${subtotalAmount.toFixed(2)}</p>
      <p><strong>Promo Discount:</strong> Tk. ${promoDiscount.toFixed(2)}</p>
      <p><strong>Delivery Charge:</strong>Tk. ${deliveryCharge.toFixed(2)}</p>
      <p><strong>Total Amount:</strong> Tk. ${totalAmount.toFixed(2)}</p>
      
      <p>Order placed on: ${formattedDate}</p>

      <p>Thanks for beiing with us!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"qualiFy" <order@qualifybd.com>`,
      to: email,
      subject: `Order Confirmation - #${orderNo}`,
      html: htmlTemplate,
    });
    console.log("Order confirmation email sent to:", email);
  } catch (error) {
    console.error("Error sending order email:", error);
    throw error;
  }
};


module.exports = sendOrderEmail;
