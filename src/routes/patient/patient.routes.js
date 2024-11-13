import express from "express";
import patientAuthRoutes from "./auth.routes.js"
import uploadPrompt from "../../controllers/patient/uploadSymptoms.controllers.js";
import { patientAuthMiddleware, patientOrDoctorAuthMiddleware } from "../../middlewares/auth.middleware.js"
import { createPost, viewPost, viewSolvedPosts } from "../../controllers/patient/post.controllers.js";
import { createAnswer, acceptAnswer, upvoteAnswer } from "../../controllers/patient/answer.controllers.js";
const router = express.Router();

router.use("/auth", patientAuthRoutes);

router.post("/post/create", patientAuthMiddleware, createPost);
router.post("/post/:answerId/upvote", patientOrDoctorAuthMiddleware, upvoteAnswer);
router.post("/post/:answerId/accept", patientAuthMiddleware, acceptAnswer);

router.post("/answer/:postId/create", patientAuthMiddleware, createAnswer);

router.post("/prompt", patientAuthMiddleware, uploadPrompt);

router.get("/browse/solved", patientAuthMiddleware, viewSolvedPosts);
router.get("/browse/:postId", patientAuthMiddleware, viewPost);

router.get("/check", patientAuthMiddleware, (req, res) => {
    res.send("Patient Authenticated!");
})

export default router;