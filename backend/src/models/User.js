import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  profilePicture: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  nativeLanguage: {
    type: String,
    default: "",
  },

  learningLanguage: {
    type: String,
    default: "",
  },

  location: {
    type: String,
    default: "",
  },

  isOnboarded: {
    type: Boolean,
    default: false,
  },

  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
