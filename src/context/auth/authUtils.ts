"use client"
import { v4 as uuidv4 } from "uuid"

export const getDeviceUuid = (): string => {
  if (typeof window !== "undefined") {
    const storedUuid = localStorage.getItem("deviceUuid")
    if (storedUuid) return storedUuid
    const newUuid = uuidv4()
    localStorage.setItem("deviceUuid", newUuid)
    return newUuid
  }
  return uuidv4()
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem("token")
}

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken")
}

export const setStoredToken = (token: string): void => {
  localStorage.setItem("token", token)
}

export const setStoredRefreshToken = (refreshToken: string): void => {
  localStorage.setItem("refreshToken", refreshToken)
}

export const clearStoredTokens = (): void => {
  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
}

export const initialMfaState = {
  requiresOtp: false,
  requiresMfaSetup: false,
  qrCodeData: undefined,
  tempToken: undefined,
}
