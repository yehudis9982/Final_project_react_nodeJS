const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const SettingsController = require("../Controller/SettingsController");

router.use(verifyJWT);
router.get("/", SettingsController.getSettings);
router.put("/", SettingsController.updateSettings);

module.exports = router;
