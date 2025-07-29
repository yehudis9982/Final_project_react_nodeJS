const express=require("express")
const router=express.Router()
const TaskController=require("../controller/TaskController")
router.get("/",TaskController.getAllTask)
router.get("/:_id",TaskController.getTaskByID)
router.put("/:_id",TaskController.updateTask)
router.delete("/:_id", TaskController.deleteTask)
router.post("/",TaskController.addTask)
module.exports=router