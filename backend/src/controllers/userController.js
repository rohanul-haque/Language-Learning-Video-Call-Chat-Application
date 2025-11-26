import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    const currentUserId = req.user._id;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    }).select("-password");

    if (!recommendedUsers || recommendedUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recommended user found",
      });
    }

    return res.status(200).json({
      success: true,
      recommendedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePicture nativeLanguage learningLanguage"
      );

    res.status(200).json({ success: false, user });
  } catch (error) {
    res.status(500).json({ succes: false, message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const recipientId = req.params.id;

    if (myId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send friend request to yourself",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A friend request already exists between you and this user",
      });
    }

    await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.json({
      success: true,
      message: "Sent Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request",
      });
    }

    if (friendRequest.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Friend request already accepted",
      });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return res.status(200).json({
      success: true,
      message: "Accepted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted",
    }).populate("recipient", "fullName profilePicture");

    res.status(200).json({ succes: true, incomingReqs, acceptedReqs });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePicture nativeLanguage learningLanguage"
    );

    res.status(200).json({ success: true, outgoingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
