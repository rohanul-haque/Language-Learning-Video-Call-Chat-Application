import express from "express";
import { getStreamToken } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/token", authMiddleware, getStreamToken);

export default router;
