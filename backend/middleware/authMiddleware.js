const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.cookies.token || req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    try {
        // If token is sent in the Authorization header, extract the actual token (format: "Bearer <token>")
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trim();
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};
