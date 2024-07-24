import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { messagesSomeone } from "../controller/message.controller.js";

const router = Router();

    router.post('/singalUser/:id',verifyJwt,messagesSomeone)

export default router;