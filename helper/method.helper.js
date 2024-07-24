import bcrypt from "bcrypt";
import db from "../database/db.database.js";
import ApiError from "../utils/ApiError.js";
import query from "./query.helper.js";
import jwt from "jsonwebtoken";

//  {ACCESS_TOKEN,REFRESH_TOKEN}  process.env;

export const validateEmail = (email) => {
  // Regular expression for basic email validation
  const emailRegex = /^\S+@\S+\.\S{2,}$/;
  return emailRegex.test(email);
};

export const passwordHash = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const isUserExist = async (username) => {

  const queryStr = `SELECT * FROM users WHERE LOWER(USER_NAME) = LOWER(${db.escape(
    username
  )});`;
  try {
    const result = await query(queryStr);

    return result;
  } catch (error) {
    console.log("err:", error);
    throw new ApiError(500, "internal server error " + error);
  }
};

export const RegisterUser = async (user) => {
//   console.log(user);

  const { fullName, email, username, password, gender } = user;

//   console.log(fullName, email, username, password, gender);

  const queryStr = `INSERT INTO users (FULL_NAME, USER_NAME, PASSWORD, GENDER, EMAIL) VALUES ('${fullName}','${username}', '${password}', '${gender}','${email}');`;

  try {
    const result = await query(queryStr);
    // console.log("result:", result);

    return result.affectedRows > 0;
  } catch (error) {
    // console.log("err:", error);
    throw new ApiError(500, "internal server error ");
  }
};

export const comparePassword = async (password, hashedPassword) => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
};

export const Generate_Access_Token = async (user)=>{
    return jwt.sign(user , process.env.Access_Token,{expiresIn:'1h'});
}

export const Generate_Refresh_Token = async (user)=>{
    return jwt.sign(user , process.env.Access_Token,{expiresIn:'1d'});
}

export const Generate_Access_Refresh_Token = async (user) => {
    const accessToken = await Generate_Access_Token(user);
    const refreshToken = await Generate_Refresh_Token(user);

    const queryStr = `UPDATE users SET refreshToken = '${refreshToken}' WHERE id = '${user.id}'`;

    await query(queryStr);

    return {accessToken, refreshToken};
}