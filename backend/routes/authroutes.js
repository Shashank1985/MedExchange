const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.get('/login', (req, res) => res.render('login'));

router.get('/register/doctor', (req, res) => res.render('registerDoctor'));
router.get('/register/patient', (req, res) => res.render('registerPatient'));

router.post('/register', async (req, res) => {
    try {
        const { name, age, username, password, role, specialty, experience, medicalHistory } = req.body;
        console.log("I work here");
        if (!name || !age || !username || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate age and username
        if (age < 1 || age > 120) return res.status(400).json({ error: 'Invalid age' });
        if (username.length < 5 || username.length > 25) return res.status(400).json({ error: 'Username must be between 5 and 25 characters' });

        // Validate role-specific fields
        if (role === 'doctor' && (!specialty || experience < 0 || experience > 80)) {
            return res.status(400).json({ error: 'Invalid doctor details' });
        }
        if (role === 'patient' && !medicalHistory) {
            return res.status(400).json({ error: 'Medical history is required for patients' });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'Username already taken' });

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hashed the password");
        console.log(hashedPassword);
        const user = new User({
            name, age, username,
            password: hashedPassword,
            role, specialty, experience, medicalHistory
        });
        await user.save();
        res.render('login');
    } catch (error) {
        res.status(500).send('Registration failed');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('User not found');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Login failed');
    }
});

module.exports = router;
