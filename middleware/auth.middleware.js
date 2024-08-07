import query from "../helper/query.helper.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async(req,res,next)=>{

   try {

    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ','');

    if(!token) throw new Error('unauthorized request');
    
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN);
    
    if(!decodedToken) throw new Error('unauthorized request');
    
    const queryStr = `SELECT id,FULL_NAME,USER_NAME,EMAIL from users WHERE id=${decodedToken.id}`;
    
    const [user] =await query(queryStr);
    
    
    if(!user) throw new Error('unauthorized request');
    
    
    req.user = user;
    
    next();
    
   } catch (error) {
    throw new ApiError(401,error.message);
   }
})