const Task=require("../models/Task")
//כל משימות
const getAllTask=async(req,res)=>{
    const task=await Task.find({},{password:0}).sort({_id:1})
    res.json(task)
}
//הוספת משימה
const addTask=async (req,res)=>{
    const{title}=req.body
    if(!title){return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    if(await Task.findOne({title:title}).exec())
        return res.status(400).send("title needs to be uniqe!")
   const task=await Task.create({title})
   res.json(task)
 }
//מחיקת משימה
const deleteTask=async (req,res)=>{
    const{_id}=req.params
    const task=await Task.findById(_id).exec()
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    await task.deleteOne()
   res.json( `Task: ${task.title} id: ${task._id} deleted`)
}
//עדכון משימה
const updateTask=async(req,res)=> {
    const {title}=req.body
    if(!title) {return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    const{_id}=req.params    
    const task=await Task.findById(_id)
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    task.title=title
    await task.save();
    res.json(task)
}
//קבלת יועצת משימה
const getTaskByID=async(req,res)=>{
    const{_id}=req.params
    const task=await Task.findById(_id)
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    res.json(task)
}
module.exports={addTask,updateTask,getAllTask,getTaskByID,deleteTask}