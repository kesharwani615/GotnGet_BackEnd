import { Router } from "express";
import { changeUserPassword, getAllUser, login, logout, register } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register",register);

router.post('/login',login);

router.get('/fetchAllUsers',getAllUser);

router.post('/logout',verifyJwt,logout);

router.post('/logout',verifyJwt,changeUserPassword);


export default router;