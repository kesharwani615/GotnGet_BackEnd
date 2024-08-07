import query from "../helper/query.helper.js";
import ApiError from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"

export const createGroup = asyncHandler(async(req,res)=>{
    
 const groupName = req.body.group;
 const user = req.user;
 const groupMember = req.body.groupMember;
 let queryStr;

try {
     queryStr = `INSERT INTO groups (name, admin) VALUES ('${groupName}', ${user.id});`;
    
     const {insertId:id} = await query(queryStr);
    
     console.log("id:",id);
     
     queryStr = `INSERT INTO group_members (user_id, group_id) VALUES ;`.split('');
    
     groupMember?.forEach((item,index)=>{
        if(index == groupMember.length-1)
        queryStr.splice(-1, 0,`(${item},${id})`);
        else
        queryStr.splice(-1, 0,`(${item},${id}),`);
     })
    
     queryStr = queryStr.join('');
     
     const createdGrp = await query(queryStr);
    
     res.status(200).json({message:"Group has been created!"});
    
} catch (error) {
    throw new ApiError(500,"something went worng while creating group!");
}
})

export const SendMsgGrp = asyncHandler(async(req,res)=>{
       
  const senderId = req.user.id;
  const groupId = req.params.id;
  const message = req.body.message;
  let queryStr;

try {
      queryStr = `INSERT INTO groupmessages (SenderId, GroupId, Message)
        VALUES (${senderId}, ${groupId}, '${message}');`
    
      const {insertId:MessageId} = await query(queryStr);
              
      queryStr = ` INSERT INTO groupconversations (MessageId, GroupId)
        VALUES (${MessageId}, ${groupId});`
      
      await query(queryStr);
      
      res.status(200).json({message:"message send successfully in group"});
    
    } catch (error) {
    console.log("ERROR:",error);
    throw new ApiError(500,"Something went worng while sending message in group")
}
})

export const getMessage = asyncHandler(async(req,res)=>{
    try {
        const groupId = req.params.id;

        const queryStr = `select * from groupmessages where GroupId = ${groupId}`;

        const getGrpMsg = await query(queryStr);

        console.log(getGrpMsg);

        res.status(200).json({message:getGrpMsg});

    } catch (error) {
        throw new ApiError(500,"something went worng while fetching group message!")
    }
})