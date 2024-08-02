import query from "../helper/query.helper.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js'

export const messagesSomeone = asyncHandler(async (req, res) => {
  const { id:ParticipantId } = req.params;

  const userId = req.user.id;

  const Message = req.body.message;

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
  
    if (!getConversation_Id) {
      queryStr = "INSERT INTO conversations () VALUES ()";
  
      const {insertId:getConversation_Id} = await query(queryStr);
  
      queryStr = `INSERT INTO conversation_participants (conversationId, userId)
      VALUES (${getConversation_Id}, ${ParticipantId}), (${getConversation_Id}, ${userId});`;
  
      conversation_participants = await query(queryStr);
  
      }
      queryStr = `INSERT INTO Messages (SenderId, ReceiverId, Message)
      VALUES (${ParticipantId}, ${userId}, '${Message}' );`;
  
      const {insertId:Message_id} = await query(queryStr);
  
      queryStr = `INSERT INTO conversation_messages (conversationId, messageId)
      VALUES (${getConversation_Id}, ${Message_id});`
  
      await query(queryStr);

      res.status(200).json({message:"message send successfully!"});
} catch (error) {
  console.log("error:",error);
  throw new ApiError(500,"something went worng while sending message!");
}
});

export const getUserMessage = asyncHandler(async (req,res)=>{
      
  const { id:ParticipantId } = req.params;

  const userId = req.user.id;     
  
  try {    
    const queryStr = `select * from messages where SenderId = ${ParticipantId} AND ReceiverId = ${userId}`;
    const messages = await query(queryStr);

    res.status(200).json({Allmessage:messages});
  } catch (error) {
    throw new ApiError(500,'Something went worng while fetch messages!');
  }
})

