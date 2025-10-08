'use client';
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
// TODO: Re-enable these imports when MFA is re-implemented
// import OtpForm from '@/components/auth/OtpForm';
// import QRCodeModal from '@/components/auth/QRCodeModal';

export default function LoginPage() {
  const { mfaState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  console.log('MFA State:', mfaState);
  
  // TODO: Re-enable MFA flow when backend issues are resolved
  /*
  // MFA Setup Screen
  if (mfaState.requiresMfaSetup) {
    return (
      <QRCodeModal 
        qrCodeData={mfaState.qrCodeData} 
        email={email}
      />
    );
  }

  console.log('Requires OTP:', mfaState.requiresOtp)
  // OTP Verification Screen
  if (mfaState.requiresOtp) {
    return (
      <OtpForm 
        email={email} 
        password={password}
      />
    );
  }
  */

  // Direct Login Screen - Goes straight to dashboard after successful login
  return (
    <LoginForm 
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
    />
  );
}