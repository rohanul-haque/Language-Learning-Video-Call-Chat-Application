import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { upsertStreamUser } from "../utils/stream.js";

export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  const profilePicture = req.file;

  if (!fullName || !email || !password || !profilePicture) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePictureUrl = "";
    if (profilePicture) {
      const uploaded = await cloudinary.uploader.upload(profilePicture.path);
      profilePictureUrl = uploaded.secure_url;
    }

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
    });

    await user.save();

    await upsertStreamUser({
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePicture,
    });

    const token = generateToken(user._id);

    res.cookie("userToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json({
      success: true,
      token,
      message: "Registration successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User registration failed",
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    await upsertStreamUser({
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePicture,
    });

    const token = generateToken(user._id);

    res.cookie("userToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User login failed",
    });
  }
};

export const getUserData = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const logOutUser = async (req, res) => {
  res.clearCookie("userToken");
  return res
    .status(200)
    .json({ success: true, message: "User logout successfully" });
};

export const isOnboarded = async (req, res) => {
  const { bio, nativeLanguage, learningLanguage, location } = req.body;

  if (!bio || !nativeLanguage || !learningLanguage || !location) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        isOnboarded: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePicture,
    });

    return res.json({
      success: true,
      message: "Onboarding successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
