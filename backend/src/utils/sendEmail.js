const nodemailer = require("nodemailer");

let transporter;
let verifyAttempted = false;

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

const normalizeRecipients = (to) => {
  const recipients = Array.isArray(to) ? to : [to];

  return recipients
    .map((value) => String(value || "").trim().toLowerCase())
    .filter((value, index, list) => value && list.indexOf(value) === index);
};

const getMailConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || user;

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: port === 465,
  };
};

const hasMailConfig = () => {
  const { host, port, user, pass, from } = getMailConfig();
  return Boolean(host && port && user && pass && from);
};

const getTransporter = () => {
  if (!hasMailConfig()) {
    return null;
  }

  if (!transporter) {
    const { host, port, user, pass, secure } = getMailConfig();

    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return transporter;
};

const verifyMailConnection = async () => {
  const mailer = getTransporter();
  if (!mailer || verifyAttempted) {
    return Boolean(mailer);
  }

  verifyAttempted = true;

  try {
    await mailer.verify();
    console.log("[mail] SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("[mail] SMTP verification failed:", error.message);
    return false;
  }
};

const sendEmail = async ({ to, subject, html, text, cc, bcc, replyTo }) => {
  try {
    if (!subject || (!html && !text)) {
      throw new Error("Missing required fields: subject and html or text");
    }

    const recipients = normalizeRecipients(to);
    const validRecipients = recipients.filter(isValidEmail);
    if (validRecipients.length === 0) {
      throw new Error("Missing required field: valid recipient email");
    }

    const mailer = getTransporter();
    if (!mailer) {
      console.warn("[mail] SMTP config missing. Skipping email send.");
      return null;
    }

    const { from } = getMailConfig();
    const info = await mailer.sendMail({
      from,
      to: validRecipients.length === 1 ? validRecipients[0] : validRecipients.join(", "),
      cc,
      bcc,
      replyTo,
      subject,
      text: text || undefined,
      html: html || undefined,
    });

    console.log(`[mail] Email sent | Message ID: ${info.messageId} | To: ${validRecipients.join(", ")}`);
    return info;
  } catch (error) {
    console.error("[mail] Send failed:", error.message);
    return null;
  }
};

const sendBulkEmail = async ({ to, subject, html, text }) => {
  try {
    const recipients = normalizeRecipients(to).filter(isValidEmail);
    if (recipients.length === 0) {
      throw new Error("Recipients must be a non-empty array");
    }

    const results = [];
    for (const email of recipients) {
      const result = await sendEmail({ to: email, subject, html, text });
      results.push(result);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`[mail] Bulk send complete | Sent: ${results.filter(Boolean).length}/${recipients.length}`);
    return results;
  } catch (error) {
    console.error("[mail] Bulk send failed:", error.message);
    return [];
  }
};

module.exports = sendEmail;
module.exports.sendBulkEmail = sendBulkEmail;
module.exports.verifyMailConnection = verifyMailConnection;
