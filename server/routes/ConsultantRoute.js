const express=require("express")
const router=express.Router()
const ConsultantController=require("../controller/ConsultantController")
router.get("/",ConsultantController.getAllConsultant)
router.get("/:_id",ConsultantController.getConsultantByID)
router.put("/:_id",ConsultantController.updateConsultant)
router.delete("/:_id", ConsultantController.deleteConsultant)
router.post("/",ConsultantController.addConsultant)
module.exports=router