import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { 
  UserIcon, 
  PencilIcon, 
  CameraIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-brand-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-brand-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm sticky top-8">
              <CardContent className="pt-8">
                <div className="text-center">
                  {/* Avatar Section */}
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-brand-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl relative overflow-hidden group">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-16 h-16" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <CameraIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  
                  {/* Profile Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-xs text-gray-500">Boards</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-brand-600">5</p>
                      <p className="text-xs text-gray-500">Collaborators</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">3</p>
                      <p className="text-xs text-gray-500">Teams</p>
                    </div>
                  </div>
                  
                  {user?.bio && (
                    <div className="text-left">
                      <p className="text-gray-700 bg-gradient-to-r from-blue-50 to-brand-50 rounded-lg p-4 text-sm leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings and Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-brand-600 rounded-lg flex items-center justify-center">
                      <PencilIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Personal Information</CardTitle>
                      <CardDescription className="text-base">
                        Update your personal details
                      </CardDescription>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-500 to-brand-600 text-white border-0 hover:from-blue-600 hover:to-brand-700 shadow-lg"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`h-12 text-base ${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true}
                        className="h-12 text-base bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`flex w-full rounded-lg border px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                        !isEditing ? 'bg-gray-50 border-gray-200' : 'bg-background border-blue-300'
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 h-12"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-brand-600 hover:from-blue-700 hover:to-brand-700 shadow-lg"
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Account Security Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Security</CardTitle>
                    <CardDescription className="text-base">
                      Manage your account security settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <KeyIcon className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Password</p>
                        <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-brand-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Not enabled</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity & Analytics Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Activity & Analytics</CardTitle>
                    <CardDescription className="text-base">
                      Your WhiteBoard usage statistics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-brand-50 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">24h</p>
                    <p className="text-sm text-gray-600">Total time</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <StarIcon className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">8</p>
                    <p className="text-sm text-gray-600">Starred boards</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <UserGroupIcon className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">15</p>
                    <p className="text-sm text-gray-600">Collaborations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
