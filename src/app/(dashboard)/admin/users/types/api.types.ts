export interface ApiUser {
  user_id: number
  first_name: string
  last_name: string
  email: string
  employee_code?: string
  accessible_countries?: number[]
  therapeutic_areas?: number[]
  status?: "Invited" | "Active" | "Inactive"
  role?: string
}

export interface InviteUserRequest {
  email: string
  full_name: string
  accessible_countries?: number[]
  therapeutic_areas?: number[]
  role: string
}

export interface InviteUserResponse {
  email: string
  full_name: string
  accessible_countries: number[]
  therapeutic_areas: number[] | string
  role: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}


