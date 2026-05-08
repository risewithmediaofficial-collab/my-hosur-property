#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { verifyMailConnection } = require("./src/utils/sendEmail");
const sendEmail = require("./src/utils/sendEmail");
const { baseEmailLayout } = require("./src/utils/emailTemplates");

const testEmail = async () => {
  const recipientEmail = process.argv[2];

  console.log("\n" + "=".repeat(60));
  console.log("MyHosurProperty SMTP Mail Test");
  console.log("=".repeat(60) + "\n");

  if (!recipientEmail) {
    console.error("Error: Please provide a recipient email address");
    console.log("\nUsage: node testEmail.js <email@example.com>\n");
    process.exit(1);
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.EMAIL_FROM;

  console.log("Checking SMTP configuration...\n");
  console.log(`  SMTP_HOST:   ${smtpHost ? "Set" : "Missing"}`);
  console.log(`  SMTP_PORT:   ${smtpPort ? "Set" : "Missing"}`);
  console.log(`  SMTP_USER:   ${smtpUser ? "Set" : "Missing"}`);
  console.log(`  SMTP_PASS:   ${smtpPass ? "Set" : "Missing"}`);
  console.log(`  EMAIL_FROM:  ${emailFrom ? "Set" : "Missing"}`);

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailFrom) {
    console.error("\nSMTP configuration incomplete");
    console.log("\nRecommended provider: Resend SMTP");
    console.log("Docs: https://resend.com/docs/send-with-smtp");
    console.log("\nAdd these to backend/.env:");
    console.log("  SMTP_HOST=smtp.resend.com");
    console.log("  SMTP_PORT=587");
    console.log("  SMTP_USER=resend");
    console.log("  SMTP_PASS=re_xxxxxxxxx");
    console.log("  EMAIL_FROM=MyHosurProperty <onboarding@yourdomain.com>\n");
    process.exit(1);
  }

  console.log("\nVerifying SMTP connection...");
  const verified = await verifyMailConnection();
  if (!verified) {
    console.error("SMTP verification failed\n");
    process.exit(1);
  }

  const testContent = `
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#1E293B;">
      SMTP Mail Test Success
    </h2>
    <div style="width:40px;height:3px;background:#2563EB;border-radius:2px;margin:12px 0 20px;"></div>

    <p style="margin:0 0 16px;color:#64748B;line-height:1.7;">
      Your MyHosurProperty mail system is configured correctly.
    </p>

    <div style="background:#EFF6FF;border-left:4px solid #2563EB;padding:16px;margin:24px 0;border-radius:4px;">
      <p style="margin:0;color:#2563EB;font-weight:600;font-size:14px;">SMTP Details</p>
      <p style="margin:8px 0 0;color:#1E293B;font-size:14px;">
        <strong>Host:</strong> ${smtpHost}<br/>
        <strong>Port:</strong> ${smtpPort}<br/>
        <strong>Sent at:</strong> ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  const htmlContent = baseEmailLayout(testContent, "SMTP System Test");

  console.log(`\nSending test email to: ${recipientEmail}\n`);

  const result = await sendEmail({
    to: recipientEmail,
    subject: "MyHosurProperty SMTP Mail Test",
    html: htmlContent,
    text: "Your MyHosurProperty mail system is configured correctly.",
  });

  if (!result) {
    console.error("Email send failed");
    process.exit(1);
  }

  console.log("Email sent successfully\n");
  process.exit(0);
};

testEmail();
