const nodemailer = require("nodemailer");

const hasMailConfig =
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendMail = async ({ to, subject, text, html }) => {
  const fromEmail = process.env.EMAIL || process.env.SMTP_USER;

  if (!transporter) {
    console.log("Mail config missing. Simulated email:", { to, subject, text });
    return;
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Failed to send email via SMTP:", error.message);
    console.log("Simulated fallback for failed email:", { to, subject });
  }
};

module.exports = { sendMail };
