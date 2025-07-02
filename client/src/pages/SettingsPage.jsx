import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { 
  BellIcon, 
  PaintBrushIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    collaboratorJoined: true,
    boardUpdates: true,
    weeklyDigest: false,
    
    // Appearance settings
    theme: 'light',
    language: 'en',
    gridSize: 20,
    showGrid: true,
    snapToGrid: true,
    
    // Privacy settings
    profileVisibility: 'public',
    allowInvitations: true,
    showOnlineStatus: true,
    
    // Collaboration settings
    defaultPermission: 'edit',
    autoSave: true,
    saveInterval: 30
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would make an API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const settingSections = [
    {
      id: 'notifications',
      icon: BellIcon,
      title: 'Notifications',
      description: 'Configure how you receive notifications',
      settings: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'toggle'
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive push notifications in your browser',
          type: 'toggle'
        },
        {
          key: 'collaboratorJoined',
          label: 'Collaborator Joined',
          description: 'Notify when someone joins your whiteboard',
          type: 'toggle'
        },
        {
          key: 'boardUpdates',
          label: 'Board Updates',
          description: 'Notify about changes to shared boards',
          type: 'toggle'
        },
        {
          key: 'weeklyDigest',
          label: 'Weekly Digest',
          description: 'Receive a weekly summary of your activity',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'appearance',
      icon: PaintBrushIcon,
      title: 'Appearance',
      description: 'Customize the look and feel of your workspace',
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ]
        },
        {
          key: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' }
          ]
        },
        {
          key: 'showGrid',
          label: 'Show Grid',
          description: 'Display grid lines on whiteboards',
          type: 'toggle'
        },
        {
          key: 'snapToGrid',
          label: 'Snap to Grid',
          description: 'Automatically align objects to grid',
          type: 'toggle'
        },
        {
          key: 'gridSize',
          label: 'Grid Size',
          description: 'Size of grid cells in pixels',
          type: 'range',
          min: 10,
          max: 50,
          step: 5
        }
      ]
    },
    {
      id: 'privacy',
      icon: ShieldCheckIcon,
      title: 'Privacy & Security',
      description: 'Control your privacy and security settings',
      settings: [
        {
          key: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Who can see your profile',
          type: 'select',
          options: [
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
            { value: 'team', label: 'Team Only' }
          ]
        },
        {
          key: 'allowInvitations',
          label: 'Allow Invitations',
          description: 'Allow others to invite you to collaborate',
          type: 'toggle'
        },
        {
          key: 'showOnlineStatus',
          label: 'Show Online Status',
          description: 'Display when you are online to others',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'collaboration',
      icon: UserGroupIcon,
      title: 'Collaboration',
      description: 'Configure collaboration and sharing settings',
      settings: [
        {
          key: 'defaultPermission',
          label: 'Default Permission',
          description: 'Default permission level for new collaborators',
          type: 'select',
          options: [
            { value: 'view', label: 'View Only' },
            { value: 'edit', label: 'Can Edit' },
            { value: 'admin', label: 'Admin' }
          ]
        },
        {
          key: 'autoSave',
          label: 'Auto Save',
          description: 'Automatically save changes to whiteboards',
          type: 'toggle'
        },
        {
          key: 'saveInterval',
          label: 'Save Interval',
          description: 'How often to auto-save (in seconds)',
          type: 'range',
          min: 10,
          max: 300,
          step: 10
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Customize your WhiteBoard experience
          </p>
        </div>

        <div className="space-y-8">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">
                          {setting.label}
                        </label>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      
                      <div className="ml-4">
                        {setting.type === 'toggle' && (
                          <button
                            onClick={() => handleToggle(setting.key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                              settings[setting.key] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                settings[setting.key] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                        
                        {setting.type === 'select' && (
                          <select
                            value={settings[setting.key]}
                            onChange={(e) => handleSelect(setting.key, e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          >
                            {setting.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {setting.type === 'range' && (
                          <div className="w-32">
                            <input
                              type="range"
                              min={setting.min}
                              max={setting.max}
                              step={setting.step}
                              value={settings[setting.key]}
                              onChange={(e) => handleSelect(setting.key, parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-600 text-center mt-1">
                              {settings[setting.key]}{setting.key === 'gridSize' ? 'px' : 's'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Export/Import Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <ComputerDesktopIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export or import your settings and data</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Export Settings</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Download your current settings as a JSON file
                  </p>
                  <Button variant="outline" size="sm">
                    Export Settings
                  </Button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Import Settings</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Import settings from a previously exported file
                  </p>
                  <Button variant="outline" size="sm">
                    Import Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
