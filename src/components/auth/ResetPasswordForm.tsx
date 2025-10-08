'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FormData {
  newPassword: string;
  retryPassword: string;
}

interface FormErrors {
  newPassword?: string;
  retryPassword?: string;
  submit?: string;
}

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    retryPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.retryPassword) {
      newErrors.retryPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.retryPassword) {
      newErrors.retryPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      console.log('Password reset successful');
    
      alert('Password reset successful!');
      
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrors({ submit: 'Password reset failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="Gensights"
            width={160}
            height={40}
            className="mx-auto"
          />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-gray-600 text-sm">
              Type in your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <input
                type="password"
                name="newPassword"
                placeholder="New password *"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.newPassword 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                required
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Retry Password Field */}
            <div>
              <input
                type="password"
                name="retryPassword"
                placeholder="Retry new password *"
                value={formData.retryPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.retryPassword 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                required
              />
              {errors.retryPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.retryPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            )}

            {/* Reset Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  RESETTING...
                </>
              ) : (
                <>
                  RESET
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* Back to Login */}
            <Link
              href="/login"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center block"
            >
              BACK TO LOGIN
            </Link>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-500 space-x-4">
          <Link href="/terms" className="hover:text-gray-700 transition-colors">
            Terms and conditions
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy policy
          </Link>
        </div>
      </div>
    </div>
  );
}