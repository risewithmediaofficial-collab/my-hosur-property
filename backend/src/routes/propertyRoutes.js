const express = require("express");
const auth = require("../middleware/auth");
const authOptional = require("../middleware/authOptional");
const { uploadPropertyAssets } = require("../middleware/upload");
const validate = require("../middleware/validate");
const ctrl = require("../controllers/propertyController");

const router = express.Router();

router.get("/", authOptional, ctrl.listProperties);
router.get("/featured", ctrl.featured);
router.get("/seo-listings", ctrl.seoListings);
router.get("/mine", auth, ctrl.myProperties);
router.post("/upload", auth, uploadPropertyAssets.array("files", 5), ctrl.uploadAssets);
router.post("/:id/promote", auth, ctrl.promoteProperty);
router.get("/:id", authOptional, ctrl.getPropertyById);
router.post("/", auth, ctrl.propertyValidators, validate, ctrl.createProperty);
router.put("/:id", auth, ctrl.propertyValidators, validate, ctrl.updateProperty);
router.delete("/:id", auth, ctrl.deleteProperty);

module.exports = router;
