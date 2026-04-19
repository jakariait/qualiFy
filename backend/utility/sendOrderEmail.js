const sendEmailMessage = require("./sendEmail");
const ProductModel = require("../models/ProductModel");

const sendOrderEmail = async (order) => {
  const productObjectIds = order.items.map(
    (item) => item.productId.$oid || item.productId,
  );

  const products = await ProductModel.find({
    _id: { $in: productObjectIds },
  }).lean();

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
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#FF4501;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:2px;font-weight:700;">qualiFy</h1>
              <p style="margin:6px 0 0;color:#ffffff;font-size:13px;">Order Confirmation</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0;font-size:16px;color:#333333;">Hi <strong>${fullName}</strong>,</p>
              <p style="margin:8px 0 0;font-size:14px;color:#555555;line-height:1.6;">
                Thank you for your order! We've received it and it's being processed. Here's a summary of what you ordered.
              </p>
            </td>
          </tr>

          <!-- Order Meta -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8f6;border-radius:6px;border:1px solid #ffe0d6;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #ffe0d6;">
                    <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Order Number</span><br/>
                    <strong style="font-size:15px;color:#FF4501;">#${orderNo}</strong>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #ffe0d6;">
                    <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Order Date</span><br/>
                    <strong style="font-size:15px;color:#FF4501;">${formattedDate}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Payment</span><br/>
                    <strong style="font-size:15px;color:#FF4501;">${paymentMethod}</strong>
                  </td>
                  <td style="padding:14px 18px;">
                    <span style="font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Delivery</span><br/>
                    <strong style="font-size:15px;color:#FF4501;">${deliveryMethod}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding:0 32px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#FF4501;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#FF4501;">
                    <th style="padding:10px 12px;text-align:left;font-size:12px;color:#ffffff;font-weight:600;border-radius:4px 0 0 0;">Product</th>
                    <th style="padding:10px 12px;text-align:center;font-size:12px;color:#ffffff;font-weight:600;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#ffffff;font-weight:600;">Unit Price</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#ffffff;font-weight:600;border-radius:0 4px 0 0;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map((item, i) => {
                      const productId = item.productId.$oid || item.productId;
                      const productName = productMap[productId] || "Product";
                      const rowBg = i % 2 === 0 ? "#ffffff" : "#fff8f6";
                      return `
                      <tr style="background-color:${rowBg};">
                        <td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #eeeeee;">${productName}</td>
                        <td style="padding:10px 12px;font-size:13px;color:#333333;text-align:center;border-bottom:1px solid #eeeeee;">${item.quantity}</td>
                        <td style="padding:10px 12px;font-size:13px;color:#333333;text-align:right;border-bottom:1px solid #eeeeee;">Tk. ${item.price.toFixed(2)}</td>
                        <td style="padding:10px 12px;font-size:13px;color:#333333;text-align:right;border-bottom:1px solid #eeeeee;">Tk. ${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8f6;border-radius:6px;border:1px solid #ffe0d6;">
                <tr>
                  <td style="padding:10px 18px;font-size:13px;color:#555555;border-bottom:1px solid #ffe0d6;">Subtotal</td>
                  <td style="padding:10px 18px;font-size:13px;color:#555555;text-align:right;border-bottom:1px solid #ffe0d6;">Tk. ${subtotalAmount.toFixed(2)}</td>
                </tr>
                ${
                  promoDiscount > 0
                    ? `
                <tr>
                  <td style="padding:10px 18px;font-size:13px;color:#27ae60;border-bottom:1px solid #ffe0d6;">Promo Discount${promoCode ? ` (${promoCode})` : ""}</td>
                  <td style="padding:10px 18px;font-size:13px;color:#27ae60;text-align:right;border-bottom:1px solid #ffe0d6;">- Tk. ${promoDiscount.toFixed(2)}</td>
                </tr>`
                    : ""
                }
                ${
                  vat > 0
                    ? `
                <tr>
                  <td style="padding:10px 18px;font-size:13px;color:#555555;border-bottom:1px solid #ffe0d6;">VAT</td>
                  <td style="padding:10px 18px;font-size:13px;color:#555555;text-align:right;border-bottom:1px solid #ffe0d6;">Tk. ${vat.toFixed(2)}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="padding:10px 18px;font-size:13px;color:#555555;border-bottom:1px solid #ffe0d6;">Delivery Charge</td>
                  <td style="padding:10px 18px;font-size:13px;color:#555555;text-align:right;border-bottom:1px solid #ffe0d6;">Tk. ${deliveryCharge.toFixed(2)}</td>
                </tr>
                <tr style="background-color:#FF4501;">
                  <td style="padding:12px 18px;font-size:15px;font-weight:700;color:#ffffff;border-radius:0 0 0 6px;">Total</td>
                  <td style="padding:12px 18px;font-size:15px;font-weight:700;color:#ffffff;text-align:right;border-radius:0 0 6px 0;">Tk. ${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
              ${dueAmount > 0 ? `<p style="margin:10px 0 0;font-size:13px;color:#e74c3c;"><strong>Due Amount:</strong> Tk. ${dueAmount.toFixed(2)}</p>` : ""}
            </td>
          </tr>

          <!-- Shipping Info -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#FF4501;text-transform:uppercase;letter-spacing:1px;">Shipping Address</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8f6;border-radius:6px;border:1px solid #ffe0d6;">
                <tr>
                  <td style="padding:14px 18px;font-size:13px;color:#444444;line-height:1.8;">
                    <strong>${fullName}</strong><br/>
                    ${address}<br/>
                    ${mobileNo}<br/>
                    ${email}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status badges -->
          <tr>
            <td style="padding:0 32px 28px;">
              <span style="display:inline-block;background-color:#fff3cd;color:#856404;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;margin-right:8px;">
                Order: ${orderStatus}
              </span>
              <span style="display:inline-block;background-color:#d1ecf1;color:#0c5460;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">
                Payment: ${paymentStatus}
              </span>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fff5f2;padding:20px 32px;text-align:center;border-top:1px solid #ffe0d6;">
              <p style="margin:0;font-size:13px;color:#888888;">Thank you for shopping with <strong>qualiFy</strong>!</p>
              <p style="margin:6px 0 0;font-size:12px;color:#aaaaaa;">If you have any questions, reply to this email or contact our support.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendEmailMessage(
    email,
    htmlTemplate,
    `Order Confirmation - #${orderNo}`,
    true,
    "qualiFy <order@qualifybd.com>",
  );
};

module.exports = { sendOrderEmail };
