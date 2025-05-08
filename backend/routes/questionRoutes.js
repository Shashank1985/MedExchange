const express = require('express');
const Question = require('../models/Question');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Answer = require('../models/Answer');
const upload = require('../middleware/uploadMiddleware');
const {verifyToken} = require('../middleware/authMiddleware');

// GET: Show submit question form
router.get('/submitQuestion', verifyToken, (req, res) => {
    res.render('submitQuestion', { user: req.user });
});

// POST: Save question to MongoDB
router.post('/submit', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageUrl = req.file ? req.file.location : null;
        console.log(req.body)
        if (!title || !description) {
            return res.status(400).send('Title and description are required');
        }

        const newQuestion = new Question({
            user: req.user.id,
            title,
            description,
            imageUrl
        });
        console.log("I created a new qn")
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

router.get("/:id", verifyToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate('user', 'username'); // Populate question author
        if (!question) {
            return res.status(404).send("Question not found");
        }

        // Fetch all answers for this question
        const allAnswers = await Answer.find({ questionId: req.params.id })
            .populate('userId', 'username') 
            .sort({ createdAt: 'desc' });   

        // Function to build the answer tree in 
        const buildAnswerTree = (answers) => {
            const answerMap = {};
            const rootAnswers = [];

            // First pass: Create a map and initialize replies array
            answers.forEach(ans => {
                ans = ans.toObject(); 
                ans.replies = [];
                answerMap[ans._id.toString()] = ans;
            });

            // Second pass: Link replies to their parents
            answers.forEach(ansObj => { 
                const currentAns = answerMap[ansObj._id.toString()];
                if (currentAns.parentAnswerId) {
                    const parent = answerMap[currentAns.parentAnswerId.toString()];
                    if (parent) {
                        parent.replies.push(currentAns);
                    } else {
                        // Orphaned reply (parent deleted or data inconsistency), add to root or log
                        console.warn(`Orphaned answer found: ${currentAns._id} referencing parent ${currentAns.parentAnswerId}`);
                        rootAnswers.push(currentAns);
                    }
                } else {
                    rootAnswers.push(currentAns);
                }
            });
            return rootAnswers;
        };

        const structuredAnswers = buildAnswerTree(allAnswers);

        res.render("questionPage", {
            question,
            answers: structuredAnswers, // Pass the structured tree
            user: req.user
        });

    } catch (error) {
        console.error("Error while rendering the question:", error);
        res.status(500).send("Error while rendering the question");
    }
});

//route for answer submitting
router.post("/:id/answer", verifyToken, async (req, res) => {
    try {
        const { answer, parentAnswerId } = req.body; // Expect parentAnswerId from the form
        const questionId = req.params.id;
        const userId = req.user.id;

        if (!answer) {
            return res.status(400).send("Answer text is required");
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(400).send("No question found by that id");
        }

        // If parentAnswerId is provided, validate it
        if (parentAnswerId) {
            const parentAnswer = await Answer.findById(parentAnswerId);
            if (!parentAnswer) {
                return res.status(400).send("Parent answer not found");
            }
            if (parentAnswer.questionId.toString() !== questionId) {
               return res.status(400).send("Parent answer does not belong to this question");
            }
        }

        const newAnswer = new Answer({
            questionId,
            userId,
            answer,
            parentAnswerId: parentAnswerId || null // Set to null if not provided
        });
        await newAnswer.save();


        console.log("New answer submitted for user:", newAnswer.userId);
        res.redirect(`/questions/${req.params.id}`);
    } catch (error) {
        console.error("Error while submitting answer:", error);
        res.status(500).send("Error while submitting answer");
    }
});

module.exports = router;
