import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import connectDB from "./src/db/connectDB.js";
import authRoute from "./src/routes/authRoute.js";
import chatRoute from "./src/routes/chatRoute.js";
import userRoute from "./src/routes/userRoute.js";
import connectCloudinary from "./src/utils/connectCloudinary.js";

const app = express();

connectDB();
connectCloudinary();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
