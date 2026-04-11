const express = require("express");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/adminAuthController");

const router = express.Router();

router.post("/login", ctrl.adminLoginValidators, validate, ctrl.adminLogin);

module.exports = router;
