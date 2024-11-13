import "dotenv/config.js"
import express, { urlencoded } from "express";
import cors from "cors";
import router from "../src/routes/index.js"
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
const app = express();

connectDB();

app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}! 🚀`);
})