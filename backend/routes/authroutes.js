const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();
require("dotenv").config();
const { redirectIfAuthenticated } = require('../middleware/authMiddleware'); 



// Render pages
router.get("/login", redirectIfAuthenticated, (req, res) => res.render("login",{user:null,error:null}));
router.get("/register/doctor", redirectIfAuthenticated, (req, res) => res.render("registerDoctor",{user:null,error:null}));
router.get("/register/patient", redirectIfAuthenticated, (req, res) => res.render("registerPatient",{user:null,error:null}));

// Register a new user
router.post("/register",redirectIfAuthenticated, async (req, res) => {
    console.log("Received registration data (req.body):", req.body);
    try {
        const { name, age, username, password, role, specialty, experience, medicalHistory } = req.body;

        if (!name || !age || !username || !password || !role) {
            return res.status(400).render(role === 'doctor' ? 'registerDoctor' : 'registerPatient', { error: "Missing required fields", user: null });
        }

        if (age < 1 || age > 120) return res.status(400).json({ error: "Invalid age" });
        if (username.length < 5 || username.length > 25) return res.status(400).render(role === 'doctor' ? 'registerDoctor' : 'registerPatient', { error: "Username must be between 5 and 25 characters long", user: null });
        if (role === "doctor" && (!specialty || experience < 0 || experience > 80)) {
            return res.status(400).render(role === 'doctor' ? 'registerDoctor' : 'registerPatient', { error: "Invalid doctor details", user: null });
        }
        if (role === "patient" && !medicalHistory) {
            return res.status(400).render(role === 'doctor' ? 'registerDoctor' : 'registerPatient', { error: "Medical history is required", user: null });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).render(role === 'doctor' ? 'registerDoctor' : 'registerPatient', { error: "Username already taken", user: null });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { 
             name: name,
             age: parseInt(age,10),
             username: username,
             password: hashedPassword,
             role: role };
        if (role === "doctor") {
            if (!specialty || experience === undefined || parseInt(experience) < 0 || parseInt(experience) > 80) {
                return res.status(400).render('registerDoctor', { error: "Invalid doctor details", user: null });
            }
            userData.specialty = specialty;
            userData.experience = parseInt(experience);
        } else if (role === "patient") {
            if (!medicalHistory) {
                return res.status(400).render('registerPatient', { error: "Medical history is required for patients", user: null });
            }
            userData.medicalHistory = medicalHistory;
        } else {
             return res.status(400).render('login', { error: "Invalid role specified", user: null }); 
        }
        console.log("Data being passed to new User() constructor:", userData);
        const user = new User();
        user.name = userData.name;
        user.age = userData.age; 
        user.username = userData.username;
        user.password = userData.password; 
        user.role = userData.role;

        if (user.role === 'patient') {
            user.medicalHistory = userData.medicalHistory;
        } else if (user.role === 'doctor') {
            user.specialty = userData.specialty;
            user.experience = userData.experience; 
        }

        console.log("User instance before save (after explicit set):", JSON.stringify(user.toObject()));

        try {
            await user.save(); 
            console.log("USER SAVED SUCCESSFULLY (with explicit set):", user);
            res.render("login");
        }catch{
            console.error("Full Registration error object (after explicit set):", error);
            if (error.name === 'ValidationError') {
                let messages = [];
                for (let fieldInError in error.errors) {
                    messages.push(error.errors[fieldInError].message);
                }
                const errorMessage = messages.join(' ');
                const renderPage = req.body.role === 'doctor' ? 'registerDoctor' : (req.body.role === 'patient' ? 'registerPatient' : 'register');
                return res.status(400).render(renderPage || 'register', {
                    error: errorMessage || "Validation failed. Please check your input.",
                    user: null,
                    name: req.body.name, age: req.body.age, username: req.body.username,
                    specialty: req.body.specialty, experience: req.body.experience, medicalHistory: req.body.medicalHistory
                });
            }
            res.status(500).render('register', { error: "Registration failed due to a server issue.", user: null });
        }

        
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Registration failed");
    }
});

// Login User and Generate JWT Token
router.post("/login", redirectIfAuthenticated, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).render("login", { error: "Username and password are required.", user: null });
        }
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).render("login", { error: "Invalid credentials.", user: null,usernamme:req.body.username });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).render("login", { error: "Invalid credentials.", user: null,username: req.body.username });
        }

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Add secure for production

        res.redirect(user.role === "doctor" ? "/dashboard/doctor-dashboard" : "/dashboard/patient-dashboard");
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).render("login", { error: "Login failed. Please try again.", user: null });
    }
});

// Logout (Clear Token)
router.get("/logout", (req, res) => {
    res.cookie("token", '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production' });
    res.redirect("/api/auth/login"); 
});

module.exports = router;
