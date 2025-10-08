'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ForgotPasswordSuccessProps {
  email?: string;
}

export default function ForgotPasswordSuccess({ email }: ForgotPasswordSuccessProps) {
  const handleContactSupport = () => {
    console.log('Contact support clicked');
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

        {/* Success Message Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Recovery Email Sent!
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Please check your email for next steps to reset your password.
              </p>
            </div>

            {/* Contact Support Button */}
            <button
              onClick={handleContactSupport}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              CONTACT SUPPORT
            </button>

            {/* Spacer */}
            <div className="py-4"></div>

            {/* Back to Login */}
            <Link
              href="/login"
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center block"
            >
              BACK TO LOGIN
            </Link>
          </div>
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