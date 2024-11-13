import createAnswer from "../../controllers/doctor/answer.controllers.js";
import express from "express";
const router = express.Router();

router.post("/:postId/create", createAnswer);

export default router;