const express = require('express');
const Question = require('../models/Question');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and get user
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.redirect('/login');
    }
};

// GET: Show submit question form
router.get('/submit', verifyToken, (req, res) => {
    res.render('submitQuestion', { user: req.user });
});

// POST: Save question to MongoDB
router.post('/submit', verifyToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).send('Title and description are required');
        }

        const newQuestion = new Question({
            user: req.user.id,
            title,
            description
        });

        await newQuestion.save();
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Error saving question');
    }
});

router.get("/question/:id",async (req,res) => {
    try{
        const question = Question.findById(req.params.id);
        if(!question){
            return res.status(400).send("question not found");
        }
        res.render("questionPage",{question});

    }catch(error){
        res.status(500).send("Error while rendering the question");
    }
});

module.exports = router;
