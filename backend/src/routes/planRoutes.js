const express = require("express");
const ctrl = require("../controllers/planController");

const router = express.Router();

router.get("/", ctrl.getPlans);

module.exports = router;
