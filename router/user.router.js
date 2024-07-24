import { Router } from "express";
import { login, logout, register } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register",register);

router.post('/login',login);

router.post('/logout',verifyJwt,logout);

export default router;