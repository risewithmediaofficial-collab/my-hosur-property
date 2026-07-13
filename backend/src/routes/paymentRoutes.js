const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadPaymentScreenshot } = require("../middleware/upload");
const ctrl = require("../controllers/paymentController");

const router = express.Router();

// router.post("/create-intent", auth, [body("planId").isMongoId()], validate, ctrl.createPaymentIntent);
// router.post("/verify", auth, [body("paymentId").isMongoId()], validate, ctrl.verifyPayment);
router.get("/mine", auth, ctrl.myPayments);

router.post(
  "/payment-request",
  auth,
  uploadPaymentScreenshot.single("screenshot"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("selectedPlan").notEmpty().withMessage("Selected plan is required"),
    body("amountPaid").isNumeric().withMessage("Amount paid must be a number"),
    body("transactionId").notEmpty().withMessage("Transaction ID is required"),
    body("paymentMethod").isIn(["UPI", "Google Pay", "PhonePe", "Paytm", "Bank Transfer", "Other"]).withMessage("Invalid payment method"),
    body("paymentDate").notEmpty().withMessage("Payment date is required"),
  ],
  validate,
  ctrl.createPaymentRequest
);

router.get("/payment-request/user", auth, ctrl.getUserPaymentRequests);

module.exports = router;

