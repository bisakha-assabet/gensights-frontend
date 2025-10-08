"use client"
import { apiClient } from "@/lib/api"
import type { User, LoginCredentials, MfaState } from "./authTypes"
import {
  getStoredToken,
  getStoredRefreshToken,
  setStoredToken,
  setStoredRefreshToken,
  clearStoredTokens,
  initialMfaState,
} from "./authUtils"

// --------------------- TOKEN REFRESH ---------------------
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) return false

    const response = await apiClient<{ access: string }>("/auth/login/refresh/", "POST", {
      refresh: refreshToken,
    })

    if (response.access) {
      setStoredToken(response.access)
      return true
    }
    return false
  } catch (error) {
    console.error("Token refresh failed:", error)
    return false
  }
}

// --------------------- GET USER BY TOKEN ---------------------
export const getUserByToken = async (
  deviceUuid: string,
  setUser: (user: User) => void,
  setIsUserLoading: (loading: boolean) => void,
  handleAuthFailure: () => void,
): Promise<void> => {
  console.log("getUserByTokenAction called")
  setIsUserLoading(true)

  try {
    const token = getStoredToken()
    if (!token) throw new Error("No token found")

    console.log("Fetching user details with token...")
    const res = await apiClient<{ data: User }>(
      "/users/get-details/",
      "GET",
      {},
      { Authorization: `Bearer ${token}` }
    )
    console.log("User details received:", res?.data)
    setUser(res?.data)
  } catch (error) {
    console.error("Get user failed, attempting token refresh:", error)

    const refreshSuccessful = await refreshAccessToken()
    if (refreshSuccessful) {
      try {
        const newToken = getStoredToken()
        const res = await apiClient<{ data: User }>(
          "/users/get-details/",
          "GET",
          {},
          { Authorization: `Bearer ${newToken}` }
        )
        setUser(res?.data)
      } catch {
        handleAuthFailure()
      }
    } else handleAuthFailure()
  } finally {
    setIsUserLoading(false)
  }
}

// --------------------- MFA SETUP --------------------- 
// TODO: Re-enable MFA when backend issues are resolved
/*
export const startMfaSetup = async (
  setMfaState: (state: MfaState | ((prev: MfaState) => MfaState)) => void,
  setError: (error: string) => void,
): Promise<void> => {
  try {
    const response = await apiClient<{ qr_code: string; requiresMfaSetup: boolean }>("/api/v1/users/mfa", "GET")
    setMfaState((prev) => ({
      ...prev,
      qrCodeData: response.qr_code,
      requiresMfaSetup: response.requiresMfaSetup,
    }))
  } catch (error) {
    setError("Failed to start MFA setup")
    throw error
  }
}
*/

// --------------------- VERIFY MFA --------------------- 
// TODO: Re-enable MFA when backend issues are resolved
/*
export const verifyMfa = async (
  otp: string,
  email: string,
  deviceUuid: string,
  setUser: (user: User) => void,
  setIsUserLoading: (loading: boolean) => void,
  handleAuthFailure: () => void,
  router: any,
  setError: (error: string | null) => void,
): Promise<void> => {
  try {
    const response = await apiClient<{ access: string; refresh?: string }>(
      `/users/mfa/verify/`,
      "POST",
      { otp, email },
      { Device: deviceUuid },
    )

    setStoredToken(response.access)
    if (response.refresh) setStoredRefreshToken(response.refresh)

    // Directly fetch and set user data
    try {
      const newToken = getStoredToken()
      if (!newToken) throw new Error("No token found")

      console.log("Fetching user details after MFA verification...")
      const res = await apiClient<{ data: User }>(
        "/users/get-details/",
        "GET",
        {},
        { Device: deviceUuid, Authorization: `Bearer ${newToken}` }
      )
      
      if (res?.data) {
        console.log("User data received after MFA verification:", res.data)
        setUser(res.data)
        // Ensure user is set before navigation
        await new Promise(resolve => setTimeout(resolve, 50))
        console.log("Navigating to dashboard after MFA verification")
        router.push("/dashboard")
        setError(null)
      } else {
        throw new Error("No user data received")
      }
    } catch (error) {
      console.error("Failed to fetch user after MFA verification:", error)
      handleAuthFailure()
    }
  } catch (error) {
    setError("Invalid OTP code")
    throw error
  }
}
*/

// --------------------- VERIFY OTP --------------------- 
// TODO: Re-enable OTP when backend issues are resolved
/*
export const verifyOtp = async (
  otp: string,
  email: string,
  password: string,
  deviceUuid: string,
  setUser: (user: User) => void,
  setIsUserLoading: (loading: boolean) => void,
  handleAuthFailure: () => void,
  router: any,
  setError: (error: string | null) => void,
): Promise<void> => {
  try {
    const response = await apiClient<{ data: { access: string; refresh?: string } }>(
      `/auth/login/`,
      "POST",
      { otp, is_temporary_otp: false, remember: false, email, password },
      { Device: deviceUuid },
    )

    setStoredToken(response?.data?.access)
    if (response?.data?.refresh) setStoredRefreshToken(response.data.refresh)

    // Directly fetch and set user data
    try {
      const newToken = getStoredToken()
      if (!newToken) throw new Error("No token found")

      const res = await apiClient<{ data: User }>(
        "/users/get-details/",
        "GET",
        {},
        { Device: deviceUuid, Authorization: `Bearer ${newToken}` }
      )
      
      if (res?.data) {
        setUser(res.data)
        // Ensure user is set before navigation
        await new Promise(resolve => setTimeout(resolve, 50))
        router.push("/dashboard")
        setError(null)
      } else {
        throw new Error("No user data received")
      }
    } catch (error) {
      console.error("Failed to fetch user after OTP verification:", error)
      handleAuthFailure()
    }
  } catch (error) {
    setError("Invalid OTP code")
    throw error
  }
}
*/

// --------------------- LOGIN ---------------------
export const login = async (
  credentials: LoginCredentials,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setMfaState: (state: MfaState) => void,
  setUser: (user: User) => void,
  router: any,
): Promise<void> => {
  setLoading(true)
  setError(null)

  try {
    const response = await apiClient<{
      data: {
        require_otp: boolean
        require_mfa_setup?: boolean
        access?: string
        refresh?: string
        temp_token?: string
        user_email?: string
        first_name?: string
        last_name?: string
        user_id?: number
        organization_id?: number
      }
    }>("/auth/login/", "POST", credentials)

    // TODO: Re-enable MFA/OTP flow when backend issues are resolved
    /*
    // MFA setup required
    if (response?.data?.require_mfa_setup) {
      const qrResponse = await apiClient<{ data: { qr_code: string } }>("/users/mfa/qr/", "POST", {
        email: credentials.email,
        password: credentials.password,
      })

      setMfaState({
        requiresOtp: response?.data?.require_otp,
        requiresMfaSetup: response?.data?.require_mfa_setup,
        tempToken: response?.data?.temp_token,
        qrCodeData: qrResponse?.data?.qr_code,
      })
      return
    }

    // OTP required
    if (response?.data?.require_otp) {
      setMfaState({
        requiresOtp: response?.data?.require_otp,
        requiresMfaSetup: response?.data?.require_mfa_setup ?? false,
        tempToken: response?.data?.temp_token,
      })
      return
    }
    */

    // Direct login - navigate to dashboard immediately
    if (response?.data?.access) {
      setStoredToken(response.data.access)
      if (response?.data?.refresh) setStoredRefreshToken(response.data.refresh)

      // Directly fetch and set user data
      try {
        const newToken = getStoredToken()
        if (!newToken) throw new Error("No token found")

        const res = await apiClient<{ data: User }>(
          "/users/get-details/",
          "GET",
          {},
          { Authorization: `Bearer ${newToken}` }
        )
        
        if (res?.data) {
          setUser(res.data)
          // Ensure user is set before navigation
          await new Promise(resolve => setTimeout(resolve, 50))
          console.log("Login successful, navigating to dashboard")
          router.push("/dashboard")
          setError(null)
        } else {
          throw new Error("No user data received")
        }
      } catch (error) {
        console.error("Failed to fetch user after login:", error)
        throw error
      }
    } else {
      throw new Error("No access token received from login")
    }
  } catch (error: any) {
    setError(error.message || "Login failed")
    console.error("Login error:", error)
    throw error
  } finally {
    setLoading(false)
  }
}

// --------------------- LOGOUT ---------------------
export const logout = (
  setUser: (user: User | null) => void,
  setMfaState: (state: MfaState) => void,
  router: any,
): void => {
  clearStoredTokens()
  setUser(null)
  setMfaState(initialMfaState)
  router.push("/login")
}

// --------------------- CHANGE PASSWORD ---------------------
export const changePassword = async (
  data: { email: string; temporary_password: string; new_password: string },
  user: User | null,
  setError: (error: string | null) => void,
): Promise<void> => {
  try {
    const response = await apiClient<{
      email: string
      old_password: string
      new_password: string
    }>("/auth/new-password/", "PUT", {
      email: data.email,
      old_password: data.temporary_password,
      new_password: data.new_password,
    })

    setError(null)
  } catch (error: any) {
    setError(error.message || "Failed to change password")
    throw error
  }
}