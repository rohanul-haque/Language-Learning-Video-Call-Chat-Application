import express from "express";
import {
  getUserData,
  isOnboarded,
  loginUser,
  logOutUser,
  registerUser,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import imageUploader from "../utils/imageUploader.js";

const router = express.Router();

router.post("/register", imageUploader.single("profilePicture"), registerUser);
router.post("/login", loginUser);
router.get("/data", authMiddleware, getUserData);
router.get("/logout", logOutUser);
router.post("/onboarding", authMiddleware, isOnboarded);

export default router;
