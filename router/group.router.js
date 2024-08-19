import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createGroup, getAllGroup, getMessage, SendMsgGrp } from "../controller/group.controller.js";

const router = Router();

router.post('/groupCreator',verifyJwt,createGroup)

router.get('/getAllGroups',verifyJwt,getAllGroup)

router.post('/sendGroupMsg/:id',verifyJwt,SendMsgGrp)

router.get('/getGroupMsg/:id',verifyJwt,getMessage)


export default router;