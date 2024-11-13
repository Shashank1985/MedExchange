import express from "express";
import doctorAuthRoutes from "./auth.routes.js"
import createAnswer from "./answer.routes.js";
import { doctorAuthMiddleware } from "../../middlewares/auth.middleware.js"
import { viewPost, viewPosts } from "../../controllers/doctor/viewPosts.controller.js";
const router = express.Router();

router.use("/auth", doctorAuthRoutes);
router.use("/answer", doctorAuthMiddleware, createAnswer);
router.get("/check", doctorAuthMiddleware, (req, res) => {
    res.send("Doctor Authenticated!");
})
router.get("/browse", doctorAuthMiddleware, viewPosts)
router.get("/browse/:postId", doctorAuthMiddleware, viewPost)

export default router;