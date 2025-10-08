import { NextResponse } from 'next/server'
import { apiClient } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const { email, old_password, new_password } = await request.json()
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      )
    }

    const response = await apiClient(
      '/auth/new-password/',
      'POST',
      {
        email,
        old_password,
        new_password,
      },
      {
        Authorization: authHeader,
      }
    )

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Password change failed' },
        { status: 400 }
      )
    }

    // Clear temp token cookie if it exists
    const res = NextResponse.json({ success: true })
    res.cookies.delete('tempToken')

    // Set new token cookie
    if (response.data.access) {
      res.cookies.set('token', response.data.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      })
    }

    return res
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Password change failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // This can be used to validate if password change is required
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { requiresPasswordChange: false },
        { status: 200 }
      )
    }

    const response = await apiClient(
      '/auth/validate/',
      'GET',
      null,
      {
        Authorization: authHeader,
      }
    )

    return NextResponse.json({
      requiresPasswordChange: !response.success && response.error?.includes('password'),
    })
  } catch (error) {
    return NextResponse.json(
      { requiresPasswordChange: false },
      { status: 200 }
    )
  }
}