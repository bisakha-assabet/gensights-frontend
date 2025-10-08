'use client';
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import { Shield } from 'lucide-react';

interface QRCodeModalProps {
  qrCodeData: string | undefined;
  email: string;
}

export default function QRCodeModal({ qrCodeData, email }: QRCodeModalProps) {
  const { verifyMfa } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
   
    try {
      await verifyMfa(otp, email);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-blue-600">
            <Shield className="w-6 h-6" />
            <span className="text-xl font-bold">GENSIGHTS</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - QR Code */}
            <div className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-12">Set Up Authentication</h2>
              
              <div className="mb-6">
                {qrCodeData ? (
                  <img
                    src={`data:image/png;base64,${qrCodeData}`}
                    alt="MFA QR Code"
                    className="w-48 h-48 mx-auto border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mx-auto border border-gray-300 rounded-lg">
                    <span className="text-gray-500 text-sm">Loading QR Code...</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Scan the QR code with your authenticator app
              </p>
            </div>

            {/* Right Side - Form */}
            <div className="p-12 bg-gray-50 flex flex-col justify-center">
              <div className="mb-8">
                <div className="w-64 h-48 mx-auto mb-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center relative">
                  {/* Laptop illustration */}
                  <div className="relative">
                    <div className="w-48 h-32 bg-gray-800 rounded-lg border-2 border-gray-300 relative">
                      <div className="absolute top-2 left-2 right-2 bottom-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                    {/* Person illustration */}
                    <div className="absolute -left-8 -bottom-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <div className="w-6 h-12 bg-blue-400 rounded-lg mx-auto mt-1"></div>
                      <div className="w-4 h-6 bg-blue-300 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleMfaVerify} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Enter the code appeared in your authenticator app
                  </label>
                  <div className="flex gap-2 justify-center mb-4">
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        value={otp[i] || ""}
                        onChange={(e) => {
                          const newOtp = otp.split("");
                          newOtp[i] = e.target.value.replace(/[^0-9]/g, ""); // only digits
                          setOtp(newOtp.join(""));

                          // move focus to next box if digit entered
                          if (e.target.value && i < 5) {
                            const next = document.getElementById(`otp-${i + 1}`);
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            const prev = document.getElementById(`otp-${i - 1}`);
                            prev?.focus();
                          }
                        }}
                        id={`otp-${i}`} // unique id for each box
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
                  )}
                </div>
               
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Verify & Complete Setup
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}