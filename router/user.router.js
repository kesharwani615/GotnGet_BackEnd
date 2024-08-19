import { Router } from "express";
import { changeUserPassword, ForgotPassword, getAllUser, login, logout, register, resetPassword } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
// import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.post("/register",register);

router.post('/login',login);

router.get('/fetchAllUsers',verifyJwt,getAllUser);

router.get('/logout',verifyJwt,logout);

router.post('/changePassword',verifyJwt,changeUserPassword);

router.post('/forgotPassword',ForgotPassword);

router.post('/resetPassword/:id/:tokenForGotPassword',resetPassword);

export default router;