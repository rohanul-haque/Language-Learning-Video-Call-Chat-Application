import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_URL}/video-call-chat-application`
    );
    console.log("Database connection successful");
  } catch (error) {
    console.log("Database connection faild");
  }
};

export default connectDB;
