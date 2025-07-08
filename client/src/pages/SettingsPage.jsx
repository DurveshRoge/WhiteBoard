import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { 
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    comments: true,
    collaborators: true,
    boardUpdates: false
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    autoSave: true,
    soundEffects: true,
    animations: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityVisible: false,
    showOnlineStatus: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    { id: 'collaboration', label: 'Collaboration', icon: UserGroupIcon },
    { id: 'data', label: 'Data & Storage', icon: ArrowDownTrayIcon },
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated');
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Preferences updated');
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Privacy settings updated');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-brand-600 rounded-lg flex items-center justify-center">
                    <Cog6ToothIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your basic account details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Account Type</label>
                    <div className="mt-1 p-3 bg-gradient-to-r from-blue-50 to-brand-50 rounded-lg border border-blue-200">
                      <span className="text-blue-700 font-medium">Professional</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Language</label>
                    <select 
                      value={preferences.language} 
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Timezone</label>
                    <select className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <BellIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries({
                  email: 'Email notifications',
                  push: 'Push notifications',
                  comments: 'New comments on your boards',
                  collaborators: 'New collaborator invitations',
                  boardUpdates: 'Board updates and changes'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">Receive notifications for this activity</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Control your privacy and security settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Account Secured</h4>
                      <p className="text-sm text-green-700">Your account is protected with strong security measures</p>
                    </div>
                  </div>
                </div>

                {Object.entries({
                  profileVisible: 'Make profile visible to other users',
                  activityVisible: 'Show activity status to collaborators',
                  showOnlineStatus: 'Display online status'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        privacy[key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacy[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Security Actions</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50">
                      <KeyIcon className="w-4 h-4 mr-3" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      <DevicePhoneMobileIcon className="w-4 h-4 mr-3" />
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <PaintBrushIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Appearance & Theme</CardTitle>
                    <CardDescription>Customize how WhiteBoard looks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', name: 'Light', preview: 'bg-white border-2' },
                      { id: 'dark', name: 'Dark', preview: 'bg-gray-900 border-2' },
                      { id: 'auto', name: 'Auto', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handlePreferenceChange('theme', theme.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          preferences.theme === theme.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-full h-16 rounded ${theme.preview} mb-2`}></div>
                        <p className="text-sm font-medium">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    autoSave: 'Auto-save changes',
                    soundEffects: 'Sound effects',
                    animations: 'Animations and transitions'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange(key, !preferences[key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences[key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Collaboration Settings</CardTitle>
                    <CardDescription>Manage how you collaborate with others</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Default sharing permission</label>
                    <select className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>View only</option>
                      <option>Can comment</option>
                      <option>Can edit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Voice chat quality</label>
                    <select className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Standard</option>
                      <option>High quality</option>
                      <option>Low bandwidth</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <SpeakerWaveIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Auto-join voice chat</p>
                        <p className="text-sm text-gray-600">Automatically join voice when entering a board</p>
                      </div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <VideoCameraIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Show cursor movements</p>
                        <p className="text-sm text-gray-600">Display your cursor to other users</p>
                      </div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Data & Storage</CardTitle>
                    <CardDescription>Manage your data and storage options</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-brand-50 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">2.4 GB</p>
                    <p className="text-sm text-gray-600">Storage used</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <p className="text-2xl font-bold text-emerald-600">12</p>
                    <p className="text-sm text-gray-600">Total boards</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <p className="text-2xl font-bold text-amber-600">∞</p>
                    <p className="text-sm text-gray-600">Storage limit</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Data Management</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-3" />
                      Export all boards
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-3" />
                      Download user data
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                      <div>
                        <h4 className="font-semibold text-red-900">Danger Zone</h4>
                        <p className="text-sm text-red-700">These actions cannot be undone</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                      <TrashIcon className="w-4 h-4 mr-3" />
                      Delete account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-brand-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-8">
              <CardContent className="p-0">
                <nav className="space-y-1 p-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-brand-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
