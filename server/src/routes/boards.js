import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  duplicateBoard,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
  getBoardVersions,
  restoreVersion,
  exportBoard,
  getPublicBoards,
  getTemplates,
  archiveBoard,
  restoreBoard,
  getBoardAnalytics
} from '../controllers/boardController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
  query('category').optional().isIn(['business', 'education', 'design', 'flowchart', 'mindmap', 'other'])
], getPublicBoards);

router.get('/templates', [
  query('category').optional().isIn(['business', 'education', 'design', 'flowchart', 'mindmap', 'other'])
], getTemplates);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid board ID')
], optionalAuth, getBoard);

// Protected routes
router.use(protect);

router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('isTemplate').optional().isBoolean().withMessage('isTemplate must be a boolean'),
  body('category').optional().isIn(['business', 'education', 'design', 'flowchart', 'mindmap', 'other'])
], createBoard);

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
  query('filter').optional().isIn(['owned', 'collaborated', 'public', 'templates'])
], getBoards);

router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('background').optional().isObject().withMessage('Background must be an object'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
], updateBoard);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid board ID')
], deleteBoard);

router.post('/:id/duplicate', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters')
], duplicateBoard);

// Collaboration routes
router.post('/:id/collaborators', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').isIn(['viewer', 'editor', 'admin']).withMessage('Invalid role')
], addCollaborator);

router.delete('/:id/collaborators/:userId', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  param('userId').isMongoId().withMessage('Invalid user ID')
], removeCollaborator);

router.put('/:id/collaborators/:userId', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(['viewer', 'editor', 'admin']).withMessage('Invalid role')
], updateCollaboratorRole);

// Version control routes
router.get('/:id/versions', [
  param('id').isMongoId().withMessage('Invalid board ID')
], getBoardVersions);

router.post('/:id/versions/:version/restore', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  param('version').isInt({ min: 1 }).withMessage('Invalid version number')
], restoreVersion);

// Export route
router.get('/:id/export', [
  param('id').isMongoId().withMessage('Invalid board ID'),
  query('format').isIn(['png', 'pdf', 'json']).withMessage('Invalid export format')
], exportBoard);

// Archive a board
router.post('/:id/archive', [
  param('id').isMongoId().withMessage('Invalid board ID')
], archiveBoard);

// Restore a board
router.post('/:id/restore', [
  param('id').isMongoId().withMessage('Invalid board ID')
], restoreBoard);

// Get board analytics
router.get('/:id/analytics', [
  param('id').isMongoId().withMessage('Invalid board ID')
], getBoardAnalytics);

export default router;
