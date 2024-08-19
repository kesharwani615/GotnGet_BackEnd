import express from 'express';
import { Server } from "socket.io";
import http from "http";

export const app = express();
export const server = http.createServer(app);


export const socketConnected = {};

export const roomSocketGroup = {};

let SelectGroupForMessaging_Name;

export const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket)=>{
console.log("connected: ",socket.id);

const userId = socket.handshake.query.userId;

if(!userId) return;

socketConnected[userId] = socket.id;

socket.on('join_room', (id) => {
    socket.join(id);
    console.log(id,"  ",socket.id);
    SelectGroupForMessaging_Name=id;
    console.log("roomIdforBackend:",SelectGroupForMessaging_Name);
    try {            
    // Store the mapping between room ID and socket ID
    roomSocketGroup[SelectGroupForMessaging_Name]=socket.id;
    console.log("roomSocketGroup:",roomSocketGroup);
    } catch (error) {
    console.error('Error setting room ID:', error);
}
});

socket.on("send_MessageSocket",(data)=>{
    console.log("data:",data);
    console.log(roomSocketGroup[SelectGroupForMessaging_Name]);
    console.log(SelectGroupForMessaging_Name);
    
    socket.to(SelectGroupForMessaging_Name).emit("receive-message",data);
});

socket.on('disconnect', ()=>{
console.log("disconnected: ",socket.id)

// console.log("socketConnected1:",socketConnected);

const findKeyAndDelete = (obj,value) =>{
    return Object.keys(obj).find((key)=>obj[key] === value);
}

const key = findKeyAndDelete(socketConnected,socket.id);

delete socketConnected[key]

// console.log("socketConnected2:",socketConnected);


})
})