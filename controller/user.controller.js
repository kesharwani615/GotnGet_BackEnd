import { comparePassword, Generate_Access_Refresh_Token, isUserExist, passwordHash, RegisterUser, validateEmail } from '../helper/method.helper.js';
import query from '../helper/query.helper.js';
import ApiError from '../utils/ApiError.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken';

export const register = asyncHandler (async (req,res)=>{
    
    const {fullName,email,username,password,gender} = req.body;

    if(!email || !username || !password) throw new ApiError(401,"Please enter all required fields")

    const validate = validateEmail(email);

    if(!validate) throw new ApiError(401,"Invalid email format");

    const existingUser = await isUserExist(username);

    if(existingUser.length > 0) throw new ApiError(404,"User already exists")

    const HashedPassword = await passwordHash(password);

    const IsUserRegistered = await RegisterUser({fullName,email,username,password:HashedPassword,gender} )

    if(!IsUserRegistered) throw new ApiError(404,"Internal server Error registration failed")
    
    res.send(201,{message:"User registered"});
})

export const login = asyncHandler (async (req,res)=>{

    const {email,username,password} = req.body;

    if(!email || !username || !password) throw new ApiError(401,"Please enter all required fields")

    const validate = validateEmail(email);

    if(!validate) throw new ApiError(401,"Invalid email format");

    const [user] = await isUserExist(username);

    if(!user) throw new ApiError(404,'User does not exist!');
   
    const IsPasswordCorrect =await comparePassword(password,user.PASSWORD);

    if(!IsPasswordCorrect) throw new ApiError(401,"Invalid credentials");

    const {accessToken,refreshToken} =await Generate_Access_Refresh_Token(user)

    const LoginedUser = {
        id: user.id,
        fullName: user.FULL_NAME,
        email: user.EMAIL,
        username: user.USER_NAME
    }
    const option = {
        httpOnly:false,
        secure:false
        }
    res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json({msg:"user logged in successfully",LoginedUser,accessToken, refreshToken });
})

export const logout = asyncHandler (async (req,res)=>{

    const user = req.user;

    const queryStr = `UPDATE users SET refreshToken = ${null} WHERE id =${user.id}`

    const updateUser =await query(queryStr);

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.send(200,{message:"User logged out successfully"});
})

export const refreshAccessToken = asyncHandler (async (req,res)=>{
    const incomingRefereshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if(!incomingRefereshToken) throw new ApiError(401,"unauthorized request");

    const decodedToken = jwt.verify(incomingRefereshToken,process.env.REFRESH_TOKEN);  

    const queryStr = `SELECT * from users WHERE id=${decodedToken.id}`;

    const user = query(queryStr);

    if(!user) throw new ApiError(401,"unauthorized request");

    if(incomingRefereshToken !== user.refreshToken) throw new ApiError(401,"refersh token expired or used");

    const {accessToken,refreshToken} =await Generate_Access_Refresh_Token(user)

    const LoginedUser = {
        id: user.id,
        fullName: user.FULL_NAME,
        email: user.EMAIL,
        username: user.USER_NAME
    }
    const option = {
        httpOnly:false,
        secure:false
        }
    res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json({msg:"Access Token is refreshed",LoginedUser,accessToken, refreshToken });
});

export const changeUserPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

    const LoggedInUser = req.user;

    if(!oldPassword || !newPassword) throw new ApiError("401","all fields are required!");

    const user = isUserExist(LoggedInUser.username);
    
    const IsPasswordCorrect = comparePassword(oldPassword,user.PASSWORD);

    if(!IsPasswordCorrect) throw new ApiError(401,'Invalid user password!');

    const HashedPassword = await passwordHash(newPassword);

    const queryStr = `UPDATE users SET PASSWORD = ${HashedPassword} WHERE id =${user.id}`

    const updateUser =await query(queryStr);

    if(!updateUser) throw new ApiError(500,"something went worng, while updating password");

    res.status(200).json({message:'user password updated!'})
})

export const getAllUser = asyncHandler(async (req,res)=>{

    const queryStr = `SELECT id,FULL_NAME,USER_NAME,GENDER,EMAIL from users;`;

    try {
    const Alluser =await query(queryStr);

    console.log("Alluser:",Alluser);

    res.status(200).json({users:Alluser})
    } catch (error) {
        throw new ApiError(500,"something went worng while fetching all users")
    }
})

