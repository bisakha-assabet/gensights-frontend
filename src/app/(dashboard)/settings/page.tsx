"use client";

import React, { useState, useContext } from 'react';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '@/context/auth/';
import type { AuthContextType } from '@/context/auth/authTypes';

const SettingsPage = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return <div>Loading...</div>;
  }
  
  const { user, changePassword } = authContext;
  
  const [activeTab, setActiveTab] = useState('account');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    previous: false,
    new: false,
    confirm: false
  });
  
  const [accountData, setAccountData] = useState({
    fullName: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    role: user?.role || '',
    phoneNumber: '',
    therapeuticArea: user?. therapeutic_areas|| '',
    accessibleCountries: user?.accessible_countries ? user.accessible_countries.join(', ') : '',
    // organization: user?.organization_id?.toString() || ''
  });

  const [passwordData, setPasswordData] = useState({
    previous: '',
    new: '',
    confirm: ''
  });

  const togglePasswordVisibility = (field: 'previous' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAccountSubmit = async () => {
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      // You'll need to add an updateProfile function to your auth actions
      // For now, this is a placeholder that shows success
      console.log('Updating profile...', accountData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.previous || !passwordData.new || !passwordData.confirm) {
      setUpdateError('Please fill in all password fields');
      return;
    }
    
    if (passwordData.new !== passwordData.confirm) {
      setUpdateError('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 8) {
      setUpdateError('Password must be at least 8 characters long');
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    
    try {
      await changePassword({
        email: user?.email || '',
        temporary_password: passwordData.previous,  
        new_password: passwordData.new
      });
      
      setPasswordData({ previous: '', new: '', confirm: '' });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError('Failed to change password. Please check your current password.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReset = () => {
    setAccountData({
      fullName: user ? `${user.first_name} ${user.last_name}` : '',
      email: user?.email || '',
      role: user?.role || '',
      phoneNumber: '',
      therapeuticArea: user?.therapeutic_areas|| '',
      accessibleCountries: user?.accessible_countries ? user.accessible_countries.join(', ') : '',
      // organization: user?.organization_id?.toString() || ''
    });
  };

  const getPasswordStrength = () => {
    const password = passwordData.new;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Account Setting
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Login & Security
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg p-8">
          {/* Success Message */}
          {updateSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-green-800 text-sm">
                {activeTab === 'account' ? 'Profile updated successfully!' : 'Password changed successfully!'}
              </div>
            </div>
          )}

          {/* Error Message */}
          {updateError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">{updateError}</div>
            </div>
          )}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Profile Picture Section */}
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user ? `${user.first_name} ${user.last_name}` : 'User Name'}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                  <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline">
                    Upload your photo
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={accountData.fullName}
                    onChange={(e) => setAccountData({...accountData, fullName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={accountData.role}
                    onChange={(e) => setAccountData({...accountData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-sm">+88</span>
                    <input
                      type="text"
                      value={accountData.phoneNumber.replace('+88 ', '')}
                      onChange={(e) => setAccountData({...accountData, phoneNumber: '+88 ' + e.target.value})}
                      className="w-full pl-12 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Therapeutic Area
                  </label>
                  <input
                    type="text"
                    value={accountData.therapeuticArea}
                    onChange={(e) => setAccountData({...accountData, therapeuticArea: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessible Countries
                  </label>
                  <input
                    type="text"
                    value={accountData.accessibleCountries}
                    onChange={(e) => setAccountData({...accountData, accessibleCountries: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleAccountSubmit}
                  disabled={updateLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={updateLoading}
                  className="bg-white text-gray-700 px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h2>
                <p className="text-sm text-gray-600 mb-8">
                  Please enter your new password. Make sure to save your password.
                </p>
              </div>

              <div className="space-y-6 max-w-md">
                {/* Previous Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPasswords.previous ? 'text' : 'password'}
                      placeholder="Current password"
                      value={passwordData.previous}
                      onChange={(e) => setPasswordData({...passwordData, previous: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-3.5">
                      <div className="w-4 h-4 border border-gray-400 rounded"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('previous')}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.previous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      placeholder="New password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-3.5">
                      <div className="w-4 h-4 border border-gray-400 rounded"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordData.new && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                        <span>At least 8 characters and at least 2 numbers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getPasswordStrength() < 50 ? 'bg-red-400' : 
                            getPasswordStrength() < 75 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${getPasswordStrength()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-3.5">
                      <div className="w-4 h-4 border border-gray-400 rounded"></div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Change Password Button */}
                <button
                  onClick={handlePasswordSubmit}
                  disabled={updateLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;