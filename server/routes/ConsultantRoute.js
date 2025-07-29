const express=require("express")
const router=express.Router()
const ConsultantController=require("../controller/ConsultantController")
router.get("/",ConsultantController.getAllConsultant)
router.get("/:id",ConsultantController.getConsultantByID)
router.put("/:id",ConsultantController.updateConsultant)
router.delete("/", ConsultantController.deleteConsultant)
router.post("/",ConsultantController.addConsultant)
module.exports=router