const Task=require("../models/Task")
//כל משימות
const getAllTask=async(req,res)=>{
    let task
    if(req.consultant.roles==="Supervisor")
         task=await Task.find({},{password:0}).sort({_id:1})
    else
        task=await Task.find({consultant:req.consultant._id},{password:0}).sort({_id:1})

    res.json(task)
}
//הוספת משימה
const addTask=async (req,res)=>{
    const{title,body}=req.body
    if(!title){return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    if(await Task.findOne({title:title}).exec())
        return res.status(400).send("title needs to be uniqe!")
    if(req.consultant.roles==="Supervisor"){
        const task=await Task.create({title,body})
        res.json(task)
    }
    else{
        const task=await Task.create({title,consultant:req.consultant._id,body})
        res.json(task) 
    }
   
 }
//מחיקת משימה
const deleteTask=async (req,res)=>{
    let task
    const{_id}=req.params
    if(req.consultant.roles==="Supervisor"){
         task=await Task.findById(_id).exec()
    }
    else
        task=await Task.findById(_id,{consultant:req.consultant._id}).exec()
   
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    await task.deleteOne()
   res.json( `Task: ${task.title} id: ${task._id} deleted`)
}
//עדכון משימה
const updateTask=async(req,res)=> {
    const {title,body,consultant}=req.body
    if(!title) {return res.status(400).json({"message":"you didnt sent everything that is required!"})}
    const{_id}=req.params    
    const task=await Task.findById(_id)
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    task.title=title
    task.body=body
    task.consultant=req.consultant.roles==="Supervisor"?consultant:req.consultant._id
    await task.save();
    res.json(task)
}
//קבלת בודדת משימה
const getTaskByID=async(req,res)=>{
    const{_id}=req.params
    let task
    if(req.consultant.roles==="Supervisor"){
        task=await Task.findById(_id)
    }
    else
         task=await Task.findById(_id)
    if(!task){ return res.status(400).json({"message":"no task found!"})}
    res.json(task)
}
module.exports={addTask,updateTask,getAllTask,getTaskByID,deleteTask}