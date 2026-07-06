const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/userController");

const router = express.Router();

router.get("/saved", auth, ctrl.getSavedProperties);
router.post("/saved/toggle", auth, [body("propertyId").isMongoId()], validate, ctrl.toggleSavedProperty);
router.put(
  "/profile",
  auth,
  [
    body("email").isEmail().normalizeEmail(),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("role").isIn(["seller", "agent", "broker", "builder"]).withMessage("Invalid role option"),
  ],
  validate,
  ctrl.updateProfile
);

module.exports = router;
