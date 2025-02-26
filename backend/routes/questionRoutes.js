const express = require('express');
const Question = require('../models/Question');
const router = express.Router();
const jwt = require('jsonwebtoken');


// Middleware to verify JWT and get user
const verifyToken = (req,res,next) => {
    const token = req.cookies.token;
    if (!token){
        console.log("No token found, redirecting to login");
        res.redirect('/api/auth/login');
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        console.log("Invalid token, redirecting to login");
        res.redirect('api/auth/login');
    }
}

// GET: Show submit question form
router.get('/submitQuestion', verifyToken, (req, res) => {
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
        res.send(`
            <script>
                alert('Question submitted successfully!');
                window.location.href = '/dashboard/patient-dashboard'; 
            </script>
        `);
    } catch (error) {
        res.status(500).send('Error saving question');
    }
});

router.get("/:id",async (req,res) => {
    try{
        const question = await Question.findById(req.params.id);
        if(!question){
            return res.status(400).send("question not found");
        }
        res.render("questionPage",{question});

    }catch(error){
        res.status(500).send("Error while rendering the question");
    }
});

//route for answer submitting
router.post("/:id/answer",async(req,res) =>{
    try{
        const {answer} = req.body;
        const question = await Question.findById(req.params.id);
        if(!question){
            res.status(400).send("no question found by that id");
        }
        question.answers.push(answer);
        await question.save();
        res.redirect(`/questions/${req.params.id}`)
    }catch(error){
        res.status(500).send("error while submitting answer");
    }
})

module.exports = router;
