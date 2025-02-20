const express = require('express');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Patient Dashboard Route
router.get('/patient-dashboard', authMiddleware, async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 }); // Sort by latest
        res.render('patientDashboard', { user: req.user, questions });
    } catch (error) {
        res.status(500).send('Error loading patient dashboard');
    }
});

// Doctor Dashboard Route
router.get('/doctor-dashboard', authMiddleware, async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 }); // Sort by latest
        res.render('doctorDashboard', { user: req.user, questions });
    } catch (error) {
        res.status(500).send('Error loading doctor dashboard');
    }
});

module.exports = router;
