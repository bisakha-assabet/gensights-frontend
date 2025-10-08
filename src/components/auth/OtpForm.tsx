'use client';
import { useState } from 'react';
import { useAuth } from '../../context/auth';

interface OtpFormProps {
  email: string;
  password: string;
}

export default function OtpForm({ email, password }: OtpFormProps) {
  const { verifyOtp, error, clearError, loading } = useAuth();
  const [otp, setOtp] = useState('');

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password);
    await verifyOtp(otp, email, password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify</h2>
          <p className="text-gray-600 text-sm">
            Enter the code from your google authenticator app.
          </p>
        </div>
       
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
       
        <form onSubmit={handleOtpVerify}>
          <div className="flex gap-3 mb-6 justify-center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={otp[index] || ''}
                onChange={(e) => {
                  // Clear error when user starts typing
                  if (error) {
                    clearError();
                  }
                  
                  const newOtp = otp.split('');
                  newOtp[index] = e.target.value;
                  setOtp(newOtp.join(''));
                 
                  if (e.target.value && index < 5) {
                    const parent = e.target.parentElement;
                    if (parent) {
                      const nextInput = parent.children[index + 1];
                      if (nextInput) (nextInput as HTMLElement).focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otp[index] && index > 0) {
                    const parent = (e.target as HTMLInputElement).parentElement;
                    if (parent) {
                      const prevInput = parent.children[index - 1];
                      if (prevInput) (prevInput as HTMLElement).focus();
                    }
                  }
                }}
                className={`w-12 h-12 border rounded-lg text-center text-lg font-medium outline-none transition-colors duration-200 ${
                  error 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50 focus:ring-2 focus:ring-red-100' 
                    : 'border-gray-300 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'
                }`}
              />
            ))}
          </div>
         
          <button
            type="submit"
            disabled={loading}
            className={`font-medium rounded-lg py-3 px-8 transition-colors duration-200 block mx-auto ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        
        {/* Retry/Help Text */}
        {error && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Enter the correct otp from your authenticator app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}