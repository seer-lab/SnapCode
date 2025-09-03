const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseConfig");
const secret = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
    const IDtoken = req.cookies.IDtoken;

    if (!IDtoken) {
        console.log("No token provided");
        req.decoded_uid = null;
        return next();
    }

    try {
        const decoded = jwt.verify(IDtoken, secret);
        req.decoded_uid = decoded.id;
        next();
    } catch (error) {
        console.log("Token verification failed:", error.message);
        req.decoded_uid = null;
        next();
    }
};

// New middleware for routes that REQUIRE authentication
const requireAuth = async (req, res, next) => {
    const IDtoken = req.cookies.IDtoken;

    if (!IDtoken) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(IDtoken, secret);
        
        // Verify user still exists in Firebase
        const user = await admin.auth().getUser(decoded.id);
        
        req.decoded_uid = user.uid;
        req.user = user;
        next();
    } catch (error) {
        console.log("Authentication failed:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = { authenticate, requireAuth };