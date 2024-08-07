import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createGroup, getMessage, SendMsgGrp } from "../controller/group.controller.js";

const router = Router();

router.post('/groupCreator',verifyJwt,createGroup)

router.post('/sendGroupMsg/:id',verifyJwt,SendMsgGrp)

router.get('/getGrouoMsg/:id',verifyJwt,getMessage)

export default router;