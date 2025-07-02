import React, { useState, useEffect } from 'react';
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
  UsersIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardData, setNewBoardData] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuthStore();
  const { boards, loading, fetchBoards, createBoard, deleteBoard } = useBoardStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBoards = async () => {
      try {
        // Get auth state
        const { token, user } = useAuthStore.getState();
        
        console.log('Dashboard - Current auth state:', { 
          hasToken: !!token, 
          hasUser: !!user,
          userId: user?.id
        });
        
        // Fetch boards
        const result = await fetchBoards();
        
        console.log('Dashboard - Boards loaded:', result);
        console.log('Dashboard - Available boards:', boards?.length || 0);
        
        if (Array.isArray(boards) && boards.length > 0) {
          // Log the first board to check structure
          console.log('Dashboard - First board details:', {
            id: boards[0]._id,
            title: boards[0].title,
            owner: boards[0].owner?._id || boards[0].owner,
            isOwner: user && (boards[0].owner?._id === user.id || boards[0].owner === user.id)
          });
        }
      } catch (error) {
        console.error('Dashboard - Error loading boards:', error);
      }
    };
    
    loadBoards();
  }, [fetchBoards, boards]);

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
    if (window.confirm(`Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`)) {
      const result = await deleteBoard(boardId);
      if (result.success) {
        toast.success('Board deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete board');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && boards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your whiteboards and start collaborating
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Whiteboard
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search whiteboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Boards Grid */}
        {filteredBoards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PencilIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No matching whiteboards' : 'No whiteboards yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first whiteboard to start collaborating'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Whiteboard
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBoards.map((board) => (
              <Card key={board._id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {board.title}
                      </CardTitle>
                      {board.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {board.description}
                        </CardDescription>
                      )}
                    </div>
                    
                    <div className="relative ml-2">
                      <button className="p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Board Preview */}
                  <Link to={`/whiteboard/${board._id}`}>
                    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors duration-200 flex items-center justify-center mb-4 cursor-pointer">
                      <div className="text-center">
                        <PencilIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Click to open</span>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Board Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Updated {formatDate(board.updatedAt)}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <UsersIcon className="w-3 h-3 mr-1" />
                      {board.collaborators?.length || 0} collaborators
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex space-x-1">
                      <button
                        title="Share"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        title="Duplicate"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        title="Rename"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        title="Delete"
                        onClick={() => handleDeleteBoard(board._id, board.title)}
                        className="p-1.5 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-700"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Whiteboard</CardTitle>
                <CardDescription>
                  Give your whiteboard a name and description
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleCreateBoard} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter whiteboard title"
                      value={newBoardData.title}
                      onChange={(e) => setNewBoardData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Enter a brief description"
                      value={newBoardData.description}
                      onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isCreating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </div>
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
