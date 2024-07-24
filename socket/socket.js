import express from 'express';
import { Server } from "socket.io";
import http from "http";

export const app = express();
export const server = http.createServer(app);


const socketConnected = new Set();

const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket)=>{
console.log("connected: ",socket.id);
socketConnected.add(socket.id);

socket.on('disconnect', ()=>{
console.log("disconnected: ",socket.id)

socketConnected.delete(socket.id);
})
})