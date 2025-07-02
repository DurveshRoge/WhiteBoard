import { validationResult } from 'express-validator';
import Board from '../models/Board.js';
import User from '../models/User.js';

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
export const getBoards = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const filter = req.query.filter || 'owned';

    let query = {};
    let sort = { lastActivity: -1 };

    // Build query based on filter
    switch (filter) {
      case 'owned':
        query.owner = req.user.id;
        break;
      case 'collaborated':
        query['collaborators.user'] = req.user.id;
        break;
      case 'public':
        query.isPublic = true;
        break;
      case 'templates':
        query.isTemplate = true;
        break;
      default:
        query.$or = [
          { owner: req.user.id },
          { 'collaborators.user': req.user.id }
        ];
    }

    // Add search functionality
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    const boards = await Board.find(query)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar')
      .select('-elements -versions')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Board.countDocuments(query);

    res.status(200).json({
      success: true,
      data: boards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Public/Private
export const getBoard = async (req, res, next) => {
  try {
    console.log('Board request - ID:', req.params.id);
    console.log('Authenticated user:', req.user ? `${req.user.name} (${req.user.id})` : 'None');
    
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    if (!board) {
      console.log('Board not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    console.log('Board found:', board.title);
    console.log('Board owner:', board.owner.name || board.owner.email);
    console.log('Board is public:', board.isPublic);
    console.log('Board collaborators:', board.collaborators.length);

    // Check access permissions
    const userId = req.user ? req.user.id : null;
    console.log('Checking access for user ID:', userId);
    
    if (!userId) {
      console.log('No user ID provided - anonymous access');
      if (!board.isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Authentication required to access this board'
        });
      }
    }
    
    const hasAccess = !board.isPublic ? (userId && board.hasAccess(userId, 'viewer')) : true;
    
    console.log('Access check result:', hasAccess ? 'GRANTED' : 'DENIED');
    console.log('Board public:', board.isPublic);
    console.log('User authenticated:', !!userId);
    console.log('User has access:', userId ? board.hasAccess(userId, 'viewer') : false);
    
    if (!hasAccess) {
      console.log('Access denied to board:', board.title);
      
      if (userId) {
        console.log('Owner ID:', board.owner._id);
        console.log('User ID:', userId);
        console.log('Is owner?', board.owner._id.toString() === userId.toString());
        
        // Log collaborators for debugging
        if (board.collaborators && board.collaborators.length > 0) {
          console.log('Collaborators:');
          board.collaborators.forEach(collab => {
            console.log(`- User: ${collab.user ? (collab.user.name || collab.user.email) : 'Unknown'}, Role: ${collab.role}`);
          });
        } else {
          console.log('No collaborators on this board');
        }
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    } else {
      console.log('Access granted to board:', board.title);
    }

    // Increment view count
    board.stats.views += 1;
    await board.save();

    // Determine user permissions
    const permissions = userId ? {
      canEdit: board.hasAccess(userId, 'editor'),
      canAdmin: board.hasAccess(userId, 'admin'),
      isOwner: board.owner._id.toString() === userId
    } : {
      canEdit: false,
      canAdmin: false,
      isOwner: false
    };

    res.status(200).json({
      success: true,
      data: board,
      permissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const boardData = {
      ...req.body,
      owner: req.user.id
    };

    const board = await Board.create(boardData);
    
    // Populate owner data
    await board.populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check permissions
    if (!board.hasAccess(req.user.id, 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this board'
      });
    }

    // Update fields
    const allowedFields = ['title', 'description', 'isPublic', 'background', 'settings', 'tags', 'category'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    updateData.lastActivity = new Date();

    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar')
     .populate('collaborators.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedBoard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Only owner can delete
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this board'
      });
    }

    await board.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate board
// @route   POST /api/boards/:id/duplicate
// @access  Private
export const duplicateBoard = async (req, res, next) => {
  try {
    const originalBoard = await Board.findById(req.params.id);

    if (!originalBoard) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user has access to view the board
    if (!originalBoard.hasAccess(req.user.id, 'viewer')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const duplicatedBoard = new Board({
      title: req.body.title || `${originalBoard.title} (Copy)`,
      description: originalBoard.description,
      owner: req.user.id,
      background: originalBoard.background,
      dimensions: originalBoard.dimensions,
      elements: originalBoard.elements.map(element => ({
        ...element.toObject(),
        createdBy: req.user.id,
        lastModifiedBy: req.user.id
      })),
      settings: originalBoard.settings,
      tags: originalBoard.tags,
      category: originalBoard.category
    });

    await duplicatedBoard.save();
    await duplicatedBoard.populate('owner', 'name email avatar');

    // Update fork count of original board
    originalBoard.stats.forks += 1;
    await originalBoard.save();

    res.status(201).json({
      success: true,
      data: duplicatedBoard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add collaborator to board
// @route   POST /api/boards/:id/collaborators
// @access  Private
export const addCollaborator = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check permissions
    if (!board.hasAccess(req.user.id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage collaborators'
      });
    }

    const { email, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already owner
    if (board.owner.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'User is already the owner of this board'
      });
    }

    // Add or update collaborator
    board.addCollaborator(user._id, role, req.user.id);
    await board.save();

    await board.populate('collaborators.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Collaborator added successfully',
      collaborators: board.collaborators
    });
  } catch (error) {
    next(error);
  }
};

// Additional controller methods would go here...
// For brevity, I'll create the essential ones

export const removeCollaborator = async (req, res, next) => {
  // Implementation for removing collaborator
};

export const updateCollaboratorRole = async (req, res, next) => {
  // Implementation for updating collaborator role
};

export const getBoardVersions = async (req, res, next) => {
  // Implementation for getting board versions
};

export const restoreVersion = async (req, res, next) => {
  // Implementation for restoring board version
};

export const exportBoard = async (req, res, next) => {
  // Implementation for exporting board
};

export const getPublicBoards = async (req, res, next) => {
  // Implementation for getting public boards
};

export const getTemplates = async (req, res, next) => {
  // Implementation for getting templates
};
