import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Line, Rect, Circle, Text, Arrow, Group, Transformer, Image, RegularPolygon } from 'react-konva';
import { useBoardStore } from '../stores/boardStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import ChatPanel from '../components/whiteboard/ChatPanel';
import UserCursors from '../components/whiteboard/UserCursors';
import AIAssistant from '../components/whiteboard/AIAssistant';
import ShareModal from '../components/whiteboard/ShareModal';
import { 
  exportBoardData, 
  canvasToPNG, 
  canvasToPDF, 
  renderBoardToCanvas 
} from '../lib/exportUtils';
import {
  PencilIcon,
  RectangleStackIcon,
  CircleStackIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ShareIcon,
  CursorArrowRaysIcon,
  MinusIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  ArrowsPointingOutIcon,
  LockClosedIcon,
  ArrowPathIcon,
  SparklesIcon,
  PhotoIcon,
  TableCellsIcon,
  FaceSmileIcon,
  Square3Stack3DIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const WhiteboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentBoard, getBoard, loading } = useBoardStore();
  
  // Whiteboard state
  const [tool, setTool] = useState('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState([{ lines: [], shapes: [] }]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [userCursors, setUserCursors] = useState({});
  
  // Drawing settings
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textValue, setTextValue] = useState('');
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Advanced tools state
  const [stickyNoteColor, setStickyNoteColor] = useState('#fef3c7'); // Yellow
  const [connectorMode, setConnectorMode] = useState(false);
  const [connectorStart, setConnectorStart] = useState(null);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [flowchartType, setFlowchartType] = useState('process');
  
  // Multi-select and grouping state
  const [groups, setGroups] = useState([]);
  const [isGrouped, setIsGrouped] = useState(false);
  
  // Clipboard state
  const [clipboard, setClipboard] = useState(null);
  const [clipboardOffset, setClipboardOffset] = useState({ x: 0, y: 0 });
  
  // Grid and alignment state
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  
  // Lock state
  const [lockedElements, setLockedElements] = useState(new Set());
  
  // Style state
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textDecoration, setTextDecoration] = useState('none');
  
  // Eraser state
  const [eraserSize, setEraserSize] = useState(10);
  
  const stageRef = useRef();
  const isDrawingRef = useRef(false);
  const layerRef = useRef();
  const transformerRef = useRef();
  const textAreaRef = useRef();
  const fileInputRef = useRef();

  // Track whether we've attempted to load the board
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  // Socket reference
  const socketRef = useRef(null);
  
  // Add drag-to-select (selection box)
  const [selectionBox, setSelectionBox] = useState(null);
  
  // Connect to socket
  const initializeSocket = async () => {
    if (!user || !id) return;
    
    try {
      const io = (await import('socket.io-client')).io;
      
      // Close any existing connection
      if (socketRef.current) {
        console.log('Closing existing socket connection');
        socketRef.current.disconnect();
      }
      
      console.log('Initializing socket connection');
      
      // Create new connection
      const socket = io('/', {
        path: '/socket.io',
        auth: {
          token: useAuthStore.getState().token
        }
      });
      
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        toast.success('Connected to collaborative session');
        
        // Join the board room
        socket.emit('join-board', { boardId: id });
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(`Socket error: ${error.message || 'Unknown error'}`);
      });
      
      socket.on('board-joined', (data) => {
        console.log('Joined board:', data);
        setActiveUsers(data.activeUsers);
        
        // If the board has elements, update our state
        if (data.board && data.board.elements) {
          // Convert elements to our format if needed
          // This may need adjustment based on your data structure
          const convertedLines = [];
          const convertedShapes = [];
          
          data.board.elements.forEach(element => {
            if (element.type === 'pen') {
              convertedLines.push({
                tool: 'pen',
                points: element.points,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                id: element.id
              });
            } else {
              convertedShapes.push({
                type: element.type,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                radius: element.type === 'circle' ? 
                  Math.max(element.width, element.height) / 2 : undefined,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
                fill: element.fill || 'transparent',
                id: element.id,
                rotation: element.rotation || 0,
                text: element.text,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily
              });
            }
          });
          
          setLines(convertedLines);
          setShapes(convertedShapes);
          
          // Add to history
          setHistory([{ lines: convertedLines, shapes: convertedShapes }]);
          setHistoryStep(0);
        }
      });
      
      socket.on('user-joined', (data) => {
        console.log('User joined:', data);
        setActiveUsers(data.activeUsers);
        toast.info(`${data.user.name} joined the board`);
      });
      
      socket.on('user-left', (data) => {
        console.log('User left:', data);
        setActiveUsers(data.activeUsers);
        
        // Remove their cursor
        setUserCursors(prev => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
      });
      
      socket.on('cursor-moved', (data) => {
        setUserCursors(prev => ({
          ...prev,
          [data.userId]: data.cursor
        }));
      });
      
      socket.on('drawing-updated', (data) => {
        console.log('Drawing updated:', data);
        
        const { elements, action, elementId, userId } = data;
        
        if (action === 'add-line') {
          const newLine = elements.find(e => e.id === elementId);
          if (newLine) {
            setLines(prev => [...prev, {
              tool: newLine.tool,
              points: newLine.points,
              stroke: newLine.stroke,
              strokeWidth: newLine.strokeWidth,
              id: newLine.id
            }]);
          }
        } else if (action === 'update-line') {
          const updatedLine = elements.find(e => e.id === elementId);
          if (updatedLine) {
            setLines(prev => prev.map(line => 
              line.id === elementId ? {
                ...line,
                points: updatedLine.points
              } : line
            ));
          }
        } else if (action === 'add-shape') {
          const newShape = elements.find(e => e.id === elementId);
          if (newShape) {
            setShapes(prev => [...prev, {
              type: newShape.type,
              x: newShape.x,
              y: newShape.y,
              width: newShape.width,
              height: newShape.height,
              radius: newShape.type === 'circle' ? newShape.radius : undefined,
              points: newShape.points,
              stroke: newShape.stroke,
              strokeWidth: newShape.strokeWidth,
              fill: newShape.fill || 'transparent',
              id: newShape.id,
              rotation: newShape.rotation || 0,
              text: newShape.text,
              fontSize: newShape.fontSize,
              fontFamily: newShape.fontFamily
            }]);
          }
        } else if (action === 'update-shape') {
          const updatedShape = elements.find(e => e.id === elementId);
          if (updatedShape) {
            setShapes(prev => prev.map(shape =>
              shape.id === elementId ? {
                ...shape,
                x: updatedShape.x,
                y: updatedShape.y,
                width: updatedShape.width,
                height: updatedShape.height,
                radius: updatedShape.type === 'circle' ? updatedShape.radius : undefined,
                rotation: updatedShape.rotation || 0,
                points: updatedShape.points
              } : shape
            ));
          }
        } else if (action === 'delete') {
          setLines(prev => prev.filter(line => line.id !== elementId));
          setShapes(prev => prev.filter(shape => shape.id !== elementId));
        } else if (action === 'clear') {
          setLines([]);
          setShapes([]);
        }
        
        // Update history
        saveToHistory();
      });
      
      socket.on('chat-message', (message) => {
        setMessages(prev => [...prev, message]);
        
        if (!isChatOpen) {
          toast.info(`${message.user.name}: ${message.message.substring(0, 30)}${message.message.length > 30 ? '...' : ''}`);
        }
      });
      
      // Save the socket reference
      socketRef.current = socket;
      
    } catch (error) {
      console.error('Error connecting to socket:', error);
      toast.error('Failed to connect to collaborative session - tools will work locally');
      // Set socketRef to null so we don't try to use it
      socketRef.current = null;
    }
  };
  
  // Send cursor position
  const sendCursorPosition = (x, y) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    
    try {
      socketRef.current.emit('cursor-move', { 
        x: (x - stagePos.x) / zoom,
        y: (y - stagePos.y) / zoom
      });
    } catch (error) {
      console.warn('Cursor position emit failed:', error);
    }
  };
  

  
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    let timeoutId;
    
    if (id && !loadAttempted) {
      const loadBoard = async () => {
        try {
          // Don't retry too many times
          if (retryCount >= maxRetries) {
            console.error('Max retries reached for loading board');
            toast.error('Unable to load whiteboard after multiple attempts');
            navigate('/dashboard');
            return;
          }
          
          retryCount++;
          setLoadAttempted(true);
          
          console.log('Loading whiteboard - ID:', id);
          
          // Ensure auth token is set in headers
          const { useAuthStore } = await import('../stores/authStore');
          const { token, user, setAuthToken, initializeAuth, refreshSession } = useAuthStore.getState();
          
          console.log('Current auth state:', { 
            hasToken: !!token, 
            hasUser: !!user, 
            userId: user?.id 
          });
          
          // If we don't have a user or token, make sure auth is initialized first
          if (!token || !user) {
            console.log('No valid authentication, initializing auth');
            const authResult = await initializeAuth();
            console.log('Auth initialization result:', authResult);
            
            // If initialization failed and we still don't have a user, redirect to login
            if (!authResult.success && !useAuthStore.getState().user) {
              console.error('Authentication failed');
              toast.error('Authentication required');
              navigate('/login', { state: { from: `/whiteboard/${id}` } });
              return;
            }
          }
          
          // Get fresh auth state after initialization
          const { token: newToken, user: newUser } = useAuthStore.getState();
          
          console.log('Auth state after initialization:', { 
            hasToken: !!newToken, 
            hasUser: !!newUser,
            userId: newUser?.id
          });
          
          // If still not authenticated after initialization, redirect
          if (!newToken || !newUser) {
            console.error('Still not authenticated after initialization');
            toast.error('Please log in to access this board');
            navigate('/login', { state: { from: `/whiteboard/${id}` } });
            return;
          }
          
          console.log('Setting auth token before board request');
          setAuthToken(newToken);
          
          // Double check the auth header is set
          const authHeader = axios.defaults.headers.common['Authorization'];
          console.log('Authorization header is set:', !!authHeader);
          if (authHeader) {
            console.log('Auth header format correct:', authHeader.startsWith('Bearer '));
          }
          
          // Try to load the board
          console.log('Attempting to load board with ID:', id);
          const result = await getBoard(id);
          
          if (!isMounted) return;
          
          if (!result.success) {
            if (result.error === 'Request throttled to prevent infinite loop') {
              // This is our throttling mechanism, just stop retrying
              console.log('Request throttled');
              
              // Try again after a delay
              if (retryCount < maxRetries) {
                timeoutId = setTimeout(() => {
                  setLoadAttempted(false); // Allow another attempt
                }, 2000);
              }
              return;
            }
            
            console.error('Failed to load board:', result.error);
            
            // If we got a 403, it might be a permission issue or expired token
            if (result.error?.includes('Access denied') || 
                result.error?.includes('not authorized') || 
                result.error?.includes('403')) {
              
              console.log('Access denied, checking if token needs refresh');
              
              // Try to refresh the session
              const refreshResult = await refreshSession();
              
              if (refreshResult.success) {
                console.log('Session refreshed, performing direct access check');
                
                // Do a direct check to see if we can access this board
                const hasAccess = await checkBoardAccess(id);
                
                if (hasAccess) {
                  console.log('Direct access check succeeded, retrying board load');
                  setLoadAttempted(false); // Allow another attempt
                  return;
                } else {
                  console.error('Direct access check failed - no permission');
                  toast.error('You do not have permission to access this board');
                  navigate('/dashboard');
                  return;
                }
              } else {
                // If refresh failed, it's likely a genuine permission issue
                console.error('Permission denied even after refresh');
                toast.error('You do not have permission to access this board');
                navigate('/dashboard');
                return;
              }
            }
            
            toast.error(result.error || 'Failed to load whiteboard');
            
            // For other errors, retry after a delay if we haven't reached max retries
            if (retryCount < maxRetries) {
              timeoutId = setTimeout(() => {
                setLoadAttempted(false); // Allow another attempt
              }, 1000);
            }
          } else {
            console.log('Board loaded successfully');
            // If we got here, the board loaded successfully
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('Error loading board:', error);
          toast.error('Failed to load whiteboard');
          
          if (retryCount >= maxRetries) {
            navigate('/dashboard');
          } else {
            timeoutId = setTimeout(() => {
              setLoadAttempted(false); // Allow another attempt
            }, 1000);
          }
        }
      };
      
      loadBoard();
    }
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id, getBoard, navigate, user?.id, loadAttempted]);

  // Initialize socket when component mounts and user/board is available
  useEffect(() => {
    if (user && id && currentBoard) {
      initializeSocket();
    }
    
    return () => {
      // Clean up socket connection when component unmounts
      if (socketRef.current) {
        console.log('Closing socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id, user, currentBoard]);

  // Handle window resize
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Stage dimensions
  const stageWidth = windowSize.width - (isSidebarOpen ? 256 : 0);
  const stageHeight = windowSize.height - 64;

  useEffect(() => {
    console.log('WhiteboardPage mounted');
    console.log('Initial state:', { lines, shapes, tool, zoom, stagePos });
    
    return () => {
      console.log('WhiteboardPage unmounted');
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to check if the user has access to the board
  const checkBoardAccess = async (boardId) => {
    console.log('Checking board access directly');
    
    // Use the boardStore method for consistency
    const accessResult = await useBoardStore.getState().checkBoardAccess(boardId);
    
    console.log('Direct board access check result:', accessResult);
    
    return accessResult.success && accessResult.accessible;
  };

  // Update Transformer to attach to all selected nodes
  useEffect(() => {
    if (selectedIds.length && transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const nodes = selectedIds.map(id => stage.findOne(`#${id}`)).filter(Boolean);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds]);

  const handleMouseDown = (e) => {
    console.log('handleMouseDown called with tool:', tool);
    
    // Deselect when clicking on the stage
    const stageTarget = e.target.getStage();
    const pointerPos = stageTarget.getPointerPosition();
    const relPos = {
      x: (pointerPos.x - stagePos.x) / zoom,
      y: (pointerPos.y - stagePos.y) / zoom
    };
    
    // Deselect when clicking on the stage
    if (e.target === stageTarget) {
      setSelectedIds([]);
      
      // If text tool and clicking on stage, add a new text element
      if (tool === 'text') {
        const id = Date.now().toString();
        const newText = {
          type: 'text',
          x: relPos.x,
          y: relPos.y,
          text: 'Double click to edit',
          fontSize,
          fontFamily,
          fill: strokeColor,
          id,
          width: 200
        };
        
        setShapes(prevShapes => [...prevShapes, newText]);
        
        // Emit to socket
        if (socketRef.current && socketRef.current.connected) {
          try {
            socketRef.current.emit('drawing-update', {
              elements: [...shapes, newText],
              action: 'add-shape',
              elementId: id
            });
          } catch (error) {
            console.warn('Socket emit failed:', error);
          }
        }
        
        saveToHistory();
        return;
      }
    }
    
    // If select tool, return early
    if (tool === 'select') return;
    
    // Start drawing mode
    isDrawingRef.current = true;
    setIsDrawing(true);
    
    // Get pointer position
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const relativePos = snapToGridPosition(
      (pos.x - stagePos.x) / zoom,
      (pos.y - stagePos.y) / zoom
    );
    
    // Generate a unique id as a string
    const id = Date.now().toString();
    
    // Handle different drawing tools
    if (tool === 'pen') {
      const newLine = { 
        tool,
        points: [relativePos.x, relativePos.y],
        stroke: strokeColor,
        strokeWidth,
        id
      };
      
      setLines(prevLines => [...prevLines, newLine]);
      
      // Emit to socket
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.emit('drawing-update', {
            elements: [...lines, newLine],
            action: 'add-line',
            elementId: id
          });
        } catch (error) {
          console.warn('Socket emit failed:', error);
        }
      }
      
      console.log('Pen tool: Added new line', newLine);
    } else if (tool === 'eraser') {
      const newLine = { 
        tool: 'eraser',
        points: [relativePos.x, relativePos.y],
        stroke: '#ffffff',
        strokeWidth: eraserSize,
        id
      };
      
      setLines(prevLines => [...prevLines, newLine]);
      
      // Emit to socket
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.emit('drawing-update', {
            elements: [...lines, newLine],
            action: 'add-line',
            elementId: id
          });
        } catch (error) {
          console.warn('Socket emit failed:', error);
        }
      }
      
      console.log('Eraser tool: Added new eraser line', newLine);
    } else if (tool === 'rectangle') {
      const newRect = {
        type: 'rectangle',
        x: relativePos.x,
        y: relativePos.y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth,
        id
      };
      
      setShapes(prevShapes => [...prevShapes, newRect]);
      console.log('Rectangle tool: Added new rectangle', newRect);
    } else if (tool === 'circle') {
      const newCircle = {
        type: 'circle',
        x: relativePos.x,
        y: relativePos.y,
        radius: 0,
        stroke: strokeColor,
        fill: fillColor,
        strokeWidth,
        id
      };
      
      setShapes(prevShapes => [...prevShapes, newCircle]);
      console.log('Circle tool: Added new circle', newCircle);
    } else if (tool === 'arrow') {
      const newArrow = {
        type: 'arrow',
        x: relativePos.x,
        y: relativePos.y,
        points: [0, 0, 0, 0],
        stroke: strokeColor,
        strokeWidth,
        id,
        pointerLength: 10,
        pointerWidth: 10
      };
      
      setShapes(prevShapes => [...prevShapes, newArrow]);
      console.log('Arrow tool: Added new arrow', newArrow);
    } else if (tool === 'line') {
      const newLine = {
        type: 'line',
        x: relativePos.x,
        y: relativePos.y,
        points: [0, 0, 0, 0],
        stroke: strokeColor,
        strokeWidth,
        id
      };
      
      setShapes(prevShapes => [...prevShapes, newLine]);
      console.log('Line tool: Added new line', newLine);
    } else if (tool === 'sticky-note') {
      handleStickyNoteCreate(relativePos.x, relativePos.y);
      isDrawingRef.current = false;
      setIsDrawing(false);
    } else if (tool === 'table') {
      handleTableCreate(relativePos.x, relativePos.y);
      isDrawingRef.current = false;
      setIsDrawing(false);
    } else if (tool === 'emoji') {
      handleEmojiCreate(relativePos.x, relativePos.y);
      isDrawingRef.current = false;
      setIsDrawing(false);
    } else if (tool === 'flowchart') {
      handleFlowchartCreate(relativePos.x, relativePos.y);
      isDrawingRef.current = false;
      setIsDrawing(false);
    } else if (tool === 'connector') {
      handleConnectorStart(relativePos.x, relativePos.y);
      isDrawingRef.current = false;
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e) => {
    // Handle connector preview
    if (connectorMode && connectorStart) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      const relativePos = {
        x: (pos.x - stagePos.x) / zoom,
        y: (pos.y - stagePos.y) / zoom
      };
      // Update connector preview by re-rendering
      setConnectorStart({ ...connectorStart });
      return;
    }

    if (!isDrawingRef.current) {
      // Send cursor position for collaboration
      const pos = e.target.getStage().getPointerPosition();
      sendCursorPosition(pos.x, pos.y);
      return;
    }
    
    console.log('handleMouseMove called with tool:', tool, 'isDrawing:', isDrawingRef.current);
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const relativePos = {
      x: (point.x - stagePos.x) / zoom,
      y: (point.y - stagePos.y) / zoom
    };
    
    if (tool === 'pen' || tool === 'eraser') {
      if (lines.length === 0) return;
      
      const lastLine = {...lines[lines.length - 1]};
      if (!lastLine || !lastLine.points) {
        console.error('Invalid line data:', lastLine);
        return;
      }
      
      // Add point to line
      const newPoints = [...lastLine.points, relativePos.x, relativePos.y];
      lastLine.points = newPoints;
      
      // Update the line
      setLines(prevLines => {
        const updatedLines = [...prevLines.slice(0, -1), lastLine];
        return updatedLines;
      });
      
      // Emit the update to socket
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.emit('drawing-update', {
            elements: [lastLine],
            action: 'update-line',
            elementId: lastLine.id
          });
        } catch (error) {
          console.warn('Socket emit failed:', error);
        }
      }
    } else if (tool === 'rectangle') {
      if (shapes.length === 0) return;
      
      const lastShapeIndex = shapes.length - 1;
      const lastShape = {...shapes[lastShapeIndex]};
      if (lastShape.type !== 'rectangle') return;
      
      const startX = lastShape.x;
      const startY = lastShape.y;
      
      // Update rectangle size
      const updatedShape = {
        ...lastShape,
        width: relativePos.x - startX,
        height: relativePos.y - startY
      };
      
      setShapes(prevShapes => [...prevShapes.slice(0, -1), updatedShape]);
    } else if (tool === 'circle') {
      if (shapes.length === 0) return;
      
      const lastShapeIndex = shapes.length - 1;
      const lastShape = {...shapes[lastShapeIndex]};
      if (lastShape.type !== 'circle') return;
      
      const startX = lastShape.x;
      const startY = lastShape.y;
      
      // Calculate radius
      const dx = relativePos.x - startX;
      const dy = relativePos.y - startY;
      const radius = Math.sqrt(dx * dx + dy * dy);
      
      // Update circle
      const updatedShape = {
        ...lastShape,
        radius
      };
      
      setShapes(prevShapes => [...prevShapes.slice(0, -1), updatedShape]);
    } else if (tool === 'line' || tool === 'arrow') {
      if (shapes.length === 0) return;
      
      const lastShapeIndex = shapes.length - 1;
      const lastShape = {...shapes[lastShapeIndex]};
      if (lastShape.type !== tool) return;
      
      // Set new end point
      const updatedShape = {
        ...lastShape,
        points: [0, 0, relativePos.x - lastShape.x, relativePos.y - lastShape.y]
      };
      
      setShapes(prevShapes => [...prevShapes.slice(0, -1), updatedShape]);
    }
  };

  // Update handleShapeSelect for multi-select
  const handleShapeSelect = (id, e) => {
    if (e && (e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey)) {
      // Add/remove from selection
      setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    } else {
      setSelectedIds([id]);
    }
  };
  
  // Handle shape transformation (moving, resizing, rotating)
  const handleShapeTransform = (id, newAttrs) => {
    // Update the shape with new attributes
    const updatedShapes = shapes.map(shape => 
      shape.id === id ? { ...shape, ...newAttrs } : shape
    );
    
    setShapes(updatedShapes);
    
    // Emit update to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        const updatedShape = updatedShapes.find(shape => shape.id === id);
        socketRef.current.emit('drawing-update', {
          elements: [updatedShape],
          action: 'update-shape',
          elementId: id
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    // Add to history
    saveToHistory();
  };

  // Handle delete selected elements
  const handleDeleteSelected = () => {
    if (!selectedIds.length) return;
    
    // Remove selected elements from state
    setShapes(prev => prev.filter(shape => !selectedIds.includes(shape.id)));
    setLines(prev => prev.filter(line => !selectedIds.includes(line.id)));
    
    // Emit delete events to socket for each deleted element
    if (socketRef.current && socketRef.current.connected) {
      try {
        selectedIds.forEach(elementId => {
          socketRef.current.emit('drawing-update', {
            elements: [],
            action: 'delete',
            elementId: elementId
          });
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    // Clear selection
    setSelectedIds([]);
    
    // Save to history for undo/redo
    saveToHistory();
    
    // Show feedback
    toast.success(`Deleted ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''}`);
  };

  const handleMouseUp = (e) => {
    // Handle connector end
    if (connectorMode && connectorStart) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      const relativePos = {
        x: (pos.x - stagePos.x) / zoom,
        y: (pos.y - stagePos.y) / zoom
      };
      handleConnectorEnd(relativePos.x, relativePos.y);
      return;
    }
    
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    setIsDrawing(false);
    
    // Emit drawing completed event
    if (socketRef.current && socketRef.current.connected) {
      try {
        if (shapes.length > 0 && (tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'arrow' || tool === 'text')) {
          const lastShape = shapes[shapes.length - 1];
          console.log('Drawing completed:', lastShape);
          
          socketRef.current.emit('drawing-update', {
            elements: [lastShape],
            action: 'update-shape',
            elementId: lastShape.id
          });
        } else if (lines.length > 0 && tool === 'pen') {
          const lastLine = lines[lines.length - 1];
          console.log('Drawing completed:', lastLine);
          
          socketRef.current.emit('drawing-update', {
            elements: [lastLine],
            action: 'update-line',
            elementId: lastLine.id
          });
        }
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    // Add to history
    saveToHistory();
    console.log('Current state saved to history', { shapes, lines });
  };
  
  // Handle text editing finish
  const handleTextEditingFinish = () => {
    // Find the shape by selectedId (text or sticky-note)
    const updatedShapes = shapes.map(shape => {
      if (shape.id === selectedIds[0] && (shape.type === 'text' || shape.type === 'sticky-note')) {
        return {
          ...shape,
          text: textValue
        };
      }
      return shape;
    });
    
    // Update shapes
    setShapes(updatedShapes);
    setIsTextEditing(false);
    setSelectedIds([]); // Clear selection after editing
    
    // Emit to socket if needed
    if (socketRef.current && socketRef.current.connected) {
      try {
        const updatedShape = updatedShapes.find(shape => shape.id === selectedIds[0]);
        socketRef.current.emit('drawing-update', {
          elements: [updatedShape],
          action: 'update-shape',
          elementId: selectedIds[0]
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    // Add to history
    saveToHistory();
  };
  
  // Save current state to history
  const saveToHistory = () => {
    // Only save if something changed
    if (historyStep < history.length - 1) {
      // Discard future states
      const newHistory = history.slice(0, historyStep + 1);
      setHistory([
        ...newHistory,
        { lines: [...lines], shapes: [...shapes] }
      ]);
      setHistoryStep(historyStep + 1);
    } else {
      setHistory([
        ...history,
        { lines: [...lines], shapes: [...shapes] }
      ]);
      setHistoryStep(historyStep + 1);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.02;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePos = stage.getPointerPosition();
    
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    if (newScale < 0.1 || newScale > 5) return;
    
    setZoom(newScale);
    
    const newPos = {
      x: mousePos.x - ((mousePos.x - stagePos.x) / oldScale) * newScale,
      y: mousePos.y - ((mousePos.y - stagePos.y) / oldScale) * newScale,
    };
    
    setStagePos(newPos);
  };

  const clearCanvas = () => {
    setLines([]);
    setShapes([]);
    setSelectedIds([]);
    
    // Add empty state to history
    setHistory([...history, { lines: [], shapes: [] }]);
    setHistoryStep(history.length);
    
    // Emit clear to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', { action: 'clear' });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
  };

  const zoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      const { lines: newLines, shapes: newShapes } = history[newStep];
      
      setLines([...newLines]);
      setShapes([...newShapes]);
      setHistoryStep(newStep);
      
      // Emit to socket if needed
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.emit('drawing-update', {
            elements: [...newLines, ...newShapes],
            action: 'undo'
          });
        } catch (error) {
          console.warn('Socket emit failed:', error);
        }
      }
    }
  };
  
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      const { lines: newLines, shapes: newShapes } = history[newStep];
      
      setLines([...newLines]);
      setShapes([...newShapes]);
      setHistoryStep(newStep);
      
      // Emit to socket if needed
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.emit('drawing-update', {
            elements: [...newLines, ...newShapes],
            action: 'redo'
          });
        } catch (error) {
          console.warn('Socket emit failed:', error);
        }
      }
    }
  };

  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select' },
    { id: 'pen', icon: PencilIcon, label: 'Pen' },
    { id: 'eraser', icon: TrashIcon, label: 'Eraser' },
    { id: 'rectangle', icon: RectangleStackIcon, label: 'Rectangle' },
    { id: 'circle', icon: CircleStackIcon, label: 'Circle' },
    { id: 'text', icon: DocumentTextIcon, label: 'Text' },
    { id: 'line', icon: ArrowRightIcon, label: 'Line' },
    { id: 'arrow', icon: ArrowUturnRightIcon, label: 'Arrow' },
  ];

  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#orange', '#purple', '#brown'
  ];

  // Emoji data
  const emojis = [
    '😊', '😂', '❤️', '👍', '🎉', '🔥', '⭐', '💡', '🚀', '🎯',
    '📝', '📊', '💻', '🎨', '🎵', '🏆', '💪', '🌟', '🎪', '🎭'
  ];

  // Flowchart types
  const flowchartTypes = [
    { id: 'start', label: 'Start', icon: '●' },
    { id: 'process', label: 'Process', icon: '□' },
    { id: 'decision', label: 'Decision', icon: '◇' },
    { id: 'end', label: 'End', icon: '●' },
    { id: 'input', label: 'Input', icon: '▱' },
    { id: 'output', label: 'Output', icon: '▱' }
  ];

  // Sticky note colors
  const stickyNoteColors = [
    '#fef3c7', '#fecaca', '#d1fae5', '#dbeafe', '#f3e8ff', '#fed7aa'
  ];

  // Update keyboard support for multi-select and clipboard operations
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle keyboard events if text editing is active
      if (isTextEditing) return;
      
      // Global shortcuts (work even without selection)
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            handleSelectAll();
            return;
          case 'c':
            e.preventDefault();
            if (selectedIds.length) handleCopy();
            return;
          case 'v':
            e.preventDefault();
            handlePaste();
            return;
          case 'x':
            e.preventDefault();
            if (selectedIds.length) handleCut();
            return;
          case 'd':
            e.preventDefault();
            if (selectedIds.length) handleDuplicate();
            return;
        }
      }
      
      if (!selectedIds.length) return;
      let updated = false;
      if (["Delete", "Backspace"].includes(e.key)) {
        // Remove selected elements from state
        setShapes(prev => prev.filter(shape => !selectedIds.includes(shape.id)));
        setLines(prev => prev.filter(line => !selectedIds.includes(line.id)));
        
        // Emit delete events to socket for each deleted element
        if (socketRef.current && socketRef.current.connected) {
          try {
            selectedIds.forEach(elementId => {
              socketRef.current.emit('drawing-update', {
                elements: [],
                action: 'delete',
                elementId: elementId
              });
            });
          } catch (error) {
            console.warn('Socket emit failed:', error);
          }
        }
        
        setSelectedIds([]);
        saveToHistory();
        updated = true;
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        setShapes(prev => prev.map(shape => {
          if (!selectedIds.includes(shape.id)) return shape;
          const step = e.shiftKey ? 10 : 1;
          switch (e.key) {
            case 'ArrowUp': return { ...shape, y: (shape.y || 0) - step };
            case 'ArrowDown': return { ...shape, y: (shape.y || 0) + step };
            case 'ArrowLeft': return { ...shape, x: (shape.x || 0) - step };
            case 'ArrowRight': return { ...shape, x: (shape.x || 0) + step };
            default: return shape;
          }
        }));
        setLines(prev => prev.map(line => {
          if (!selectedIds.includes(line.id)) return line;
          const step = e.shiftKey ? 10 : 1;
          if (line.points) {
            let newPoints = [...line.points];
            switch (e.key) {
              case 'ArrowUp': newPoints = newPoints.map((p, i) => i % 2 === 1 ? p - step : p); break;
              case 'ArrowDown': newPoints = newPoints.map((p, i) => i % 2 === 1 ? p + step : p); break;
              case 'ArrowLeft': newPoints = newPoints.map((p, i) => i % 2 === 0 ? p - step : p); break;
              case 'ArrowRight': newPoints = newPoints.map((p, i) => i % 2 === 0 ? p + step : p); break;
              default: break;
            }
            return { ...line, points: newPoints };
          }
          return line;
        }));
        updated = true;
      }
      if (updated) {
        // Optionally, emit update to socket here
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  // Add drag-to-select (selection box)
  const handleStageMouseDown = (e) => {
    // Handle selection box for select tool
    if (tool === 'select' && e.target === e.target.getStage()) {
      setSelectionBox({ x1: e.evt.layerX, y1: e.evt.layerY, x2: e.evt.layerX, y2: e.evt.layerY });
      setSelectedIds([]);
    }
    
    // Call the main drawing handler for all tools
    handleMouseDown(e);
  };
  
  const handleStageMouseMove = (e) => {
    // Handle selection box for select tool
    if (tool === 'select' && selectionBox) {
      setSelectionBox(box => ({ ...box, x2: e.evt.layerX, y2: e.evt.layerY }));
    }
    
    // Call the main drawing handler for all tools
    handleMouseMove(e);
  };
  
  const handleStageMouseUp = (e) => {
    // Handle selection box for select tool
    if (tool === 'select' && selectionBox) {
      // Calculate selection area
      const { x1, y1, x2, y2 } = selectionBox;
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      // Find all shapes/lines in area
      const selected = [
        ...shapes.filter(shape => shape.x >= minX && shape.x <= maxX && shape.y >= minY && shape.y <= maxY).map(s => s.id),
        ...lines.filter(line => {
          // Check if any point is in area
          return line.points && line.points.some((p, i) => {
            if (i % 2 === 0) return p >= minX && p <= maxX; // x
            else return p >= minY && p <= maxY; // y
          });
        }).map(l => l.id)
      ];
      setSelectedIds(selected);
      setSelectionBox(null);
    }
    
    // Call the main drawing handler for all tools
    handleMouseUp(e);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Board not found</h2>
          <p className="text-gray-600 mb-4">The whiteboard you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Handle chat message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !socketRef.current || !socketRef.current.connected) return;
    
    try {
      socketRef.current.emit('chat-message', {
        message: messageText.trim()
      });
      
      setMessageText('');
    } catch (error) {
      console.warn('Chat message emit failed:', error);
      toast.error('Failed to send message');
    }
  };

  // Export functions
  const handleExport = async (format) => {
    if (!currentBoard || isExporting) return;
    setIsExporting(true);
    try {
      const filename = `${currentBoard.title || 'whiteboard'}_${new Date().toISOString().slice(0, 10)}.${format}`;
      switch (format) {
        case 'png':
          await handlePNGExport(filename);
          break;
        case 'pdf':
          await handlePDFExport(filename);
          break;
        default:
          toast.error('Unsupported export format');
          setIsExporting(false);
          return;
      }
      toast.success(`Board exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    }
    setIsExporting(false);
  };

  const handlePNGExport = async (filename) => {
    if (!stageRef.current) {
      toast.error('Whiteboard not ready for export');
      return;
    }
    // Use the actual Konva stage to export as PNG
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/png', quality: 1 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePDFExport = async (filename) => {
    if (!stageRef.current) {
      toast.error('Whiteboard not ready for export');
      return;
    }
    // Use the actual Konva stage to export as PNG, then embed in PDF
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/png', quality: 1 });
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(dataURL);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  // AI Assistant handlers
  const handleApplySuggestion = (suggestion) => {
    // Convert AI suggestion to board element
    const element = {
      id: Date.now().toString(),
      type: suggestion.type,
      x: suggestion.position?.x || 100,
      y: suggestion.position?.y || 100,
      ...suggestion.properties
    };

    if (suggestion.type === 'text') {
      setShapes(prev => [...prev, element]);
    } else if (suggestion.type === 'pen') {
      setLines(prev => [...prev, element]);
    } else {
      setShapes(prev => [...prev, element]);
    }
  };

  const handleApplyFlowchart = (flowchart) => {
    // Convert flowchart nodes to shapes
    const newShapes = flowchart.nodes.map(node => ({
      id: node.id,
      type: node.type === 'diamond' ? 'diamond' : 'rectangle',
      x: node.position.x,
      y: node.position.y,
      width: node.width,
      height: node.height,
      text: node.text,
      stroke: strokeColor,
      fill: fillColor,
      strokeWidth
    }));

    setShapes(prev => [...prev, ...newShapes]);
  };

  const handleApplyColorScheme = (scheme) => {
    setStrokeColor(scheme.primary);
    setFillColor(scheme.secondary);
    // You could also update the board background here
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const id = Date.now().toString();
        const newImage = {
          type: 'image',
          x: 100,
          y: 100,
          width: img.width,
          height: img.height,
          image: img, // Store the actual image object for Konva
          src: e.target.result, // Keep src for serialization
          id
        };
        
        setShapes(prev => [...prev, newImage]);
        
        // Emit to socket
        if (socketRef.current && socketRef.current.connected) {
          try {
            socketRef.current.emit('drawing-update', {
              elements: [newImage],
              action: 'add-shape',
              elementId: id
            });
          } catch (error) {
            console.warn('Socket emit failed:', error);
          }
        }
        
        saveToHistory();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle sticky note creation
  const handleStickyNoteCreate = (x, y) => {
    const id = Date.now().toString();
    const newStickyNote = {
      type: 'sticky-note',
      x,
      y,
      width: 150,
      height: 120,
      fill: stickyNoteColor,
      stroke: '#d1d5db',
      strokeWidth: 1,
      text: 'Double click to edit',
      fontSize: 14,
      fontFamily: 'Arial',
      id
    };
    
    setShapes(prev => [...prev, newStickyNote]);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          elements: [newStickyNote],
          action: 'add-shape',
          elementId: id
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
  };

  // Handle table creation
  const handleTableCreate = (x, y) => {
    const id = Date.now().toString();
    const cellWidth = 80;
    const cellHeight = 30;
    const newTable = {
      type: 'table',
      x,
      y,
      rows: tableRows,
      cols: tableCols,
      cellWidth,
      cellHeight,
      stroke: strokeColor,
      strokeWidth: 1,
      fill: 'white',
      id
    };
    
    setShapes(prev => [...prev, newTable]);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          elements: [newTable],
          action: 'add-shape',
          elementId: id
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
  };

  // Handle emoji creation
  const handleEmojiCreate = (x, y) => {
    const id = Date.now().toString();
    const newEmoji = {
      type: 'emoji',
      x,
      y,
      width: 40,
      height: 40,
      emoji: selectedEmoji,
      fontSize: 24,
      id
    };
    
    setShapes(prev => [...prev, newEmoji]);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          elements: [newEmoji],
          action: 'add-shape',
          elementId: id
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
  };

  // Handle flowchart block creation
  const handleFlowchartCreate = (x, y) => {
    const id = Date.now().toString();
    const flowchartTypeData = flowchartTypes.find(ft => ft.id === flowchartType);
    const newFlowchart = {
      type: 'flowchart',
      x,
      y,
      width: 120,
      height: 60,
      flowchartType: flowchartType,
      label: flowchartTypeData?.label || 'Process',
      stroke: strokeColor,
      strokeWidth: 2,
      fill: 'white',
      id
    };
    
    setShapes(prev => [...prev, newFlowchart]);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          elements: [newFlowchart],
          action: 'add-shape',
          elementId: id
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
  };

  // Handle connector creation
  const handleConnectorStart = (x, y) => {
    setConnectorStart({ x, y });
    setConnectorMode(true);
  };

  const handleConnectorEnd = (x, y) => {
    if (!connectorStart) return;
    
    const id = Date.now().toString();
    const newConnector = {
      type: 'connector',
      x: connectorStart.x,
      y: connectorStart.y,
      endX: x,
      endY: y,
      stroke: strokeColor,
      strokeWidth: 2,
      id
    };
    
    setShapes(prev => [...prev, newConnector]);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          elements: [newConnector],
          action: 'add-shape',
          elementId: id
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    setConnectorStart(null);
    setConnectorMode(false);
    saveToHistory();
  };

  // Group selected elements
  const handleGroupElements = () => {
    if (selectedIds.length < 2) {
      toast.error('Select at least 2 elements to group');
      return;
    }
    
    const groupId = Date.now().toString();
    const newGroup = {
      id: groupId,
      elements: selectedIds,
      createdAt: new Date()
    };
    
    setGroups(prev => [...prev, newGroup]);
    setIsGrouped(true);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'group',
          groupId,
          elementIds: selectedIds
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    toast.success(`Grouped ${selectedIds.length} elements`);
    saveToHistory();
  };

  // Ungroup selected elements
  const handleUngroupElements = () => {
    const selectedGroups = groups.filter(group => 
      selectedIds.includes(group.id)
    );
    
    if (selectedGroups.length === 0) {
      toast.error('No groups selected to ungroup');
      return;
    }
    
    const groupIdsToRemove = selectedGroups.map(g => g.id);
    setGroups(prev => prev.filter(group => !groupIdsToRemove.includes(group.id)));
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'ungroup',
          groupIds: groupIdsToRemove
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    toast.success(`Ungrouped ${selectedGroups.length} group${selectedGroups.length > 1 ? 's' : ''}`);
    saveToHistory();
  };

  // Select all elements
  const handleSelectAll = () => {
    const allIds = [
      ...shapes.map(shape => shape.id),
      ...lines.map(line => line.id)
    ];
    setSelectedIds(allIds);
    toast.success(`Selected ${allIds.length} elements`);
  };

  // Deselect all elements
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Copy selected elements
  const handleCopy = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected to copy');
      return;
    }
    
    const selectedShapes = shapes.filter(shape => selectedIds.includes(shape.id));
    const selectedLines = lines.filter(line => selectedIds.includes(line.id));
    
    setClipboard({
      shapes: selectedShapes,
      lines: selectedLines
    });
    
    // Calculate center of selection for offset
    const allElements = [...selectedShapes, ...selectedLines];
    if (allElements.length > 0) {
      const centerX = allElements.reduce((sum, el) => sum + (el.x || 0), 0) / allElements.length;
      const centerY = allElements.reduce((sum, el) => sum + (el.y || 0), 0) / allElements.length;
      setClipboardOffset({ x: centerX, y: centerY });
    }
    
    toast.success(`Copied ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''}`);
  };

  // Cut selected elements
  const handleCut = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected to cut');
      return;
    }
    
    handleCopy(); // Copy first
    
    // Then delete
    handleDeleteSelected();
    
    toast.success(`Cut ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''}`);
  };

  // Paste elements
  const handlePaste = () => {
    if (!clipboard) {
      toast.error('Nothing to paste');
      return;
    }
    
    const offset = 20; // Offset for pasted elements
    const newElements = [];
    
    // Paste shapes with offset
    clipboard.shapes.forEach(shape => {
      const newShape = {
        ...shape,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        x: shape.x + offset,
        y: shape.y + offset
      };
      newElements.push(newShape);
    });
    
    // Paste lines with offset
    clipboard.lines.forEach(line => {
      const newLine = {
        ...line,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        points: line.points ? line.points.map((point, index) => 
          index % 2 === 0 ? point + offset : point + offset
        ) : line.points
      };
      newElements.push(newLine);
    });
    
    // Add to state
    const newShapes = newElements.filter(el => el.type !== 'pen');
    const newLines = newElements.filter(el => el.type === 'pen');
    
    setShapes(prev => [...prev, ...newShapes]);
    setLines(prev => [...prev, ...newLines]);
    
    // Select newly pasted elements
    const newIds = newElements.map(el => el.id);
    setSelectedIds(newIds);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          elements: newElements,
          action: 'paste',
          elementIds: newIds
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
    toast.success(`Pasted ${newElements.length} element${newElements.length > 1 ? 's' : ''}`);
  };

  // Duplicate selected elements
  const handleDuplicate = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected to duplicate');
      return;
    }
    
    handleCopy();
    handlePaste();
  };

  // Layer management functions
  const handleBringForward = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected');
      return;
    }
    
    // Reorder shapes by moving selected ones forward
    const allElements = [...shapes, ...lines];
    const selectedElements = allElements.filter(el => selectedIds.includes(el.id));
    const otherElements = allElements.filter(el => !selectedIds.includes(el.id));
    
    const reorderedElements = [...otherElements, ...selectedElements];
    
    // Separate back into shapes and lines
    const newShapes = reorderedElements.filter(el => el.type !== 'pen');
    const newLines = reorderedElements.filter(el => el.type === 'pen');
    
    setShapes(newShapes);
    setLines(newLines);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'reorder',
          shapes: newShapes,
          lines: newLines
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
    toast.success('Brought elements forward');
  };

  const handleSendBackward = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected');
      return;
    }
    
    // Reorder shapes by moving selected ones backward
    const allElements = [...shapes, ...lines];
    const selectedElements = allElements.filter(el => selectedIds.includes(el.id));
    const otherElements = allElements.filter(el => !selectedIds.includes(el.id));
    
    const reorderedElements = [...selectedElements, ...otherElements];
    
    // Separate back into shapes and lines
    const newShapes = reorderedElements.filter(el => el.type !== 'pen');
    const newLines = reorderedElements.filter(el => el.type === 'pen');
    
    setShapes(newShapes);
    setLines(newLines);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'reorder',
          shapes: newShapes,
          lines: newLines
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
    toast.success('Sent elements backward');
  };

  const handleBringToFront = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected');
      return;
    }
    
    // Move selected elements to the very front
    const allElements = [...shapes, ...lines];
    const selectedElements = allElements.filter(el => selectedIds.includes(el.id));
    const otherElements = allElements.filter(el => !selectedIds.includes(el.id));
    
    // Find the highest z-index and move selected elements above it
    const maxZ = Math.max(...otherElements.map(el => el.zIndex || 0), 0);
    const updatedSelectedElements = selectedElements.map(el => ({
      ...el,
      zIndex: maxZ + 1
    }));
    
    const reorderedElements = [...otherElements, ...updatedSelectedElements];
    
    // Separate back into shapes and lines
    const newShapes = reorderedElements.filter(el => el.type !== 'pen');
    const newLines = reorderedElements.filter(el => el.type === 'pen');
    
    setShapes(newShapes);
    setLines(newLines);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'reorder',
          shapes: newShapes,
          lines: newLines
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
    toast.success('Brought elements to front');
  };

  const handleSendToBack = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected');
      return;
    }
    
    // Move selected elements to the very back
    const allElements = [...shapes, ...lines];
    const selectedElements = allElements.filter(el => selectedIds.includes(el.id));
    const otherElements = allElements.filter(el => !selectedIds.includes(el.id));
    
    // Find the lowest z-index and move selected elements below it
    const minZ = Math.min(...otherElements.map(el => el.zIndex || 0), 0);
    const updatedSelectedElements = selectedElements.map(el => ({
      ...el,
      zIndex: minZ - 1
    }));
    
    const reorderedElements = [...updatedSelectedElements, ...otherElements];
    
    // Separate back into shapes and lines
    const newShapes = reorderedElements.filter(el => el.type !== 'pen');
    const newLines = reorderedElements.filter(el => el.type === 'pen');
    
    setShapes(newShapes);
    setLines(newLines);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'reorder',
          shapes: newShapes,
          lines: newLines
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    saveToHistory();
    toast.success('Sent elements to back');
  };

  // Snap to grid function
  const snapToGridPosition = (x, y) => {
    if (!snapToGrid) return { x, y };
    
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return { x: snappedX, y: snappedY };
  };

  // Get alignment guides for selected elements
  const getAlignmentGuides = () => {
    if (!showAlignmentGuides || selectedIds.length === 0) return [];
    
    const selectedElements = [
      ...shapes.filter(shape => selectedIds.includes(shape.id)),
      ...lines.filter(line => selectedIds.includes(line.id))
    ];
    
    if (selectedElements.length === 0) return [];
    
    const guides = [];
    
    // Get bounds of selected elements
    const bounds = selectedElements.reduce((acc, el) => {
      const left = el.x || 0;
      const right = (el.x || 0) + (el.width || 0);
      const top = el.y || 0;
      const bottom = (el.y || 0) + (el.height || 0);
      
      return {
        left: Math.min(acc.left, left),
        right: Math.max(acc.right, right),
        top: Math.min(acc.top, top),
        bottom: Math.max(acc.bottom, bottom),
        centerX: (left + right) / 2,
        centerY: (top + bottom) / 2
      };
    }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
    
    // Add vertical guides
    guides.push({ type: 'vertical', x: bounds.left, color: '#3b82f6' });
    guides.push({ type: 'vertical', x: bounds.centerX, color: '#10b981' });
    guides.push({ type: 'vertical', x: bounds.right, color: '#3b82f6' });
    
    // Add horizontal guides
    guides.push({ type: 'horizontal', y: bounds.top, color: '#3b82f6' });
    guides.push({ type: 'horizontal', y: bounds.centerY, color: '#10b981' });
    guides.push({ type: 'horizontal', y: bounds.bottom, color: '#3b82f6' });
    
    return guides;
  };

  // Lock/unlock functions
  const handleLockElements = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected to lock');
      return;
    }
    
    const newLockedElements = new Set(lockedElements);
    selectedIds.forEach(id => newLockedElements.add(id));
    setLockedElements(newLockedElements);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'lock',
          elementIds: selectedIds
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    toast.success(`Locked ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''}`);
  };

  const handleUnlockElements = () => {
    if (!selectedIds.length) {
      toast.error('No elements selected to unlock');
      return;
    }
    
    const newLockedElements = new Set(lockedElements);
    selectedIds.forEach(id => newLockedElements.delete(id));
    setLockedElements(newLockedElements);
    
    // Emit to socket
    if (socketRef.current && socketRef.current.connected) {
      try {
        socketRef.current.emit('drawing-update', {
          action: 'unlock',
          elementIds: selectedIds
        });
      } catch (error) {
        console.warn('Socket emit failed:', error);
      }
    }
    
    toast.success(`Unlocked ${selectedIds.length} element${selectedIds.length > 1 ? 's' : ''}`);
  };

  const isElementLocked = (elementId) => {
    return lockedElements.has(elementId);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            ← Back
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{currentBoard.title}</h1>
            {currentBoard.description && (
              <p className="text-sm text-gray-600">{currentBoard.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Users */}
          {activeUsers.length > 0 && (
            <div className="hidden md:flex items-center mr-2">
              <div className="flex -space-x-2 overflow-hidden">
                {activeUsers.slice(0, 3).map(user => (
                  <div 
                    key={user.id}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                    title={user.name}
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
              </div>
              {activeUsers.length > 3 && (
                <span className="text-xs text-gray-600 ml-1">
                  +{activeUsers.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Chat
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAIAssistantOpen(true)}
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
          >
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          {/* Export Dropdown */}
          <div className="relative inline-block text-left">
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => document.getElementById('exportDropdown').classList.toggle('hidden')}
              className="mr-2"
            >
              {isExporting ? (
                <span>Exporting...</span>
              ) : (
                <>
                  <DocumentTextIcon className="w-4 h-4 mr-1 inline-block" /> Export
                </>
              )}
            </Button>
            <div
              id="exportDropdown"
              className="hidden absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg"
              style={{ right: 0 }}
            >
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                disabled={isExporting}
                onClick={() => {
                  handleExport('png');
                  document.getElementById('exportDropdown').classList.add('hidden');
                }}
              >
                Export as PNG
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                disabled={isExporting}
                onClick={() => {
                  handleExport('pdf');
                  document.getElementById('exportDropdown').classList.add('hidden');
                }}
              >
                Export as PDF
              </button>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden"
          >
            {isSidebarOpen ? <XMarkIcon className="w-4 h-4" /> : <Bars3Icon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 p-4 space-y-6 ${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block w-64 flex-shrink-0`}>
          {/* Tools */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tools</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'select', icon: CursorArrowRaysIcon, label: 'Select' },
                { id: 'pen', icon: PencilIcon, label: 'Pen' },
                { id: 'eraser', icon: TrashIcon, label: 'Eraser' },
                { id: 'rectangle', icon: RectangleStackIcon, label: 'Rectangle' },
                { id: 'circle', icon: CircleStackIcon, label: 'Circle' },
                { id: 'arrow', icon: ArrowRightIcon, label: 'Arrow' },
                { id: 'line', icon: MinusIcon, label: 'Line' },
                { id: 'text', icon: DocumentTextIcon, label: 'Text' },
                { id: 'sticky-note', icon: DocumentTextIcon, label: 'Note' },
                { id: 'connector', icon: LinkIcon, label: 'Connector' },
                { id: 'image', icon: PhotoIcon, label: 'Image' },
                { id: 'table', icon: TableCellsIcon, label: 'Table' },
                { id: 'emoji', icon: FaceSmileIcon, label: 'Emoji' },
                { id: 'flowchart', icon: Square3Stack3DIcon, label: 'Flowchart' },
              ].map((toolItem) => {
                const Icon = toolItem.icon;
                return (
                  <button
                    key={toolItem.id}
                    onClick={() => setTool(toolItem.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      tool === toolItem.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{toolItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fill & Stroke */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Colors</h3>
            
            <div className="flex space-x-4 mb-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Stroke</label>
                <div className="w-full h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-12"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Fill</label>
                <div className="w-full h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                  <input
                    type="color"
                    value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-full h-12"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-1">
              <input 
                type="checkbox"
                id="transparentFill"
                checked={fillColor === 'transparent'}
                onChange={(e) => setFillColor(e.target.checked ? 'transparent' : '#ffffff')}
                className="mr-2"
              />
              <label htmlFor="transparentFill" className="text-xs text-gray-600">
                Transparent fill
              </label>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mt-3">
              {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
                '#ff00ff', '#00ffff', '#ff6b00', '#9c27b0', '#795548'].map((color) => (
                <button
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    strokeColor === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Properties</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Stroke Width</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 mt-1">{strokeWidth}px</div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 mt-1">{Math.round(opacity * 100)}%</div>
              </div>
              
              {(tool === 'text' || selectedIds.length) && (
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
              )}
              
              {(tool === 'text' || selectedIds.length) && (
                <>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Comic Sans MS'].map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                      className={`flex-1 px-2 py-1 text-xs border rounded ${
                        fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      Bold
                    </button>
                    <button
                      onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={`flex-1 px-2 py-1 text-xs border rounded ${
                        fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      Italic
                    </button>
                    <button
                      onClick={() => setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline')}
                      className={`flex-1 px-2 py-1 text-xs border rounded ${
                        textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      Underline
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tool-specific Settings */}
          {tool === 'sticky-note' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sticky Note Color</h3>
              <div className="grid grid-cols-3 gap-2">
                {stickyNoteColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setStickyNoteColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      stickyNoteColor === color
                        ? 'border-gray-400 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {tool === 'table' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Table Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {tool === 'emoji' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select Emoji</h3>
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-8 h-8 rounded border-2 transition-all text-lg ${
                      selectedEmoji === emoji
                        ? 'border-gray-400 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === 'flowchart' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Flowchart Type</h3>
              <div className="space-y-2">
                {flowchartTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFlowchartType(type.id)}
                    className={`w-full text-left p-2 rounded border-2 transition-all ${
                      flowchartType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === 'eraser' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Eraser Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Eraser Size</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={eraserSize}
                    onChange={(e) => setEraserSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-600 mt-1">{eraserSize}px</div>
                </div>
              </div>
            </div>
          )}

          {tool === 'image' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Image</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <PhotoIcon className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex space-x-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyStep === 0}
                className="flex-1"
              >
                <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                Undo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                className="flex-1"
              >
                <ArrowUturnRightIcon className="w-4 h-4 mr-1" />
                Redo
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={!selectedIds.length}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete Selected ({selectedIds.length})
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="flex-1"
              >
                Deselect All
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGroupElements}
                disabled={selectedIds.length < 2}
                className="flex-1"
              >
                Group
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUngroupElements}
                disabled={!groups.some(g => selectedIds.includes(g.id))}
                className="flex-1"
              >
                Ungroup
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCut}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Cut
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePaste}
                disabled={!clipboard}
                className="flex-1"
              >
                Paste
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Duplicate
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBringForward}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Forward
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendBackward}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Backward
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBringToFront}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                To Front
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendToBack}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                To Back
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLockElements}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Lock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlockElements}
                disabled={!selectedIds.length}
                className="flex-1"
              >
                Unlock
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Snap to Grid</span>
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alignment Guides</span>
                <input
                  type="checkbox"
                  checked={showAlignmentGuides}
                  onChange={(e) => setShowAlignmentGuides(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              {snapToGrid && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Grid Size</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{gridSize}px</span>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="w-full"
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            <Button size="sm" onClick={zoomIn}>
              <PlusIcon className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={zoomOut}>
              <MinusIcon className="w-4 h-4" />
            </Button>
            <div className="text-xs text-gray-600 text-center px-2">
              {Math.round(zoom * 100)}%
            </div>
          </div>
          
          {/* Text editing overlay */}
          {isTextEditing && selectedIds.length && (
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-center">
              <div className="bg-white border border-gray-300 rounded-md shadow-lg p-3">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium mr-2">Edit Text:</label>
                  <div className="ml-auto flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleTextEditingFinish}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsTextEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                <textarea
                  ref={textAreaRef}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="w-full border border-gray-200 rounded p-2"
                  rows={3}
                  style={{ minWidth: '300px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleTextEditingFinish();
                    } else if (e.key === 'Escape') {
                      setIsTextEditing(false);
                    }
                  }}
                  autoFocus
                />
                <div className="text-xs text-gray-500 mt-1">
                  Ctrl+Enter to save, Esc to cancel
                </div>
              </div>
            </div>
          )}

          {/* User cursors */}
          <UserCursors
            userCursors={userCursors}
            activeUsers={activeUsers}
            user={user}
            zoom={zoom}
            stagePos={stagePos}
          />
          
          <Stage
            width={windowSize.width - (isSidebarOpen ? 256 : 0)}
            height={windowSize.height - 64}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onWheel={handleWheel}
            scaleX={zoom}
            scaleY={zoom}
            x={stagePos.x}
            y={stagePos.y}
            ref={stageRef}
            draggable={tool === 'select'}
          >
            <Layer ref={layerRef}>
              {/* Grid Background */}
              {showGrid && Array.from({ length: 50 }, (_, i) => (
                <Line
                  key={`grid-v-${i}`}
                  points={[i * 50, 0, i * 50, 2500]}
                  stroke="#f0f0f0"
                  strokeWidth={1}
                />
              ))}
              {showGrid && Array.from({ length: 50 }, (_, i) => (
                <Line
                  key={`grid-h-${i}`}
                  points={[0, i * 50, 2500, i * 50]}
                  stroke="#f0f0f0"
                  strokeWidth={1}
                />
              ))}
              
              {/* Selection Box */}
              {selectionBox && (
                <Rect
                  x={Math.min(selectionBox.x1, selectionBox.x2)}
                  y={Math.min(selectionBox.y1, selectionBox.y2)}
                  width={Math.abs(selectionBox.x2 - selectionBox.x1)}
                  height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                  stroke="#0096fd"
                  strokeWidth={1}
                  dash={[5, 5]}
                  fill="rgba(0, 150, 253, 0.1)"
                />
              )}
              
              {/* Alignment Guides */}
              {getAlignmentGuides().map((guide, index) => (
                <Line
                  key={`guide-${index}`}
                  points={
                    guide.type === 'vertical'
                      ? [guide.x, 0, guide.x, stageHeight]
                      : [0, guide.y, stageWidth, guide.y]
                  }
                  stroke={guide.color}
                  strokeWidth={1}
                  dash={[3, 3]}
                  opacity={0.7}
                />
              ))}

              {/* Connector Preview */}
              {connectorMode && connectorStart && (
                <Line
                  x={connectorStart.x}
                  y={connectorStart.y}
                  points={[0, 0, 0, 0]}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  dash={[5, 5]}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              
              {/* Drawn Lines */}
              {lines.map((line, i) => {
                const isLocked = isElementLocked(line.id);
                return (
                  <Line
                    key={i}
                    id={line.id}
                    points={line.points}
                    stroke={line.stroke}
                    strokeWidth={line.strokeWidth}
                    opacity={isLocked ? opacity * 0.7 : opacity}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                      line.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                    onClick={tool === 'select' && !isLocked ? () => handleShapeSelect(line.id) : undefined}
                    onTap={tool === 'select' && !isLocked ? () => handleShapeSelect(line.id) : undefined}
                  />
                );
              })}
              
              {/* Shapes */}
              {shapes.map((shape, i) => {
                // Skip invalid shapes
                if (!shape || !shape.id || !shape.type) {
                  console.warn('Invalid shape found:', shape);
                  return null;
                }
                
                // Common props for all shapes
                const isLocked = isElementLocked(shape.id);
                const commonProps = {
                  id: shape.id.toString(),
                  onClick: tool === 'select' && !isLocked ? () => handleShapeSelect(shape.id) : undefined,
                  onTap: tool === 'select' && !isLocked ? () => handleShapeSelect(shape.id) : undefined,
                  opacity: isLocked ? opacity * 0.7 : opacity,
                  draggable: tool === 'select' && !isLocked,
                  onDragEnd: (e) => {
                    if (!isLocked) {
                      handleShapeTransform(shape.id, {
                        x: e.target.x(),
                        y: e.target.y()
                      });
                    }
                  },
                  onTransformEnd: (e) => {
                    if (!isLocked) {
                      const node = e.target;
                      handleShapeTransform(shape.id, {
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        rotation: node.rotation()
                      });
                    }
                  }
                };
                
                if (shape.type === 'rectangle') {
                  return (
                    <Group key={i}>
                      <Rect
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.fill || 'transparent'}
                        rotation={shape.rotation || 0}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            // Limit minimum size
                            if (newBox.width < 5 || newBox.height < 5) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'circle') {
                  return (
                    <Group key={i}>
                      <Circle
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        radius={shape.radius}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.fill || 'transparent'}
                        rotation={shape.rotation || 0}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            // Limit minimum size
                            if (newBox.width < 5 || newBox.height < 5) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'arrow') {
                  return (
                    <Group key={i}>
                      <Arrow
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        points={shape.points}
                        pointerLength={shape.pointerLength || 10}
                        pointerWidth={shape.pointerWidth || 10}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.stroke}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'line') {
                  return (
                    <Group key={i}>
                      <Line
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        points={shape.points}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'text') {
                  return (
                    <Group key={i}>
                      <Text
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={shape.fontSize}
                        fontFamily={shape.fontFamily}
                        fill={shape.fill}
                        width={shape.width}
                        draggable={tool === 'select'}
                        onDblClick={() => {
                          // Enable text editing mode
                          setSelectedIds([shape.id]);
                          setTextValue(shape.text);
                          setIsTextEditing(true);
                        }}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          enabledAnchors={['middle-left', 'middle-right']}
                          boundBoxFunc={(oldBox, newBox) => {
                            // Limit minimum width
                            if (newBox.width < 10) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'sticky-note') {
                  return (
                    <Group key={i}>
                      <Rect
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        cornerRadius={8}
                      />
                      <Text
                        {...commonProps}
                        id={`${shape.id}-text`}
                        x={shape.x + 8}
                        y={shape.y + 8}
                        text={shape.text}
                        fontSize={shape.fontSize}
                        fontFamily={shape.fontFamily}
                        fill="#000000"
                        width={shape.width - 16}
                        draggable={false}
                        onDblClick={() => {
                          setSelectedIds([shape.id]);
                          setTextValue(shape.text);
                          setIsTextEditing(true);
                        }}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50 || newBox.height < 30) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'image') {
                  return (
                    <Group key={i}>
                      <Image
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        image={shape.image}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 10 || newBox.height < 10) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'table') {
                  // Calculate dynamic cell sizes based on table dimensions
                  const tableWidth = shape.width || (shape.cols * shape.cellWidth);
                  const tableHeight = shape.height || (shape.rows * shape.cellHeight);
                  const cellWidth = tableWidth / shape.cols;
                  const cellHeight = tableHeight / shape.rows;
                  
                  return (
                    <Group key={i}>
                      {/* Table background */}
                      <Rect
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={tableWidth}
                        height={tableHeight}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                      />
                      {/* Vertical lines */}
                      {Array.from({ length: shape.cols - 1 }, (_, col) => (
                        <Line
                          key={`v-${col}`}
                          x={shape.x + (col + 1) * cellWidth}
                          y={shape.y}
                          points={[0, 0, 0, tableHeight]}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                        />
                      ))}
                      {/* Horizontal lines */}
                      {Array.from({ length: shape.rows - 1 }, (_, row) => (
                        <Line
                          key={`h-${row}`}
                          x={shape.x}
                          y={shape.y + (row + 1) * cellHeight}
                          points={[0, 0, tableWidth, 0]}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                        />
                      ))}
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50 || newBox.height < 30) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'emoji') {
                  return (
                    <Group key={i}>
                      <Text
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        text={shape.emoji}
                        fontSize={shape.fontSize}
                        fontFamily="Arial"
                        fill="#000000"
                        width={shape.width}
                        height={shape.height}
                        align="center"
                        verticalAlign="middle"
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 20 || newBox.height < 20) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'flowchart') {
                  const getFlowchartShape = () => {
                    switch (shape.flowchartType) {
                      case 'start':
                      case 'end':
                        return (
                          <Circle
                            {...commonProps}
                            id={shape.id}
                            x={shape.x + shape.width / 2}
                            y={shape.y + shape.height / 2}
                            radius={Math.min(shape.width, shape.height) / 2}
                            fill={shape.fill}
                            stroke={shape.stroke}
                            strokeWidth={shape.strokeWidth}
                          />
                        );
                      case 'decision':
                        return (
                          <RegularPolygon
                            {...commonProps}
                            id={shape.id}
                            x={shape.x + shape.width / 2}
                            y={shape.y + shape.height / 2}
                            sides={4}
                            radius={Math.min(shape.width, shape.height) / 2}
                            fill={shape.fill}
                            stroke={shape.stroke}
                            strokeWidth={shape.strokeWidth}
                            rotation={45}
                          />
                        );
                      case 'input':
                      case 'output':
                        return (
                          <Rect
                            {...commonProps}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            stroke={shape.stroke}
                            strokeWidth={shape.strokeWidth}
                            cornerRadius={shape.height / 2}
                          />
                        );
                      default: // process
                        return (
                          <Rect
                            {...commonProps}
                            id={shape.id}
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            stroke={shape.stroke}
                            strokeWidth={shape.strokeWidth}
                          />
                        );
                    }
                  };

                  return (
                    <Group key={i}>
                      {getFlowchartShape()}
                      <Text
                        {...commonProps}
                        id={`${shape.id}-text`}
                        x={shape.x}
                        y={shape.y}
                        text={shape.label}
                        fontSize={12}
                        fontFamily="Arial"
                        fill="#000000"
                        width={shape.width}
                        height={shape.height}
                        align="center"
                        verticalAlign="middle"
                        draggable={false}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 30 || newBox.height < 20) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                } else if (shape.type === 'connector') {
                  return (
                    <Group key={i}>
                      <Arrow
                        {...commonProps}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        points={[0, 0, shape.endX - shape.x, shape.endY - shape.y]}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.stroke}
                        pointerLength={10}
                        pointerWidth={10}
                      />
                      {selectedIds.includes(shape.id) && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                        />
                      )}
                    </Group>
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
          
          {/* Chat Panel */}
          <ChatPanel 
            messages={messages}
            messageText={messageText}
            setMessageText={setMessageText}
            handleSendMessage={handleSendMessage}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            activeUsers={activeUsers}
            user={user}
          />
          
          {/* Chat toggle button - mobile only */}
          <div className="md:hidden fixed bottom-4 right-4 z-10">
            <Button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="rounded-full w-12 h-12 flex items-center justify-center"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onApplySuggestion={handleApplySuggestion}
        onApplyFlowchart={handleApplyFlowchart}
        onApplyColorScheme={handleApplyColorScheme}
        boardTitle={currentBoard?.title || ''}
        elements={[...lines, ...shapes]}
      />
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        boardId={currentBoard?._id}
        boardTitle={currentBoard?.title}
        currentCollaborators={currentBoard?.collaborators || []}
      />
    </div>
  );
};

export default WhiteboardPage;