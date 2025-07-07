import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoardStore } from '../stores/boardStore';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  UsersIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  FolderIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardData, setNewBoardData] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, boardId: null, boardTitle: '' });
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, analytics: null, boardTitle: '' });
  const [shareModal, setShareModal] = useState({ open: false, boardId: null, boardTitle: '', shareLink: '' });

  const { user } = useAuthStore();
  const { boards, loading, fetchBoards, createBoard, deleteBoard, archiveBoard, restoreBoard, getBoardAnalytics, duplicateBoard } = useBoardStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    
    // Fetch boards when component mounts
    const loadInitialBoards = async () => {
      try {
        const result = await fetchBoards();
        if (!result.success) {
          console.error('Failed to load boards');
        }
      } catch (error) {
        console.error('Dashboard - Error loading boards:', error);
      }
    };
    
    loadInitialBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - we only want to fetch once on mount

  const filteredBoards = Array.isArray(boards) 
    ? boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) 
    : [];

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardData.title.trim()) {
      toast.error('Board title is required');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createBoard(newBoardData.title, newBoardData.description);
      if (result.success) {
        toast.success('Board created successfully!');
        setShowCreateModal(false);
        setNewBoardData({ title: '', description: '' });
        navigate(`/whiteboard/${result.board._id}`);
      } else {
        toast.error(result.error || 'Failed to create board');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId, boardTitle) => {
    setDeleteModal({ open: true, boardId, boardTitle });
  };

  const confirmDeleteBoard = async () => {
    if (!deleteModal.boardId) return;
    const result = await deleteBoard(deleteModal.boardId);
    if (result.success) {
      toast.success('Board deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete board');
    }
    setDeleteModal({ open: false, boardId: null, boardTitle: '' });
  };

  const cancelDeleteBoard = () => {
    setDeleteModal({ open: false, boardId: null, boardTitle: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const handleArchiveBoard = async (boardId) => {
    const result = await archiveBoard(boardId);
    if (result.success) toast.success('Board archived');
    else toast.error(result.error);
  };

  const handleRestoreBoard = async (boardId) => {
    const result = await restoreBoard(boardId);
    if (result.success) toast.success('Board restored');
    else toast.error(result.error);
  };

  const handleShowAnalytics = async (boardId, boardTitle) => {
    const result = await getBoardAnalytics(boardId);
    if (result.success) setAnalyticsModal({ open: true, analytics: result.analytics, boardTitle });
    else toast.error(result.error);
  };

  const handleShareBoard = (boardId, boardTitle) => {
    const shareLink = `${window.location.origin}/whiteboard/${boardId}`;
    setShareModal({ open: true, boardId, boardTitle, shareLink });
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareModal.shareLink);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = `Join me on WhiteBoard: ${shareModal.boardTitle}`;
    const body = `I'd like to invite you to collaborate on my whiteboard "${shareModal.boardTitle}".\n\nClick the link below to join:\n${shareModal.shareLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleDuplicateBoard = async (boardId, boardTitle) => {
    const result = await duplicateBoard(boardId);
    if (result.success) {
      toast.success(`Board "${boardTitle}" duplicated successfully!`);
    } else {
      toast.error(result.error || 'Failed to duplicate board');
    }
  };

  if (loading && boards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your whiteboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header removed: Navigation is now only global */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-xl text-gray-600">
                Ready to create something amazing?
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Whiteboard
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Total Boards Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Boards</p>
                  <p className="text-3xl font-bold">{boards?.length || 0}</p>
                </div>
                <FolderIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Active Collaborators Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Collaborators</p>
                  <p className="text-3xl font-bold">{
                    Array.isArray(boards) && boards.length > 0
                      ? Array.from(new Set(boards.flatMap(b => (b.collaborators || []).map(c => c.user?._id || c.user)))).length
                      : 0
                  }</p>
                </div>
                <UsersIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className={`mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search whiteboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Boards Grid */}
        {filteredBoards.length === 0 ? (
          <div className={`text-center py-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <PencilIcon className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery ? 'No matching whiteboards' : 'No whiteboards yet'}
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Create your first whiteboard to start collaborating with your team.'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Whiteboard
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {filteredBoards.map((board, index) => (
              <Card 
                key={board._id} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 bg-white/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {board.title}
                      </CardTitle>
                      {board.description && (
                        <CardDescription className="mt-1 line-clamp-2 text-gray-600">
                          {board.description}
                        </CardDescription>
                      )}
                    </div>
                    
                    <div className="relative ml-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Board Preview */}
                  <Link to={`/whiteboard/${board._id}`}>
                    <div className="w-full h-40 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center justify-center mb-4 cursor-pointer group-hover:shadow-lg">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <PencilIcon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Click to open</p>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Board Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {getTimeAgo(board.updatedAt)}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        {board.collaborators?.length || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex space-x-1">
                      <button
                        title="Share"
                        onClick={() => handleShareBoard(board._id, board.title)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        title="Duplicate"
                        onClick={() => handleDuplicateBoard(board._id, board.title)}
                        className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-all duration-200"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="Analytics"
                        onClick={() => handleShowAnalytics(board._id, board.title)}
                        className="p-2 rounded-lg hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 transition-all duration-200"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex space-x-1">
                      {board.archived ? (
                        <button
                          title="Restore"
                          onClick={() => handleRestoreBoard(board._id)}
                          className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-all duration-200"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          title="Archive"
                          onClick={() => handleArchiveBoard(board._id)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200"
                        >
                          <FolderIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        title="Rename"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200"
                        onClick={() => navigate(`/whiteboard/${board._id}`)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        title="Delete"
                        onClick={() => handleDeleteBoard(board._id, board.title)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-200"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Whiteboard
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Give your whiteboard a name and description
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleCreateBoard} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-semibold text-gray-700">
                      Title *
                    </label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter whiteboard title"
                      value={newBoardData.title}
                      onChange={(e) => setNewBoardData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Enter a brief description"
                      value={newBoardData.description}
                      onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewBoardData({ title: '', description: '' });
                      }}
                      className="flex-1 h-12"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    >
                      {isCreating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Create
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="flex flex-col items-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-gray-900">Delete Board?</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteModal.boardTitle}"</span>? This action cannot be undone.</p>
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={cancelDeleteBoard}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeleteBoard}
                    className="px-6 py-2"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {analyticsModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics for {analyticsModal.boardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsModal.analytics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between"><span className="font-semibold">Views:</span> <span>{analyticsModal.analytics.views}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Forks:</span> <span>{analyticsModal.analytics.forks}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Collaborators:</span> <span>{analyticsModal.analytics.collaboratorCount}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Last Activity:</span> <span>{analyticsModal.analytics.lastActivity ? new Date(analyticsModal.analytics.lastActivity).toLocaleString() : '-'}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Created At:</span> <span>{analyticsModal.analytics.createdAt ? new Date(analyticsModal.analytics.createdAt).toLocaleString() : '-'}</span></div>
                    <div className="flex justify-between"><span className="font-semibold">Updated At:</span> <span>{analyticsModal.analytics.updatedAt ? new Date(analyticsModal.analytics.updatedAt).toLocaleString() : '-'}</span></div>
                    <div className="flex flex-col"><span className="font-semibold mb-1">Active Users:</span> <span>{analyticsModal.analytics.activeUsers?.length || 0}</span></div>
                  </div>
                ) : (
                  <div>Loading analytics...</div>
                )}
                <div className="mt-6 text-center">
                  <Button onClick={() => setAnalyticsModal({ open: false, analytics: null, boardTitle: '' })} className="bg-gradient-to-r from-yellow-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">Close</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Modal */}
        {shareModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Share Board
                  </CardTitle>
                  <button
                    onClick={() => setShareModal({ open: false, boardId: null, boardTitle: '', shareLink: '' })}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <CardDescription className="text-gray-600 mt-2">
                  Share "{shareModal.boardTitle}" with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Share Link */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Share Link</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={shareModal.shareLink}
                      readOnly
                      className="flex-1 bg-gray-50 border-gray-200"
                    />
                    <Button
                      onClick={copyShareLink}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Anyone with this link can view and collaborate on the board</p>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Share via</h3>
                  
                  <Button
                    onClick={shareViaEmail}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-3" />
                    Email
                  </Button>

                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `WhiteBoard: ${shareModal.boardTitle}`,
                          text: `Check out this collaborative whiteboard: ${shareModal.boardTitle}`,
                          url: shareModal.shareLink
                        });
                      } else {
                        copyShareLink();
                      }
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ShareIcon className="w-4 h-4 mr-3" />
                    More Options
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => setShareModal({ open: false, boardId: null, boardTitle: '', shareLink: '' })} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
