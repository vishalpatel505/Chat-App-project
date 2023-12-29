import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    username:String,
    message:String,
    timeStamp:String
})

export const chatModel = mongoose.model('chats',chatSchema);

export const getMessages = async ()=>{
    return await chatModel.find().sort({timeStamp:1}).limit(50);
}