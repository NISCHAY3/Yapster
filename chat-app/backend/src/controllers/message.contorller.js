import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinarry.js";
import { getReciverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {

        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    }

    catch (err) {

        console.log("error in getting users", err.message);
        res.status(500).json({
            message: "internal server error"
        })

    }

}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, reciverid: userToChatId },
                { senderId: userToChatId, reciverid: myId }
            ]
        });
        res.status(200).json(messages);

    }
    catch (err) {
        console.log("error in message getting", err.message);

        res.status(500).json({
            error: "interenal server error"
        })

    }
}

export const sendMessage = async (req, res) => {

    try {

        const { text, image } = req.body;
        const { id: reciverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            reciverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const reciverSocketId = getReciverSocketId(reciverId);
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", newMessage);
        }


        res.status(201).json(newMessage)
    }

    catch (err) {
        console.log(err.message);
        res.status(500).json({
            error: "internal server error"
        })
    }
}

