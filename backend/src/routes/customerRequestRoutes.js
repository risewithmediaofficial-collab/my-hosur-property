const express = require("express");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/customerRequestController");

const router = express.Router();

router.use(auth);
router.post("/", ctrl.requestValidators, validate, ctrl.createCustomerRequest);
router.get("/mine", ctrl.myCustomerRequests);
router.get("/for-agents", ctrl.listForAgents);
router.post("/:id/match-notification", ctrl.sendMatchNotification);
router.post("/:id/unlock-intent", ctrl.unlockLeadIntent);
router.post("/verify-unlock", ctrl.verifyLeadUnlock);
router.post("/buy-pack", ctrl.createLeadPackIntent);
router.post("/verify-pack", ctrl.verifyLeadPackPayment);
module.exports = router;
