const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-intent", auth, [body("planId").isMongoId()], validate, ctrl.createPaymentIntent);
router.post("/verify", auth, [body("paymentId").isMongoId()], validate, ctrl.verifyPayment);
router.get("/mine", auth, ctrl.myPayments);

module.exports = router;
