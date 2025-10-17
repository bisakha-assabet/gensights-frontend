export interface User {
  email: string;
  first_name: string;
  last_name: string;
  user_id: number;
  // organization_id?: number;
  role: string;                        
  therapeutic_areas?: string | null;    
  accessible_countries: string[]; 
}

export interface AuthContextType {
  user: User | null
  userProduct: string | null
  login: (credentials: { email: string; password: string; otp?: string; remember?: boolean; device_uuid?: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
  isUserLoading: boolean
  error: string | null
  mfaState: {
    requiresOtp: boolean
    requiresMfaSetup: boolean
    qrCodeData?: string
    tempToken?: string
  }
  startMfaSetup: () => Promise<void>
  verifyMfa: (otp: string, email: string) => Promise<void>
  verifyOtp: (otp: string, email: string, password: string) => Promise<void>
  clearError: () => void
  deviceUuid: string
  changePassword: (data: { email: string; temporary_password: string; new_password: string }) => Promise<void>
}


export interface LoginCredentials {
  email: string;
  password: string;
  otp?: string;
  remember?: boolean;
  device_uuid?: string;
}

export interface MfaState {
  requiresOtp: boolean;
  requiresMfaSetup: boolean;
  qrCodeData?: string;
  tempToken?: string;
}