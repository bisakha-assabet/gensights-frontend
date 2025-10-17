'use client';
import { useState, Dispatch, SetStateAction } from 'react';
import { useAuth } from '../../context/auth';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; 

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: Dispatch<SetStateAction<string>>;
  onPasswordChange: Dispatch<SetStateAction<string>>;
}

export default function LoginForm({ email, password, onEmailChange, onPasswordChange }: LoginFormProps) {
  const { login, error, clearError, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      // error is handled and stored in context; swallow to avoid unhandled rejection
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    if (error) clearError();
    onEmailChange(value);
  };

  const handlePasswordChange = (value: string) => {
    if (error) clearError();
    onPasswordChange(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="GENSIGHTS Logo"
            width={160}
            height={60}
            priority
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-500"
                required
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            
            {error && (
              <div className="mt-2 text-sm text-red-600" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={localLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${localLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {localLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-blue-600">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};