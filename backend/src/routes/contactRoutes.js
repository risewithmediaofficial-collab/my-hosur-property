const express = require("express");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/contactController");

const router = express.Router();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_TRACKED_IPS = 5000;
const requestWindows = new Map();

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const contactRateLimit = (req, res, next) => {
  const now = Date.now();
  const ip = getClientIp(req);

  if (requestWindows.size > MAX_TRACKED_IPS) {
    for (const [key, entry] of requestWindows.entries()) {
      if (now - entry.windowStart >= WINDOW_MS) {
        requestWindows.delete(key);
      }
    }
    if (requestWindows.size > MAX_TRACKED_IPS) {
      requestWindows.clear();
    }
  }

  const current = requestWindows.get(ip);
  if (!current || now - current.windowStart >= WINDOW_MS) {
    requestWindows.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      ok: false,
      success: false,
      message: "Too many enquiries sent. Please wait a minute and try again.",
    });
  }

  current.count += 1;
  return next();
};

router.post("/", contactRateLimit, ctrl.contactValidators, validate, ctrl.submitContactForm);

module.exports = router;

