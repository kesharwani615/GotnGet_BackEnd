import query from "../helper/query.helper.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js'
import { socketConnected,io } from "../socket/socket.js";

export const messagesSomeone = asyncHandler(async (req, res) => { 
  const { id:ParticipantId } = req.params;

  const userId = req.user.id;

  // console.log(userId)

  const Message = req.body.message;

  // console.log('called:',ParticipantId,Message);

  let getConversation_Id, conversation_participants;

try {
    let queryStr = ` SELECT c.id
     FROM conversations c
     JOIN conversation_participants cp1 ON c.id = cp1.conversationId
     JOIN conversation_participants cp2 ON c.id = cp2.conversationId
     WHERE (cp1.userId = ${ParticipantId} AND cp2.UserId = ${userId})
        OR (cp1.userId = ${userId} AND cp2.UserId = ${ParticipantId})
     LIMIT 1;`;
  
    const [user_participants] = await query(queryStr);
  
    console.log("user_participants:",user_participants);
  
    if(user_participants){
      getConversation_Id = user_participants.id;
    }
  
    // console.log("getConversation:",getConversation_Id);
    if (!getConversation_Id) {
      queryStr = "INSERT INTO conversations () VALUES ()";
  
      const  {insertId} = await query(queryStr);

      getConversation_Id =insertId;
      // console.log('inserted:',getConversation_Id,insertId)
  
      queryStr = `INSERT INTO conversation_participants (conversationId, userId)
      VALUES (${getConversation_Id}, ${ParticipantId}), (${getConversation_Id}, ${userId});`;
  
      conversation_participants = await query(queryStr);
  
      }
      queryStr = `INSERT INTO Messages (SenderId, ReceiverId, Message)
      VALUES (${userId}, ${ParticipantId}, '${Message}' );`;
  
      const {insertId:Message_id} = await query(queryStr);
  
      queryStr = `INSERT INTO conversation_messages (conversationId, messageId)
      VALUES (${getConversation_Id}, ${Message_id});`
  
      await query(queryStr);

      //retrieve the message for send with socket io
      queryStr = `select * from messages where id = ${Message_id}`;
      
      const messageforSocketIo = await query(queryStr);
      
      const receiverId = socketConnected[ParticipantId];
      const senderId = socketConnected[userId];

      //for showing message in container, so emit it from backend and listen on frontend
      io.to(senderId).emit('new_Message',messageforSocketIo);
      io.to(receiverId).emit('new_Message',messageforSocketIo);

      res.status(200).json({message:"message send successfully!"});
} catch (error) {
  console.log("error:",error);
  throw new ApiError(500,"something went worng while sending message!");
}
});

export const getUserMessage = asyncHandler(async (req,res)=>{
      
  const { id:ParticipantId } = req.params;

  console.log("participant1:",ParticipantId);

  const userId = req.user.id;

  console.log("ParticipantId,userId:",ParticipantId,userId);

  let getConversation_Id;

  try {    
    // const queryStr = `select * from messages where SenderId = ${userId} AND ReceiverId = ${ParticipantId}`;
    let queryStr = ` SELECT c.id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversationId
    JOIN conversation_participants cp2 ON c.id = cp2.conversationId
    WHERE (cp1.userId = ${ParticipantId} AND cp2.UserId = ${userId})
       OR (cp1.userId = ${userId} AND cp2.UserId = ${ParticipantId})
    LIMIT 1;`;
    
    
    const [user_participants] = await query(queryStr);
  
    console.log("user_participants:",user_participants);

    // if(!user_participants) res.status(200).json({Allmessage:[]});
  
    if(user_participants){ 
      getConversation_Id = user_participants.id;
    }

    if(!getConversation_Id) return res.status(200).json({Allmessage:[]});
    
    queryStr = `select * from messages m join conversation_messages cm  on m.id = cm.messageId where cm.conversationId = ${getConversation_Id};`;

    const messages = await query(queryStr);

    // console.log("messages:",messages)
    res.status(200).json({Allmessage:messages.reverse()});
  } catch (error) {
    console.log("error:",error);
    throw new ApiError(500,'Something went worng while fetch messages!');
  }
});