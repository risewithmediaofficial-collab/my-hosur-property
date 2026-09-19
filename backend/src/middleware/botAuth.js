/**
 * Bot API Key Authentication Middleware
 *
 * Validates the x-bot-api-key header on all /api/whatsapp/bot/* routes.
 * The key must match WHATSAPP_BOT_API_KEY environment variable.
 *
 * This is NOT a user-facing endpoint — it is called by MSG91's API Node.
 * Browser cookies and JWT tokens are NOT used here by design.
 */

const botAuth = (req, res, next) => {
  const BOT_API_KEY = process.env.WHATSAPP_BOT_API_KEY || "";

  if (!BOT_API_KEY) {
    // If no bot key is configured, reject all bot API calls for safety
    console.error("[bot-auth] WHATSAPP_BOT_API_KEY is not configured in .env");
    return res.status(503).json({
      success: false,
      message: "Bot API is not configured on this server.",
      code: "BOT_NOT_CONFIGURED",
    });
  }

  const providedKey =
    req.headers["x-bot-api-key"] ||
    req.query.botApiKey || // allow as query param too for MSG91 GET requests
    "";

  if (!providedKey || providedKey !== BOT_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid or missing bot API key.",
      code: "INVALID_BOT_KEY",
    });
  }

  next();
};

module.exports = botAuth;
