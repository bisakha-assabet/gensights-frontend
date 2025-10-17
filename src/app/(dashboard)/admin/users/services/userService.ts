import { apiClient } from "@/lib/api"
import { getStoredToken, getStoredRefreshToken, setStoredToken } from "@/context/auth/authUtils"
import type { ApiUser, InviteUserRequest, InviteUserResponse } from "../types/api.types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://pratigya.gensights:8000/api/v1"

class UserService {
  private async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const refreshToken = getStoredRefreshToken()
      if (!refreshToken) {
        return false
      }

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

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
  ): Promise<T> {
    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      try {
        const response = await apiClient<T>(endpoint, method, body, {
          Authorization: `Bearer ${token}`,
        })
        return response
      } catch (error: any) {
        if (error.status === 401) {
          const refreshSuccessful = await this.refreshTokenIfNeeded()

          if (refreshSuccessful) {
            const newToken = getStoredToken()
            const response = await apiClient<T>(endpoint, method, body, {
              Authorization: `Bearer ${newToken}`,
            })
            return response
          }
        }
        throw error
      }
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error)
      throw error
    }
  }

  async getUsers(search?: string): Promise<ApiUser[]> {
    try {
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : ""
      const response = await this.makeAuthenticatedRequest<{ 
        data: { 
          meta: { next: string | null; previous: string | null; count: number }; 
          results: ApiUser[] 
        }; 
        message: string; 
        success: boolean 
      }>(`/users/${searchParam}`, "GET")

      if (response && response.data && Array.isArray(response.data.results)) {
        return response.data.results
      } else if (response && typeof response === "object" && "results" in response && Array.isArray(response.results)) {
        return response.results
      } else if (Array.isArray(response)) {
        return response
      } else {
        console.warn("Unexpected response format:", response)
        return []
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  }

  async createUser(userData: Omit<ApiUser, "user_id">): Promise<ApiUser> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiUser | { data: ApiUser }>("/users/", "POST", userData)

      return "data" in response ? response.data : response
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUser(userId: number, userData: Partial<ApiUser>): Promise<ApiUser> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiUser | { data: ApiUser }>(
        `/users/${userId}/`,
        "PUT",
        userData,
      )

      return "data" in response ? response.data : response
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await this.makeAuthenticatedRequest<void>(`/users/${userId}/`, "DELETE")
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  async inviteUser(inviteData: InviteUserRequest): Promise<InviteUserResponse> {
    try {
      const response = await this.makeAuthenticatedRequest<InviteUserResponse | { data: InviteUserResponse }>(
        `/users/invite-user/`,
        "POST",
        inviteData,
      )

      return "data" in response ? response.data : response
    } catch (error) {
      console.error("Error inviting user:", error)
      throw error
    }
  }

  async getCountries(): Promise<{ id: number; name: string }[]> {
    try {
      // First request
      const response = await this.makeAuthenticatedRequest<{ 
        data: { 
          meta: { next: string | null; previous: string | null; count: number }; 
          results: { id: number; name: string }[] 
        }; 
        message: string; 
        success: boolean 
      }>(`/users/countries/`, "GET")

      if (response && response.data && Array.isArray(response.data.results)) {
        const collected: { id: number; name: string }[] = [...response.data.results]
        let next = response.data.meta?.next || null

        while (next) {
          try {
            const nextEndpoint = next.startsWith(API_BASE_URL) ? next.replace(API_BASE_URL, "") : next
            const nextResp = await this.makeAuthenticatedRequest<{ data: { meta: { next: string | null }; results: { id: number; name: string }[] } }>(
              nextEndpoint,
              "GET",
            )

            if (nextResp && nextResp.data && Array.isArray(nextResp.data.results)) {
              collected.push(...nextResp.data.results)
              next = nextResp.data.meta?.next || null
            } else {
              break
            }
          } catch (err) {
            console.warn("Failed to fetch next page of countries:", err)
            break
          }
        }

        return collected
      } else if (Array.isArray(response)) {
        return response
      } else {
        console.warn("Unexpected countries response format:", response)
        return []
      }
    } catch (error) {
      console.error("Error fetching countries:", error)
      throw error
    }
  }

  async getTherapeuticAreas(): Promise<{ id: number; area: string }[]> {
    try {
      const response = await this.makeAuthenticatedRequest<{ 
        data: { 
          meta: { next: string | null; previous: string | null; count: number }; 
          results: { id: number; area: string }[] 
        }; 
        message: string; 
        success: boolean 
      }>(`/users/therapeutic-areas/`, "GET")
      
      if (response && response.data && Array.isArray(response.data.results)) {
        return response.data.results
      } else if (Array.isArray(response)) {
        return response
      } else {
        console.warn("Unexpected therapeutic areas response format:", response)
        return []
      }
    } catch (error) {
      console.error("Error fetching therapeutic areas:", error)
      throw error
    }
  }
}

export const userService = new UserService()
