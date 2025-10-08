"use client"
import { useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "./AuthContext"
import type { User, MfaState } from "./authTypes"
import { getDeviceUuid, initialMfaState, clearStoredTokens } from "./authUtils"
import {
  getUserByToken as getUserByTokenAction,
  // TODO: Re-enable MFA imports when backend issues are resolved
  // startMfaSetup as startMfaSetupAction,
  // verifyMfa as verifyMfaAction,
  // verifyOtp as verifyOtpAction,
  login as loginAction,
  logout as logoutAction,
  changePassword as changePasswordAction,
} from "./authActions"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaState, setMfaState] = useState<MfaState>(initialMfaState)

  const [deviceUuid] = useState(() => getDeviceUuid())
  const router = useRouter()

  const clearError = () => setError(null)

  const handleAuthFailure = () => {
    clearStoredTokens()
    setUser(null)
    setMfaState(initialMfaState)
    router.replace("/login")
  }

  const getUserByToken = async (): Promise<void> => {
    console.log("AuthProvider getUserByToken called")
    await getUserByTokenAction(deviceUuid, setUser, setIsUserLoading, handleAuthFailure)
  }

  // TODO: Re-enable MFA functions when backend issues are resolved
  /*
  const startMfaSetup = async (): Promise<void> => {
    await startMfaSetupAction(setMfaState, setError)
  }

  const verifyMfa = async (otp: string, email: string): Promise<void> => {
    await verifyMfaAction(otp, email, deviceUuid, setUser, setIsUserLoading, handleAuthFailure, router, setError)
  }

  const verifyOtp = async (otp: string, email: string, password: string): Promise<void> => {
    await verifyOtpAction(otp, email, password, deviceUuid, setUser, setIsUserLoading, handleAuthFailure, router, setError)
  }
  */

  const login = async (credentials: {
    email: string
    password: string
    otp?: string
    remember?: boolean
    device_uuid?: string
  }): Promise<void> => {
    await loginAction(credentials, setLoading, setError, setMfaState, setUser, router)
  }

  const logout = (): void => {
    logoutAction(setUser, setMfaState, router)
  }

  const changePassword = async (data: { email: string; temporary_password: string; new_password: string }): Promise<void> => {
    await changePasswordAction(data, user, setError)
  }

  // Derived property for dashboard: assign product for therapeutic specialists
  const userProduct = (() => {
    if (!user) return null
    if (user.role === "Therapeutic Specialist" && user.therapeutic_area) {
      const productMapping: Record<string, string> = {
        "Neurology": "Cetaprofen",
        "Respiratory": "Respilin",
        "Nephrology": "Betacenib",
      }
      return productMapping[user.therapeutic_area] || null
    }
    return null
  })()

  useEffect(() => {
    const currentPath = window.location.pathname
    console.log("AuthProvider useEffect - current path:", currentPath)
    if (currentPath === '/change-password') {
      setLoading(false)
      return
    }
    console.log("AuthProvider useEffect - calling getUserByToken")
    getUserByToken()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProduct,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        isUserLoading,
        error,
        mfaState,
        // TODO: Re-enable MFA functions when backend issues are resolved
        // startMfaSetup,
        // verifyMfa,
        // verifyOtp,
        startMfaSetup: async () => {}, // Placeholder to prevent errors
        verifyMfa: async () => {}, // Placeholder to prevent errors
        verifyOtp: async () => {}, // Placeholder to prevent errors
        clearError,
        deviceUuid,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}