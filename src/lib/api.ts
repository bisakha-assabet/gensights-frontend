const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiError {
  message: string
  status?: number
  details?: any
  isNetworkError?: boolean
  responseText?: string
}

// Helper function to extract CSRF token from cookies
const getCsrfFromCookies = (): string | null => {
  // Safety check for server-side rendering (Next.js)
  if (typeof document === "undefined") return null

  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1]

  return cookieValue || null
}

export const apiClient = async <T = any>(
  endpoint: string,
  method = "GET",
  body: any = null,
  customHeaders: Record<string, string> = {},
): Promise<T> => {
  // Only get CSRF token for state-changing methods
  const csrfToken = ["POST", "PUT", "PATCH", "DELETE"].includes(method) ? getCsrfFromCookies() : null

  console.log(`CSRF Token: ${csrfToken}`)

  if (!API_BASE_URL) {
    const error: ApiError = {
      message: "API base URL is not configured",
      isNetworkError: true,
    }
    throw error
  }

  const url = `${API_BASE_URL}${endpoint}`
  console.log(url)

  const requestId = Math.random().toString(36).substring(2, 9)

  // Prepare headers
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",

    ...(csrfToken && { "X-CSRFToken": csrfToken }), // Conditionally add CSRF
    ...customHeaders,
  })

  console.log(`[${requestId}] API Request:`, {
    method,
    url,
    headers: Object.fromEntries(headers.entries()),
    body: body ? JSON.parse(JSON.stringify(body)) : null,
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    console.log(headers)

    const response = await fetch(url, {
      method,
      headers,
      credentials: "include", // Required for cookies
      body: body && method !== "GET" ? JSON.stringify(body) : null,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`[${requestId}] API Response:`, {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    })

    if (response.status === 204) {
      return {} as T
    }

    const responseText = await response.text()
    let responseData: any

    try {
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch (e) {
      console.error(`[${requestId}] Failed to parse JSON:`, responseText)
      const parseError: ApiError = {
        message: "Invalid JSON response from server",
        status: response.status,
        details: responseText,
        responseText,
      }
      throw parseError
    }

    // Handle special case for OTP requirement (successful response with OTP needed)
    if (response.status === 401 && responseData.require_otp) {
      return {
        require_otp: true,
        qr_code_base64: responseData.qr_code_base64,
      } as T
    }

    if (!response.ok) {
      const apiError: ApiError = {
        message:
          responseData.detail ||
          responseData.message ||
          responseData.error ||
          `Request failed with status ${response.status}`,
        status: response.status,
        details: responseData,
      }
      throw apiError
    }

    return responseData as T
  } catch (error: any) {
    const errorData: ApiError = {
      message: error.message || "Unknown error occurred",
      details: error.details || error.responseText || undefined,
      status: error.status,
      isNetworkError: error.name === "AbortError" || error.message?.includes("Failed to fetch") || error.isNetworkError,
    }

    if (error.name === "AbortError") {
      errorData.message = "Request timeout - server took too long to respond"
    }

    console.log(`[${requestId}] API Call Failed:`, {
      url,
      method,
      error: errorData,
    })

    throw errorData
  }
}

export const authApi = {
  login: (
    credentials: {
      email: string
      password: string
      otp?: string
      remember?: boolean
      is_temporary_otp?: boolean
      device_uuid?: string
    },
    deviceUuid: string,
  ) =>
    apiClient("/auth/login/", "POST", credentials, {
      device: deviceUuid,
    }),

  logout: () => apiClient("/auth/logout/", "POST"),

  validateToken: () => apiClient("/auth/validate/"),

  changePassword: (data: {
    email: string
    old_password: string
    new_password: string
  }) => apiClient("/auth/new-password/", "POST", data),

  refreshToken: (refresh: string) => apiClient("/auth/login/refresh/", "POST", { refresh }),

  getUserInfo: () => apiClient("/auth/user/"),
  // MFA Methods
  startMfaSetup: () => apiClient("/users/mfa/", "POST"),

  verifyMfaSetup: (otp: string, deviceUUID?: string) => apiClient("/users/mfa/verify/", "POST", { otp }),

  verifyMfaLogin: (otp: string, tempToken: string) =>
    apiClient("/auth/mfa/verify/", "POST", { otp, temp_token: tempToken }),
}

// Utility function to check if error is a network error
export const isNetworkError = (error: any): boolean => {
  return error?.isNetworkError || error?.message?.includes("Network error") || error?.name === "AbortError"
};