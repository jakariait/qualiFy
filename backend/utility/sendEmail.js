require("dotenv").config();
const nodemailer = require("nodemailer");

// Reusable transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    const secure = port === 465;
    const requireTLS = port === 587;

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure,
      ...(requireTLS && { requireTLS: true }),
      tls: {
        rejectUnauthorized: false, // Always enforce valid certificates
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

// Sleep helper
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const sendEmailMessage = async (
  recipients,
  content,
  subject = "New Notification",
  isHTML = false,
  from = null,
  maxRetries = 3,
  retryDelay = 3000,
) => {
  try {
    const { EMAIL_FROM } = process.env;
    const sender = from || EMAIL_FROM;

    if (!sender) {
      console.error("EMAIL_FROM not configured.");
      return;
    }

    const emailList = Array.isArray(recipients)
      ? recipients
      : recipients.split(",");

    if (emailList.length === 0) {
      console.error("Email recipients missing.");
      return;
    }

    const transporter = getTransporter();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 Email attempt ${attempt}/${maxRetries}`);

        const requests = emailList.map((email) =>
          transporter.sendMail({
            from: sender,
            to: email.trim(),
            subject,

            ...(isHTML ? { html: content } : { text: content }),
          }),
        );

        await Promise.all(requests);

        console.log("✅ Email sent successfully");
        return;
      } catch (err) {
        console.error(`❌ Attempt ${attempt} failed:`, err.message);

        if (attempt === maxRetries) {
          throw err;
        }

        console.log(`⏳ Retrying in ${retryDelay / 1000}s...`);
        await delay(retryDelay);
      }
    }
  } catch (error) {
    console.error("🚨 Email permanently failed:", error.message);
  }
};

module.exports = sendEmailMessage;
