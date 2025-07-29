const express=require("express")
const router=express.Router()
const TaskController=require("../controller/TaskController")
router.get("/",TaskController.getAllTask)
router.get("/:id",TaskController.getTaskByID)
router.put("/:id",TaskController.updateTask)
router.delete("/", TaskController.deleteTask)
router.post("/",TaskController.addTask)
module.exports=router