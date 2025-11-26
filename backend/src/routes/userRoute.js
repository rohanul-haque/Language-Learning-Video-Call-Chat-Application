import express from "express";
import {
    acceptFriendRequest,
    getFriendRequests,
    getMyFriends,
    getRecommendedUsers,
    sendFriendRequest,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getRecommendedUsers);
router.get("/friends", authMiddleware, getMyFriends);
router.post("/friend-request/:id", authMiddleware, sendFriendRequest);
router.put("/friend-request/:id/accept", authMiddleware, acceptFriendRequest);
router.get("/friend-requests", authMiddleware, getFriendRequests);

export default router;
