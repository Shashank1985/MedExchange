import express from "express";
import patient from "../../controllers/patient/patientAuth.controllers.js"
const router = express.Router();

router.post("/login", patient.login);
router.post("/signup", patient.signup);

export default router;
