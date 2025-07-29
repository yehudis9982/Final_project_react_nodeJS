const express=require("express")
const router=express.Router()
const KindergartenController=require("../controller/KindergartenController")
router.get("/",KindergartenController.getAllKindergarten)
router.get("/:id",KindergartenController.getKindergartenByID )
router.put("/:id",KindergartenController.updateKindergarten)
router.delete("/", KindergartenController.deleteKindergarten)
router.post("/",KindergartenController.addKindergarten)
module.exports=router