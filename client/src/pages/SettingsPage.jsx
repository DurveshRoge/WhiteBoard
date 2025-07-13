import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const SettingsPage = () => {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Manage your account settings
          </p>
        </div>
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Account</CardTitle>
            <CardDescription className="text-base">
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                  {user?.email}
                </div>
              </div>
              <div className="pt-4 text-gray-500 text-sm">
                More settings coming soon.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
