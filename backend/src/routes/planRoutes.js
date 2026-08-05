const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/planController");

const router = express.Router();

router.get("/", ctrl.getPlans);
router.post(
  "/activate-free",
  auth,
  [body("planName").optional().trim().notEmpty().withMessage("Plan name is required")],
  validate,
  ctrl.activateFreePlan
);

module.exports = router;
