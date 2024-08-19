import express from 'express';
import dotenv from 'dotenv';
import connection  from './database/db.database.js';
import cookieParser from 'cookie-parser';
import { app,server } from './socket/socket.js';
import cors from 'cors';

dotenv.config({
    path: './env'
});

const PORT = process.env.PORT ;

app.use(cors({origin:'*'}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('Hello World!');
})
import UserRouter from './router/user.router.js';
import MessageRouter from './router/message.router.js';
import GroupRouter from './router/group.router.js'

app.use('/api/v1/users', UserRouter);

app.use('/api/v1/messages', MessageRouter);

app.use('/api/v1/group', GroupRouter);

server.listen(PORT,()=>{
    console.log('Server is listening on port', process.env.PORT)
    connection.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
       
        console.log('connected as id ' + connection.threadId);
      });
})
