const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.cookies.token || req.header('Authorization');

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (err) {
        return res.redirect('/login'); // Redirect if token is invalid
    }
};
