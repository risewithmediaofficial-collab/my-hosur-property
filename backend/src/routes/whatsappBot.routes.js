/**
 * WhatsApp Bot Routes
 *
 * All routes under /api/whatsapp/bot are protected by botAuth middleware.
 * These endpoints are called by MSG91's API Node — NOT by the browser.
 *
 * Authentication: x-bot-api-key header (WHATSAPP_BOT_API_KEY in .env)
 * User identity:  phone number extracted from request (query param or body)
 *
 * Route summary:
 *   GET  /api/whatsapp/bot/properties/search   - Search approved properties
 *   GET  /api/whatsapp/bot/my-properties        - Owner's own properties
 *   GET  /api/whatsapp/bot/my-enquiries         - User's own enquiries
 *   GET  /api/whatsapp/bot/profile              - User's sanitized profile
 *   POST /api/whatsapp/bot/property             - Submit a property (pending)
 *   POST /api/whatsapp/bot/support              - Submit a support request
 */

const express = require("express");
const router = express.Router();
const botAuth = require("../middleware/botAuth");
const {
  searchProperties,
  getMyProperties,
  getMyEnquiries,
  getProfile,
  submitProperty,
  submitSupportRequest,
} = require("../controllers/whatsappBot.controller");

// Apply bot auth to all routes in this router
router.use(botAuth);

// ── GET endpoints ────────────────────────────────────────────────────────────
router.get("/properties/search", searchProperties);
router.get("/my-properties", getMyProperties);
router.get("/my-enquiries", getMyEnquiries);
router.get("/profile", getProfile);

// ── POST endpoints ───────────────────────────────────────────────────────────
router.post("/property", submitProperty);
router.post("/support", submitSupportRequest);

module.exports = router;
