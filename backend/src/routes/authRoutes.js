const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/authController");

const router = express.Router();

router.post("/signup", ctrl.signupValidators, validate, ctrl.signup);
router.post("/login", ctrl.loginValidators, validate, ctrl.login);
router.post("/social", ctrl.socialLoginValidators, validate, ctrl.socialLogin);
router.post("/otp/request", [body("email").isEmail()], validate, ctrl.otpRequest);
router.post("/otp/verify", [body("email").isEmail(), body("otp").isLength({ min: 6, max: 6 })], validate, ctrl.otpVerify);
router.get("/me", auth, ctrl.me);

module.exports = router;
