import express from 'express';
import http from 'http'
import {Server} from 'socket.io';
import { chatModel } from './chat.schema.js';
import { connect } from './config.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:'*',
        methods:['GET','POST']
    }
})

io.on('connection',(socket)=>{
    console.log('connection is established')

    socket.on('join',async (data)=>{
        console.log('joinin start')
        socket.username = data

        try{
            const previousChat =await chatModel.find().sort({timeStamp:1}).limit(50);
            socket.emit('load-message',previousChat)
            console.log('broadcasting')
            socket.broadcast.emit('newUser',data)
            console.log(previousChat);

        }catch(err){
            console.log('join err: ',err)
        }

    })

    socket.on('create-new-message',async (message)=>{
        try{

            const newMessage = new chatModel({
                username:socket.username,
                message:message,
                timeStamp: new Date().toLocaleTimeString([],{ hour: "2-digit", minute: "2-digit" })
            })

            await newMessage.save();

            const messages = await chatModel.find().sort({timeStamp:1}).limit(50);

            socket.broadcast.emit('message',messages);

           

        }catch(err){
            // console.log('create-new-message err: ',err)
        }
    })

    socket.on('disconnect',()=>{
        io.emit('userLeft',socket.username);
        console.log('disconnected')
    })
    
})


server.listen(3000,()=>{
    console.log('app is listening at 3000')
    connect()
})


