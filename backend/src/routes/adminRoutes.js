const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const authorize = require("../middleware/role");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/adminController");

const router = express.Router();

router.use(auth, authorize("admin"));
router.get("/metrics", ctrl.getMetrics);
router.get("/dashboard", ctrl.getDashboardOverview);
router.get("/activity/recent", ctrl.getRecentActivity);
router.get("/applications/properties", ctrl.listPropertyApplications);
router.get("/applications/posting-access", ctrl.listPostingAccessApplications);
router.get("/users", ctrl.listUsers);
router.patch("/users/:id/posting-access", [body("enabled").isBoolean()], validate, ctrl.updatePostingAccess);
router.patch("/users/:id/status", [body("status").isIn(["active", "deactivated"])], validate, ctrl.toggleUserStatus);
router.get("/leads", ctrl.listAllLeads);
router.get("/customer-requests", ctrl.listCustomerRequests);
router.get("/lead-unlocks", ctrl.listLeadUnlocks);
router.get("/settings/lead-price", ctrl.getLeadPricing);
router.patch("/settings/lead-price", [body("value").isNumeric()], validate, ctrl.updateLeadPricing);
router.patch("/leads/:id/assign", [body("brokerId").isMongoId()], validate, ctrl.assignLeadToBroker);
router.patch(
  "/leads/:id/brokers/:brokerId/status",
  [body("status").isIn(["new", "contacted", "converted"])],
  validate,
  ctrl.updateLeadAssignmentStatus
);
router.get("/payments", ctrl.listAllPayments);
router.patch("/properties/:id/status", [body("status").isIn(["approved", "rejected", "pending"])], validate, ctrl.moderateProperty);

module.exports = router;
