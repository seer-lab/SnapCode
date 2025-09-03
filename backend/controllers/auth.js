const admin = require("../config/firebaseConfig");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const returnuser = async (req, res) => {
    const { decoded_uid } = req;
    
    if (decoded_uid === undefined || decoded_uid === null) {
      return res.status(500).json({error:"Not authenticated."})
    }
  
    try {
      const user = await admin.auth().getUser(decoded_uid);
      console.log(user);
      res.status(200).json(user);
    } catch (error) {
      console.log("Error getting user:", error);
      res.status(500).json({error: "User not found."});
    }
};

const login = async (req, res) => {
    const { uid } = req.body;

    if (uid === undefined || uid === null) {
      return res.status(400).json({error:"UID is required."});
    }
  
    try {
      const user = await admin.auth().getUser(uid);
      console.log("User logged in:", user.email);

      const IDtoken = jwt.sign({ id: user.uid }, secret, {
        expiresIn: 365 * 24 * 60 * 60 * 1000,
      });

      res.cookie("IDtoken", IDtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
      });
      
      res.status(200).json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.log("Login error:", error);
      res.status(500).json({error: "Authentication failed."});
    }
};

// Check if user is authenticated (for app initialization)
const authenticate = async (req, res) => {
    try {
      const token = req.cookies.IDtoken;
      
      if (!token) {
        return res.status(401).json({error: "No authentication token."});
      }

      const decoded = jwt.verify(token, secret);
      const user = await admin.auth().getUser(decoded.id);
      
      res.status(200).json({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.log("Authentication check failed:", error);
      res.status(401).json({error: "Invalid or expired token."});
    }
};

const logout = (req, res) => {
    return res
      .clearCookie("IDtoken", { 
        path: "/",
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
      })
      .status(200)
      .json({success: true, message: "Logged out successfully"});
};

module.exports = { returnuser, login, logout, authenticate };