import express from "express";
import multer from 'multer';
import doctor from "../../controllers/doctor/doctorAuth.controllers.js"
const router = express.Router();

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

router.post("/login", doctor.login);
router.post(
    "/signup",
    upload.fields([
        { name: 'medicalLicense', maxCount: 1 },
        { name: 'degree', maxCount: 1 },
        { name: 'publishments', maxCount: 5 },
        { name: 'identityProof', maxCount: 1 }
    ]),
    doctor.signup
);

export default router;
