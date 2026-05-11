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
  if (!hasWelcomeTemplateConfig()) {
    console.warn("[emailjs] Welcome template config missing. Skipping EmailJS send.");
    return null;
  }

  const { publicKey, privateKey, serviceId, welcomeTemplateId } = getEmailJsConfig();
  const siteUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const dashboardUrl = `${siteUrl.replace(/\/$/, "")}/dashboard`;
  const loginUrl = `${siteUrl.replace(/\/$/, "")}/auth`;
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "support@myhosurproperty.com";
  const userName = user.name || "Member";
  const firstName = userName.trim().split(/\s+/)[0] || userName;
  const roleLabel = getRoleLabel(user.role);
  const subject = `Welcome ${firstName} to MyHosurProperty`;

  const templateParams = {
    to_name: userName,
    to_email: user.email,
    email: user.email,
    to: user.email,
    recipient_email: user.email,
    reply_to: user.email,
    first_name: firstName,
    user_name: userName,
    recipient_name: userName,
    user_email: user.email,
    user_role: user.role || "buyer",
    role_label: roleLabel,
    signup_method: providerLabel,
    app_name: "MyHosurProperty",
    subject,
    welcome_title: "Your account is ready",
    message:
      `Hi ${firstName}, thank you for ${providerLabel}. Your ${roleLabel} account is ready to use. ` +
      "You can now browse listings, post properties, and connect with buyers or sellers on MyHosurProperty.",
    website_url: siteUrl,
    login_url: loginUrl,
    dashboard_url: dashboardUrl,
    support_email: supportEmail,
  };

  try {
    const response = await emailjs.send(serviceId, welcomeTemplateId, templateParams, {
      publicKey,
      privateKey,
    });

    console.log(`[emailjs] Welcome email sent | status: ${response.status} | to: ${user.email}`);
    return response;
  } catch (error) {
    console.error("[emailjs] Welcome email failed:", error?.text || error?.message || error);
    return null;
  }
};

module.exports = {
  sendWelcomeTemplateEmail,
  hasWelcomeTemplateConfig,
};
