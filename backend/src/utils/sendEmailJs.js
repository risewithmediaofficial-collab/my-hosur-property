const emailjs = require("@emailjs/nodejs");

const ROLE_LABELS = {
  buyer: "Buyer / Tenant",
  customer: "Customer",
  seller: "Property Seller",
  agent: "Agent",
  broker: "Broker",
  builder: "Builder",
  admin: "Admin",
};

const getEmailJsConfig = () => ({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
  serviceId: process.env.EMAILJS_SERVICE_ID,
  welcomeTemplateId: process.env.EMAILJS_TEMPLATE_WELCOME,
});

const getRoleLabel = (role) => ROLE_LABELS[role] || role || "Member";

const hasWelcomeTemplateConfig = () => {
  const { publicKey, privateKey, serviceId, welcomeTemplateId } = getEmailJsConfig();
  return Boolean(publicKey && privateKey && serviceId && welcomeTemplateId);
};

const sendWelcomeTemplateEmail = async (user, providerLabel = "signing up") => {
  // Guard: no email address — nothing to send to
  if (!user.email || String(user.email).trim().length === 0) {
    console.warn("[emailjs] Skipping welcome email — user has no email address.");
    return null;
  }

  const { publicKey, privateKey, serviceId, welcomeTemplateId } = getEmailJsConfig();

  // Debug: log config presence (never log actual key values in production)
  console.log("[emailjs] Config check →", {
    hasPublicKey: Boolean(publicKey),
    hasPrivateKey: Boolean(privateKey),
    serviceId: serviceId || "(missing)",
    welcomeTemplateId: welcomeTemplateId || "(missing)",
    toEmail: user.email,
  });

  if (!hasWelcomeTemplateConfig()) {
    console.warn("[emailjs] Welcome template config missing — check EMAILJS_* env vars. Skipping send.");
    return null;
  }

  const siteUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const dashboardUrl = `${siteUrl.replace(/\/$/, "")}/dashboard`;
  const loginUrl = `${siteUrl.replace(/\/$/, "")}/auth`;
  const supportEmail = process.env.SUPPORT_EMAIL || "myhosurproperty.mhp@gmail.com";
  const userName = user.name || "Member";
  const firstName = userName.trim().split(/\s+/)[0] || userName;
  const roleLabel = getRoleLabel(user.role);
  const subject = `Welcome ${firstName} to MyHosurProperty`;

  // These params cover all common EmailJS template variable names.
  // In your EmailJS template, set the "To Email" field to {{to_email}}.
  const templateParams = {
    to_name: userName,
    to_email: user.email,        // ← EmailJS uses this as recipient address
    email: user.email,
    to: user.email,
    recipient_email: user.email,
    reply_to: supportEmail,
    from_name: "MyHosurProperty",
    from_email: supportEmail,
    first_name: firstName,
    user_name: userName,
    recipient_name: userName,
    user_email: user.email,
    user_role: user.role || "buyer",
    role_label: roleLabel,
    signup_method: providerLabel,
    app_name: "MyHosurProperty",
    subject,
    welcome_title: "Your account is ready!",
    message:
      `Hi ${firstName}, thank you for joining MyHosurProperty! Your ${roleLabel} account is now active. ` +
      "You can now browse listings, post properties, and connect with buyers or sellers.",
    website_url: siteUrl,
    login_url: loginUrl,
    dashboard_url: dashboardUrl,
    support_email: supportEmail,
  };

  try {
    console.log(`[emailjs] Sending welcome email → serviceId: ${serviceId}, templateId: ${welcomeTemplateId}, to: ${user.email}`);
    const response = await emailjs.send(serviceId, welcomeTemplateId, templateParams, {
      publicKey,
      privateKey,
    });
    console.log(`[emailjs] ✅ Welcome email sent | status: ${response.status} | text: ${response.text} | to: ${user.email}`);
    return response;
  } catch (error) {
    // EmailJS errors carry the detail in error.text
    const detail = error?.text || error?.message || JSON.stringify(error);
    console.error(`[emailjs] ❌ Welcome email FAILED to ${user.email} | error: ${detail}`);
    return null;
  }
};

module.exports = {
  sendWelcomeTemplateEmail,
  hasWelcomeTemplateConfig,
};
