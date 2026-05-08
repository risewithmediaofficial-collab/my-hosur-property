export const generateHtmlEmail = ({ name, title, message, buttonText, buttonUrl }) => {
  const brandName = "MyHosurProperty";
  const primaryColor = "#1F2A44"; // Using the brand's 'ink' color
  const accentColor = "#8BC3E6"; // Using the brand's 'sage' color

  return `
    <div style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: ${primaryColor}; color: #ffffff; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${brandName}</h1>
          <p style="margin: 5px 0; opacity: 0.8;">Your Trusted Property Partner</p>
        </div>

        <!-- Hero Image -->
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=250&q=80"
          alt="Premium Property"
          style="width: 100%; display: block;"
        />

        <!-- Content -->
        <div style="padding: 30px; color: #333; line-height: 1.6;">
          <h2 style="color: ${primaryColor}; margin-top: 0;">Hello ${name || 'User'} 👋</h2>
          <p style="font-size: 16px; font-weight: bold; color: ${primaryColor};">${title || ''}</p>
          <div style="font-size: 15px; color: #555;">
            ${message.replace(/\n/g, '<br/>')}
          </div>

          <!-- CTA Button -->
          ${buttonText && buttonUrl ? `
          <div style="text-align: center; margin-top: 30px;">
            <a href="${buttonUrl}" style="background-color: ${accentColor}; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              ${buttonText}
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eeeeee;">
          <p style="margin: 0;">© 2026 ${brandName}. All rights reserved.</p>
          <p style="margin: 5px 0;">
            <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a> | 
            <a href="#" style="color: #999; text-decoration: underline;">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  `;
};
