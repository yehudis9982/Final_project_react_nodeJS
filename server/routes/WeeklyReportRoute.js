const express=require("express")
const router=express.Router()
const WeeklyReportController=require("../controller/WeeklyReportController")
router.get("/",WeeklyReportController.getAllWeeklyReport)
router.get("/:_id",WeeklyReportController.getWeeklyReportByID)
router.put("/:_id",WeeklyReportController.updateWeeklyReport)
router.delete("/", WeeklyReportController.deleteWeeklyReport)
router.post("/",WeeklyReportController.addWeeklyReport)
module.exports=router