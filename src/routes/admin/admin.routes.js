import modifyDoctor from "./modifyDoctor.routes.js";
import { adminAuthMiddleware } from "../../middlewares/auth.middleware.js";
import doctorAuthRoutes from "./auth.routes.js";
import express from "express";
const router = express.Router();

router.use("/modifyDoctor", modifyDoctor);
router.use("/auth", doctorAuthRoutes);
router.get("/check", adminAuthMiddleware, (req, res) => {
    res.send("Successfully logged in as admin.")
});

export default router;