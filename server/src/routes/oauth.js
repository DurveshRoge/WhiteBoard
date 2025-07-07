import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Helper function to handle OAuth success
const handleOAuthSuccess = (req, res) => {
  if (req.user) {
    // Generate JWT token
    const token = generateToken(req.user._id);
    
    // Update last login
    req.user.lastLogin = new Date();
    req.user.save();
    
    // Determine the correct frontend URL
    const frontendURL = process.env.CLIENT_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://whiteboard-gray-rho.vercel.app'
        : 'http://localhost:3000');
    
    // Redirect to frontend with token
    res.redirect(`${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role
    }))}`);
  } else {
    // Determine the correct frontend URL for error redirect
    const frontendURL = process.env.CLIENT_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://whiteboard-gray-rho.vercel.app'
        : 'http://localhost:3000');
        
    res.redirect(`${frontendURL}/login?error=oauth_failed`);
  }
};

// Google OAuth Routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://whiteboard-gray-rho.vercel.app'
        : 'http://localhost:3000')}/login?error=google_failed` 
  }),
  handleOAuthSuccess
);

export default router;
