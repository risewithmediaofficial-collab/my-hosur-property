const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/leadController");

const router = express.Router();

router.post(
  "/",
  auth,
  [body("propertyId").isMongoId(), body("message").optional().trim(), body("intentType").optional().isIn(["contact", "callback", "visit"])],
  validate,
  ctrl.createLead
);
router.get("/mine", auth, ctrl.myLeads);
router.get("/marketplace", auth, ctrl.brokerMarketplace);
router.get("/check/:propertyId", auth, ctrl.checkMyLeadStatus);
router.post("/:id/purchase", auth, ctrl.purchaseLead);
router.patch("/:id/status", auth, [body("status").isIn(["new", "contacted", "converted"])], validate, ctrl.updateBrokerLeadStatus);
router.patch("/:id/approval", auth, [body("status").isIn(["approved", "rejected"])], validate, ctrl.updateLeadStatus);
router.post("/:id/unlock-inbox", auth, ctrl.unlockInboxLead);

module.exports = router;
