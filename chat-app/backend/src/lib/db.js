import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`mongodb connected sucessfully on ${process.env.MONGODB_URI}`);

    }
    catch (err) {
        console.log("error in db connection:", err);

    }
}