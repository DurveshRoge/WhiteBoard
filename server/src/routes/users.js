import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUsers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Search users (for collaboration invites)
router.get('/search', [
  query('q').isLength({ min: 2, max: 50 }).withMessage('Query must be between 2 and 50 characters')
], searchUsers);

// Get user profile
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], getUser);

// Update user profile
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
], updateUser);

// Admin only routes
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long')
], authorize('admin'), getUsers);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], authorize('admin'), deleteUser);

export default router;
