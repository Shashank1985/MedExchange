const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
require("dotenv").config();

// Middleware to protect routes
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.render("login");
        req.user = decoded;
        next();
    });
};

// Render pages
router.get("/login", (req, res) => res.render("login"));
router.get("/register/doctor", (req, res) => res.render("registerDoctor"));
router.get("/register/patient", (req, res) => res.render("registerPatient"));

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { name, age, username, password, role, specialty, experience, medicalHistory } = req.body;

        if (!name || !age || !username || !password || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (age < 1 || age > 120) return res.status(400).json({ error: "Invalid age" });
        if (username.length < 5 || username.length > 25) return res.status(400).json({ error: "Username must be between 5 and 25 characters" });

        if (role === "doctor" && (!specialty || experience < 0 || experience > 80)) {
            return res.status(400).json({ error: "Invalid doctor details" });
        }
        if (role === "patient" && !medicalHistory) {
            return res.status(400).json({ error: "Medical history is required for patients" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name, age, username,
            password: hashedPassword,
            role, specialty, experience, medicalHistory,
        });

        await user.save();

        res.render("login");
    } catch (error) {
        console.error(error);
        res.status(500).send("Registration failed");
    }
});

// Login User and Generate JWT Token
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).send("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials");

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Store token in HTTP-only cookie
        res.cookie("token", token, { httpOnly: true });

        res.redirect(user.role === "doctor" ? "/dashboard/doctor-dashboard" : "/dashboard/patient-dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Login failed");
    }
});

// Logout (Clear Token)
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

module.exports = router;
