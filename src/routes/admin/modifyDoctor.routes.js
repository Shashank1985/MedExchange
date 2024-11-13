import express from "express";
import { verifyDoctor } from "../../controllers/admin/modifyDoctor.controllers.js";
import { downloadDocuments } from "../../controllers/admin/viewDocuments.controller.js";
const router = express.Router();


router.post("/verify", verifyDoctor);
router.get("/:id", downloadDocuments)

export default router;