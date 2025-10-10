import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

interface LoginResponse {
  require_otp?: boolean;
  require_mfa_setup?: boolean;
  qr_code_base64?: string;
  temp_token?: string;
  is_temp_password?: boolean;
  password_expired?: boolean;
  access?: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  user_id?: number;
  // organization_id?: number;
}

export async function POST(request: Request) {
  try {
    const { email, password, otp, remember, is_temporary_otp } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await apiClient<LoginResponse>('/auth/login/', 'POST', {
      email,
      password,
      ...(otp && { otp }),
      remember: remember || false,
      is_temporary_otp: is_temporary_otp || false,
    });

    // Handle MFA required cases
    if (response?.require_otp) {
      return NextResponse.json({
        success: true,
        require_otp: true,
        require_mfa_setup: response.require_mfa_setup || false,
        ...(response.qr_code_base64 && { qr_code_base64: response.qr_code_base64 }),
        ...(response.temp_token && { temp_token: response.temp_token }),
      });
    }

    // Handle temporary password cases
    if (response?.is_temp_password || response?.password_expired) {
      return NextResponse.json({
        success: true,
        is_temp_password: response.is_temp_password,
        password_expired: response.password_expired,
        access: response.access,
      });
    }

    // Successful login
    if (response?.access) {
      return NextResponse.json({
        success: true,
        user: {
          email: response.user_email,
          first_name: response.first_name,
          last_name: response.last_name,
          user_id: response.user_id,
          // organization_id: response.organization_id,
        },
        access: response.access,
      });
    }

    // Unexpected response
    return NextResponse.json(
      { success: false, error: 'Unexpected response from server' },
      { status: 500 }
    );

  } catch (error: any) {
    // Handle API errors
    const statusCode = error.message.includes('failed with status') ? 
      parseInt(error.message.match(/\d+/)[0]) : 500;
    
    let errorMessage = 'Login failed';
    if (statusCode === 401) errorMessage = 'Invalid credentials';
    if (statusCode === 403) errorMessage = 'Account not verified or disabled';
    if (statusCode === 400) errorMessage = 'Invalid request data';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}