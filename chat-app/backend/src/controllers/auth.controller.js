import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import clodinary from "../lib/cloudinarry.js";
export const signup = async (req, res) => {

    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            res.status(400).json({
                message: "please fill all fields"
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "password must be at least 6 chars"
            })
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "user already exist"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedpassword
        });

        if (newUser) {
            //generate jwt token 
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic

            })
        }
        else {
            res.status(400).json({
                message: "invalid user data"
            })
        }
    }
    catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({
            message: "internal server error"
        })
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {

    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            res.status(400).json({
                message: "profile pic is required"
            })
        }
        const uploadResponse = await clodinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });

        res.status(200).json({
            message: "profile pic updated",
            updatedUser
        })
    }

    catch (err) {

        console.log("error in uploading image ", err.message);

        res.status(500).json({
            message: "internal server error"
        })

    }
}

export const checkAuth = (req, res) => {

    try {
        res.status(200).json(req.user);
    }

    catch (err) {
        console.log("error in checking ", err.message);
        res.status(500).json({
            message: "internal server error"
        })
    }

}