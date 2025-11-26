import { generateStreamToken } from "../utils/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user._id);
    res.status(200).json({ success: true, token: token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
