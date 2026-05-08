import emailjs from '@emailjs/browser';

/**
 * Initializes EmailJS with the public key.
 * This should ideally be called once, perhaps in App.jsx or here.
 */
export const initEmailJs = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (publicKey) {
    emailjs.init(publicKey);
  } else {
    console.warn("EmailJS Public Key is missing in environment variables.");
  }
};

/**
 * Sends a welcome/login email to the user.
 * 
 * @param {Object} userDetails - Must include { user_name, user_email }
 * @returns {Promise}
 */
export const sendLoginAlertEmail = async (userDetails) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_LOGIN;
  
  if (!serviceId || !templateId) {
    console.warn("EmailJS Service ID or Login Template ID is missing.");
    return Promise.resolve(); // Resolving so it doesn't break app flow
  }

  try {
    const response = await emailjs.send(serviceId, templateId, {
      user_name: userDetails.name,
      user_email: userDetails.email,
      login_time: new Date().toLocaleString(),
      // Add any other variables your EmailJS template expects
    });
    console.log("Login email sent successfully!", response);
    return response;
  } catch (error) {
    console.error("Failed to send login email:", error);
    throw error;
  }
};

/**
 * Sends a property alert notification email.
 * 
 * @param {Object} propertyDetails - Must include property info like title, location, etc.
 * @param {String} recipientEmail - Email of the admin or user to notify
 * @returns {Promise}
 */
export const sendPropertyAlertEmail = async (propertyDetails, recipientEmail) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_PROPERTY;

  if (!serviceId || !templateId) {
    console.warn("EmailJS Service ID or Property Template ID is missing.");
    return Promise.resolve();
  }

  try {
    const response = await emailjs.send(serviceId, templateId, {
      to_email: recipientEmail,
      property_title: propertyDetails.title,
      property_location: `${propertyDetails.location?.area}, ${propertyDetails.location?.city}`,
      property_price: propertyDetails.price,
      property_type: propertyDetails.propertyType,
      contact_name: propertyDetails.listingContact?.name || "User",
      action_url: `${window.location.origin}/dashboard` // Link to view it
    });
    console.log("Property alert email sent successfully!", response);
    return response;
  } catch (error) {
    console.error("Failed to send property alert email:", error);
    throw error;
  }
};
