import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Line, Rect, Circle, Text, Arrow, Group, Transformer } from 'react-konva';
import { useBoardStore } from '../stores/boardStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import ChatPanel from '../components/whiteboard/ChatPanel';
import UserCursors from '../components/whiteboard/UserCursors';
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
  ArrowPathIcon
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
  const [selectedId, setSelectedId] = useState(null);
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
  
  const stageRef = useRef();
  const isDrawingRef = useRef(false);
  const layerRef = useRef();
  const transformerRef = useRef();
  const textAreaRef = useRef();

  // Track whether we've attempted to load the board
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  // Socket reference
  const socketRef = useRef(null);
  
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
      toast.error('Failed to connect to collaborative session');
    }
  };
  
  // Send cursor position
  const sendCursorPosition = (x, y) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('cursor-move', { 
      x: (x - stagePos.x) / zoom,
      y: (y - stagePos.y) / zoom
    });
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

  // Add effect to handle transformer on shape selection
  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      // Find the selected node by id
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      
      console.log('Selected node:', selectedId, selectedNode);
      
      if (selectedNode) {
        // Attach transformer to the selected node
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        // If node not found, reset transformer
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      // Reset transformer when no selection
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleMouseDown = (e) => {
    // Deselect when clicking on the stage
    const stageTarget = e.target.getStage();
    const pointerPos = stageTarget.getPointerPosition();
    const relPos = {
      x: (pointerPos.x - stagePos.x) / zoom,
      y: (pointerPos.y - stagePos.y) / zoom
    };
    
    // Deselect when clicking on the stage
    if (e.target === stageTarget) {
      setSelectedId(null);
      
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
        if (socketRef.current) {
          socketRef.current.emit('drawing-update', {
            elements: [...shapes, newText],
            action: 'add-shape',
            elementId: id
          });
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
    const relativePos = {
      x: (pos.x - stagePos.x) / zoom,
      y: (pos.y - stagePos.y) / zoom
    };
    
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
      if (socketRef.current) {
        socketRef.current.emit('drawing-update', {
          elements: [...lines, newLine],
          action: 'add-line',
          elementId: id
        });
      }
      
      console.log('Pen tool: Added new line', newLine);
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
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) {
      // Send cursor position for collaboration
      const pos = e.target.getStage().getPointerPosition();
      sendCursorPosition(pos.x, pos.y);
      return;
    }
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const relativePos = {
      x: (point.x - stagePos.x) / zoom,
      y: (point.y - stagePos.y) / zoom
    };
    
    if (tool === 'pen') {
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
      if (socketRef.current) {
        socketRef.current.emit('drawing-update', {
          elements: [lastLine],
          action: 'update-line',
          elementId: lastLine.id
        });
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

  // Handle shape selection
  const handleShapeSelect = (id) => {
    setSelectedId(id);
    
    // Get the shape if it's a text shape for editing
    const shape = shapes.find(s => s.id === id && s.type === 'text');
    if (shape) {
      setTextValue(shape.text || '');
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
    if (socketRef.current) {
      const updatedShape = updatedShapes.find(shape => shape.id === id);
      socketRef.current.emit('drawing-update', {
        elements: [updatedShape],
        action: 'update-shape',
        elementId: id
      });
    }
    
    // Add to history
    saveToHistory();
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    
    isDrawingRef.current = false;
    setIsDrawing(false);
    
    // Emit drawing completed event
    if (socketRef.current) {
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
    }
    
    // Add to history
    saveToHistory();
    console.log('Current state saved to history', { shapes, lines });
  };
  
  // Handle text editing finish
  const handleTextEditingFinish = () => {
    // Find the text shape by selectedId
    const updatedShapes = shapes.map(shape => {
      if (shape.id === selectedId && shape.type === 'text') {
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
    
    // Emit to socket if needed
    if (socketRef.current) {
      socketRef.current.emit('drawing-update', {
        elements: updatedShapes,
        action: 'update-shape',
        elementId: selectedId
      });
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
    setSelectedId(null);
    
    // Add empty state to history
    setHistory([...history, { lines: [], shapes: [] }]);
    setHistoryStep(history.length);
    
    // Emit clear to socket
    if (socketRef.current) {
      socketRef.current.emit('drawing-update', { action: 'clear' });
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
      if (socketRef.current) {
        socketRef.current.emit('drawing-update', {
          elements: [...newLines, ...newShapes],
          action: 'undo'
        });
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
      if (socketRef.current) {
        socketRef.current.emit('drawing-update', {
          elements: [...newLines, ...newShapes],
          action: 'redo'
        });
      }
    }
  };

  const tools = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select' },
    { id: 'pen', icon: PencilIcon, label: 'Pen' },
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
    
    if (!messageText.trim() || !socketRef.current) return;
    
    socketRef.current.emit('chat-message', {
      message: messageText.trim()
    });
    
    setMessageText('');
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
          
          <Button variant="outline" size="sm">
            <ShareIcon className="w-4 h-4 mr-2" />
            Share
          </Button>
          
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
                { id: 'rectangle', icon: RectangleStackIcon, label: 'Rectangle' },
                { id: 'circle', icon: CircleStackIcon, label: 'Circle' },
                { id: 'arrow', icon: ArrowRightIcon, label: 'Arrow' },
                { id: 'line', icon: MinusIcon, label: 'Line' },
                { id: 'text', icon: DocumentTextIcon, label: 'Text' },
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
              
              {(tool === 'text' || selectedId) && (
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
            </div>
          </div>

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
          {isTextEditing && selectedId && (
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-center">
              <div className="bg-white border border-gray-300 rounded-md shadow-lg p-3">
                <div className="flex items-center mb-2">
                  <label className="text-sm font-medium mr-2">Edit Text:</label>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleTextEditingFinish}
                    className="ml-auto"
                  >
                    Save
                  </Button>
                </div>
                <textarea
                  ref={textAreaRef}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="w-full border border-gray-200 rounded p-2"
                  rows={3}
                  style={{ minWidth: '300px' }}
                />
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
              
              {/* Drawn Lines */}
              {lines.map((line, i) => (
                <Line
                  key={i}
                  id={line.id}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  opacity={opacity}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                  onClick={tool === 'select' ? () => handleShapeSelect(line.id) : undefined}
                  onTap={tool === 'select' ? () => handleShapeSelect(line.id) : undefined}
                />
              ))}
              
              {/* Shapes */}
              {shapes.map((shape, i) => {
                // Skip invalid shapes
                if (!shape || !shape.id || !shape.type) {
                  console.warn('Invalid shape found:', shape);
                  return null;
                }
                
                // Common props for all shapes
                const commonProps = {
                  id: shape.id.toString(),
                  onClick: tool === 'select' ? () => handleShapeSelect(shape.id) : undefined,
                  onTap: tool === 'select' ? () => handleShapeSelect(shape.id) : undefined,
                  opacity: opacity,
                  draggable: tool === 'select',
                  onDragEnd: (e) => {
                    handleShapeTransform(shape.id, {
                      x: e.target.x(),
                      y: e.target.y()
                    });
                  },
                  onTransformEnd: (e) => {
                    const node = e.target;
                    handleShapeTransform(shape.id, {
                      x: node.x(),
                      y: node.y(),
                      width: node.width() * node.scaleX(),
                      height: node.height() * node.scaleY(),
                      rotation: node.rotation()
                    });
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
                      {selectedId === shape.id && (
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
                      {selectedId === shape.id && (
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
                      {selectedId === shape.id && (
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
                      {selectedId === shape.id && (
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
                          setSelectedId(shape.id);
                          setTextValue(shape.text);
                          setIsTextEditing(true);
                        }}
                      />
                      {selectedId === shape.id && (
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
    </div>
  );
};

export default WhiteboardPage;
