const express=require("express")
const router=express.Router()
const TaskController=require("../controller/TaskController")
const verifyJWT=require("../middleware/verifyJWT")
router.use(verifyJWT)
router.get("/",TaskController.getAllTask)
router.get("/:_id",TaskController.getTaskByID)
router.put("/:_id",TaskController.updateTask)
router.delete("/:_id", TaskController.deleteTask)
router.post("/",TaskController.addTask)
router.patch("/complete/:_id", TaskController.markTaskCompleted);
module.exports=router