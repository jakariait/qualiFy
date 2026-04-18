require("dotenv").config();
const nodemailer = require("nodemailer");

// Reusable transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
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
  content,
  subject = "New Notification",
  isHTML = false,
  maxRetries = 3, // ✅ How many times to retry
  retryDelay = 3000, // ✅ Wait time (ms)
) => {
  try {
    const { EMAIL_FROM, ALERT_EMAILS } = process.env;

    if (!ALERT_EMAILS) {
      console.error("Email recipients missing.");
      return;
    }

    const emailList = ALERT_EMAILS.split(",");

    const transporter = getTransporter();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 Email attempt ${attempt}/${maxRetries}`);

        const requests = emailList.map((email) =>
          transporter.sendMail({
            from: EMAIL_FROM,
            to: email.trim(),
            subject,

            ...(isHTML ? { html: content } : { text: content }),
          }),
        );

        await Promise.all(requests);

        console.log("✅ Email sent successfully");
        return; // Stop after success
      } catch (err) {
        console.error(`❌ Attempt ${attempt} failed:`, err.message);

        // Last try failed
        if (attempt === maxRetries) {
          throw err;
        }

        console.log(`⏳ Retrying in ${retryDelay / 1000}s...`);
        await delay(retryDelay);
      }
    }
  } catch (error) {
    console.error("🚨 Email permanently failed:", error.message);

    // Optional: save to DB / log file here
  }
};

module.exports = sendEmailMessage;
