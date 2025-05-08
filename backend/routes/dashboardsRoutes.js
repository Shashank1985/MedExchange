const express = require('express');
const Question = require('../models/Question');
const {
    verifyToken,
    authorizeDoctor,
    authorizePatient,
} = require('../middleware/authMiddleware');
const router = express.Router();

// Patient Dashboard Route
router.get('/patient-dashboard', verifyToken, authorizePatient, async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 }); // Sort by latest
        console.log(req.user);
        res.render('patientDashboard', { user: req.user, questions });
    } catch (error) {
        console.error("Error loading patient dashboard:", error);
        res.status(500).render('errorPage', { message: 'Error loading patient dashboard', user: req.user });
    }
});

// Doctor Dashboard Route
router.get('/doctor-dashboard', verifyToken,authorizeDoctor, async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 }); // Sort by latest
        console.log(req.user);
        res.render('doctorDashboard', { user: req.user, questions });
    } catch (error) {
        console.error("Error loading doctor dashboard:", error);
        res.status(500).render('errorPage', { message: 'Error loading doctor dashboard', user: req.user });
    }
});

module.exports = router;
