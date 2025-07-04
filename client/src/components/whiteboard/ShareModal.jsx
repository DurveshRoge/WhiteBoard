import React, { useState } from 'react';
import { 
  XMarkIcon, 
  UserPlusIcon, 
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UsersIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import axios from 'axios';
import { toast } from 'sonner';

const ShareModal = ({ isOpen, onClose, boardId, boardTitle, currentCollaborators = [] }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const roles = [
    { 
      value: 'viewer', 
      label: 'Viewer', 
      description: 'Can view the board',
      icon: ShieldCheckIcon,
      color: 'text-blue-600 bg-blue-50'
    },
    { 
      value: 'editor', 
      label: 'Editor', 
      description: 'Can edit the board',
      icon: UserPlusIcon,
      color: 'text-green-600 bg-green-50'
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Can manage collaborators',
      icon: UsersIcon,
      color: 'text-purple-600 bg-purple-50'
    }
  ];

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/whiteboard/${boardId}`;
    setShareLink(link);
    return link;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const addCollaborator = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/boards/${boardId}/collaborators`, {
        email: email.trim(),
        role
      });

      toast.success('Collaborator added successfully!');
      setEmail('');
      setRole('viewer');
      
      // Refresh the page or update the collaborators list
      window.location.reload();
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error(error.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (userId) => {
    try {
      await axios.delete(`/api/boards/${boardId}/collaborators/${userId}`);
      toast.success('Collaborator removed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Board</h2>
              <p className="text-sm text-gray-600">{boardTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Share Link Section */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                <span>Share Link</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  value={shareLink || generateShareLink()}
                  readOnly
                  variant="filled"
                  className="flex-1"
                />
                <Button
                  size="default"
                  variant={copied ? "success" : "default"}
                  onClick={() => copyToClipboard(shareLink || generateShareLink())}
                  leftIcon={copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Collaborator Section */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <UserPlusIcon className="w-5 h-5 text-green-600" />
                <span>Add Collaborator</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addCollaborator} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    leftIcon={<EnvelopeIcon className="w-4 h-4" />}
                    variant="outline"
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {roles.map((roleOption) => {
                      const Icon = roleOption.icon;
                      return (
                        <button
                          key={roleOption.value}
                          type="button"
                          onClick={() => setRole(roleOption.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            role === roleOption.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${roleOption.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{roleOption.label}</div>
                              <div className="text-xs text-gray-500">{roleOption.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                  loading={loading}
                  leftIcon={<UserPlusIcon className="w-4 h-4" />}
                >
                  Add Collaborator
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Collaborators Section */}
          {currentCollaborators.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                  <span>Current Collaborators ({currentCollaborators.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentCollaborators.map((collaborator) => {
                    const roleInfo = roles.find(r => r.value === collaborator.role);
                    const Icon = roleInfo?.icon;
                    return (
                      <div key={collaborator.user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-semibold">
                              {collaborator.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{collaborator.user.name}</p>
                            <p className="text-sm text-gray-500">{collaborator.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${roleInfo?.color}`}>
                            {Icon && <Icon className="w-3 h-3" />}
                            <span className="capitalize">{collaborator.role}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={() => removeCollaborator(collaborator.user._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 