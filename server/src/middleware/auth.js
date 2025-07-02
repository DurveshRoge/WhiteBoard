import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - no token provided'
      });
    }

    try {
      // Add more detailed logging
      console.log('Verifying token for protected route');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('No user found with ID from token:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'No user found with this id'
        });
      }

      console.log('User found, proceeding with request:', user.name || user.email);
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Optional auth - token found in headers');
    }

    if (token) {
      try {
        console.log('Optional auth - verifying token');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Optional auth - token decoded, user ID:', decoded.id);
        
        const user = await User.findById(decoded.id).select('-password');
        
        if (user) {
          console.log('Optional auth - user found:', user.name || user.email);
          req.user = user;
        } else {
          console.log('Optional auth - no user found for token ID:', decoded.id);
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    } else {
      console.log('Optional auth - no token provided, proceeding as anonymous');
    }

    next();
  } catch (error) {
    console.error('Error in optional auth middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
