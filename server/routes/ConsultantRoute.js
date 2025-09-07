const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ConsultantController = require("../Controller/ConsultantController");
const authController = require("../Controller/authController");
const verifyJWT = require("../middleware/verifyJWT");

// מידלוור ולידציה לפרמטרי ObjectId
const validateObjectIdParam = (param) => (req, res, next) => {
  const v = req.params[param];
  if (!mongoose.isValidObjectId(v)) {
    return res.status(400).json({ message: "invalid id" });
  }
  next();
};

// רישום ללא JWT
router.post("/", authController.register);

// כל השאר מוגן
router.use(verifyJWT);

// חשוב: /me לפני /:_id
router.get("/me", ConsultantController.getMe);

// הערות מפקחת ליועצת
router.get("/:_id/notes", validateObjectIdParam("_id"), ConsultantController.getSupervisorNotes);
router.post("/:_id/notes", validateObjectIdParam("_id"), ConsultantController.addSupervisorNote);
router.put(
  "/:_id/notes/:noteId",
  validateObjectIdParam("_id"),
  validateObjectIdParam("noteId"),
  ConsultantController.updateSupervisorNote
);
router.delete(
  "/:_id/notes/:noteId",
  validateObjectIdParam("_id"),
  validateObjectIdParam("noteId"),
  ConsultantController.deleteSupervisorNote
);

// שאר המסלולים
router.get("/", ConsultantController.getAllConsultant);
router.get("/:_id", validateObjectIdParam("_id"), ConsultantController.getConsultantByID);
router.put("/work-schedule", ConsultantController.updateWorkSchedule);
router.put("/:_id", validateObjectIdParam("_id"), ConsultantController.updateConsultant);
router.put("/my-kindergartens", ConsultantController.updateConsultantKindergartens);
router.delete("/:_id", validateObjectIdParam("_id"), ConsultantController.deleteConsultant);

module.exports = router;
