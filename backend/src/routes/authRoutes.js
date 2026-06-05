const express = require("express");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/authController");

const router = express.Router();

router.post("/signup", ctrl.signupValidators, validate, ctrl.signup);
router.post("/login", ctrl.loginValidators, validate, ctrl.login);
router.post("/social", ctrl.socialLoginValidators, validate, ctrl.socialLogin);
router.get("/me", auth, ctrl.me);

module.exports = router;
