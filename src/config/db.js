import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database Successfully!");
}

export default connectDB;
