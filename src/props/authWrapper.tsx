'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth'
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  loadingComponent = <DefaultLoadingComponent />
}) => {
  const { user, isUserLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log(user)

  useEffect(() => {

    // redirect login after loading is complete and user is not authenticated
    if ( !isUserLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [ isUserLoading, requireAuth, isAuthenticated, router, redirectTo]);

  

  // show loading when user data is being fetched
  if (isUserLoading) {
    return <>{loadingComponent}</>;
  }

  // if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // show loading while redirect is happening
    return <>{loadingComponent}</>;
  }

  // if user is authenticated or auth is not required, render children
  return <>{children}</>;
};

// wrapping components
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthWrapperProps, 'children'>
) => {
  const AuthenticatedComponent = (props: P) => (
    <AuthWrapper {...options}>
      <Component {...props} />
    </AuthWrapper>
  );
  
  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
 
  return AuthenticatedComponent;
};