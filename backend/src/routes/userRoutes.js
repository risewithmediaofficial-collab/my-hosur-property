const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/userController");

const router = express.Router();

router.get("/saved", auth, ctrl.getSavedProperties);
router.post("/saved/toggle", auth, [body("propertyId").isMongoId()], validate, ctrl.toggleSavedProperty);

module.exports = router;
