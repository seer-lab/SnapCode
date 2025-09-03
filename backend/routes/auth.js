const express = require("express");
const router = express.Router();
require("dotenv").config();

//import controllers
const authController = require("../controllers/auth");

//import middlewares
const authMiddleware = require("../middlewares/auth");

//api routes

// Check authentication status (for app initialization)
router.post(
  "/authenticate",
  authController.authenticate
);

// Get current user info (requires authentication)
router.post(
  "/me",
  authMiddleware.authenticate,
  authController.returnuser
);

// Login user (create backend session)
router.post("/login", authController.login);

// Logout user (clear backend session)
router.post("/logout", authController.logout);

module.exports = router;