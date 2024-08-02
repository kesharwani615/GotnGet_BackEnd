import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getUserMessage, messagesSomeone } from "../controller/message.controller.js";

const router = Router();

    router.post('/sendSingalUserMsg/:id',verifyJwt,messagesSomeone)

    router.get('/getSingalUserMsg/:id',verifyJwt,getUserMessage)

export default router;