import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Generate drawing suggestions
// @route   POST /api/ai/suggestions
// @access  Private
router.post('/suggestions', [
  body('description').notEmpty().withMessage('Description is required'),
  body('boardContext').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { description, boardContext = '' } = req.body;

    const suggestions = await aiService.generateDrawingSuggestions(description, boardContext);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate flowchart from description
// @route   POST /api/ai/flowchart
// @access  Private
router.post('/flowchart', [
  body('description').notEmpty().withMessage('Description is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { description } = req.body;

    const flowchart = await aiService.generateFlowchart(description);

    res.status(200).json({
      success: true,
      data: flowchart
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Analyze board content
// @route   POST /api/ai/analyze
// @access  Private
router.post('/analyze', [
  body('elements').isArray().withMessage('Elements must be an array'),
  body('boardTitle').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { elements, boardTitle = '' } = req.body;

    const analysis = await aiService.analyzeBoardContent(elements, boardTitle);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate text suggestions
// @route   POST /api/ai/text-suggestions
// @access  Private
router.post('/text-suggestions', [
  body('context').notEmpty().withMessage('Context is required'),
  body('currentText').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { context, currentText = '' } = req.body;

    const suggestions = await aiService.generateTextSuggestions(context, currentText);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate color scheme suggestions
// @route   POST /api/ai/color-scheme
// @access  Private
router.post('/color-scheme', [
  body('boardType').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { boardType = 'general' } = req.body;

    const colorScheme = await aiService.generateColorSuggestions(boardType);

    res.status(200).json({
      success: true,
      data: colorScheme
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Analyze image with Gemini
// @route   POST /api/ai/analyze-image
// @access  Private
router.post('/analyze-image', [
  body('imageData').notEmpty().withMessage('Image data is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { imageData } = req.body;

    const analysis = await aiService.analyzeImageWithGemini(imageData);

    res.status(200).json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    next(error);
  }
});

export default router; 