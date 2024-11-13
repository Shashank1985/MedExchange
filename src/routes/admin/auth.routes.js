import express from "express";
import login from "../../controllers/admin/adminAuth.controllers.js"
const router = express.Router();


router.post("/login", login);


export default router;
