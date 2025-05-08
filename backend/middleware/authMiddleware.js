const jwt = require('jsonwebtoken');

// Middleware to verify if the user is logged in or not
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        console.log("verifyToken: No token found, redirecting to login page");
        return res.redirect("/api/auth/login"); //redirect to login page
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("verifyToken: Invalid token, redirecting to /api/auth/login. Error:", err.message);
            // Clear the invalid cookie
            res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            return res.redirect("/api/auth/login");
        }
        req.user = decoded; 
        next();
    });
};

// middleware that verifies if the logged in user is a doctor or not
const authorizeDoctor = (req, res, next) => {
    // This middleware assumes verifyToken has run and req.user is set and comes after verifyToken
    if (!req.user) {
        console.log("authorizeDoctor: req.user not found (verifyToken might have failed or was not run). Redirecting.");
        return res.redirect("/api/auth/login");
    }
    if (req.user.role !== 'doctor') {
        console.log(`authorizeDoctor: Access denied for user ${req.user.id} (role: ${req.user.role}) to doctor route.`);
        // Redirect non-doctors (e.g., patients to their dashboard or show an error)
        if (req.user.role === 'patient') {
            return res.redirect('/dashboard/patient-dashboard');
        }
        // For any other role or if role is missing, show a generic error or redirect
        return res.status(403).render('errorPage', { // Assuming you have an errorPage.ejs
            message: 'Access Denied: You do not have permission to view this page.',
            user: req.user
        });
    }
    next(); // User is a doctor, proceed
};

//middleware that checks if the logged in user is a patient
const authorizePatient = (req, res, next) => {
    if (!req.user) {
        console.log("authorizePatient: req.user not found. Redirecting.");
        return res.redirect("/api/auth/login");
    }
    if (req.user.role !== 'patient') {
        console.log(`authorizePatient: Access denied for user ${req.user.id} (role: ${req.user.role}) to patient route.`);
        // Redirect non-patients (e.g., doctors to their dashboard or show an error)
        if (req.user.role === 'doctor') {
            return res.redirect('/dashboard/doctor-dashboard');
        }
        return res.status(403).render('errorPage', {
            message: 'Access Denied: You do not have permission to view this page.',
            user: req.user
        });
    }
    next(); // User is a patient, proceed
};

//redirect to correct dashboard if token is already verified
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err && decoded) { // Token is valid
                console.log(`redirectIfAuthenticated: User ${decoded.id} (role: ${decoded.role}) already logged in. Redirecting.`);
                if (decoded.role === "doctor") return res.redirect("/dashboard/doctor-dashboard");
                if (decoded.role === "patient") return res.redirect("/dashboard/patient-dashboard");
                return res.redirect('/api/auth/login'); 
            }
            // If token is invalid, clear it and allow access to login/register
            if (err) {
                res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
            }
            next();
        });
    } else {
        next(); 
    }
};


module.exports = {
    verifyToken,
    authorizeDoctor,
    authorizePatient,
    redirectIfAuthenticated
};
