// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import oauthRoutes from './routes/oauth.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeAIServices } from './services/aiService.js';
import { initializePassport } from './config/passport.js';
import passport from 'passport';

// Initialize AI services after environment variables are loaded
initializeAIServices();

// Initialize Passport after environment variables are loaded
initializePassport();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://whiteboard-gray-rho.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean); // Remove any undefined values

console.log('🔧 CORS Configuration:');
console.log('CLIENT_URL from env:', process.env.CLIENT_URL);
console.log('Allowed Origins:', allowedOrigins);
console.log('📦 Session Store: MongoDB (connect-mongo)');
console.log('🔐 Session Secret configured:', !!process.env.SESSION_SECRET);

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    exposedHeaders: ["Access-Control-Allow-Origin"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOWMS) || 60 * 1000, // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    success: false,
    message: 'Too many requests, please try again later.'
  },
  skipSuccessfulRequests: false, // Don't count successful requests
});

// Authentication-specific rate limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// Session configuration (must be before passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // lazy session update
    ttl: 24 * 60 * 60 // Session TTL in seconds (24 hours)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    console.log('🌐 CORS Request from origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS Allowed for:', origin);
      return callback(null, true);
    } else {
      console.log('❌ CORS Blocked for:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', oauthRoutes); // OAuth routes (no rate limiting for redirects)
app.use('/api/boards', boardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

//cron-job test 
app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Whiteboard Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Auth test endpoint
app.get('/api/auth/test', (req, res) => {
  // Extract token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(200).json({
      authenticated: false,
      message: 'No token provided'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      authenticated: true,
      userId: decoded.id,
      tokenExp: new Date(decoded.exp * 1000).toISOString()
    });
  } catch (error) {
    res.status(200).json({
      authenticated: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

// Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
  console.log(`🌐 Allowed CORS Origins:`, allowedOrigins);
  console.log(`⚡ Socket.IO enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
