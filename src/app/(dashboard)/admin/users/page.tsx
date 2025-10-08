"use client"

import { useState, useEffect, useCallback } from "react"
import UserTable from "./components/UserTable"
import AddUserModal from "./components/AddUser"
import EditUserModal from "./components/EditUser" // Import the new component
import FilterSidebar from "./components/FilterSidebar"
import { userService } from "./services/userService"
import type { ApiUser, InviteUserRequest } from "./types/api.types"

export interface User {
  id: number
  name: string
  employeeCode: string
  accessibleCountries: number[] | string
  therapeuticArea: number[] | string
  status: "Invited" | "Active" | "Inactive"
  role: string
  email: string
}

function transformApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.user_id,
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    employeeCode: apiUser.employee_code || "N/A",
    accessibleCountries: apiUser.accessible_countries || "N/A",
    therapeuticArea: apiUser.therapeutic_areas || "N/A",
    status: apiUser.status || "Invited",
    role: apiUser.role || "N/A",
    email: apiUser.email,
  }
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false) 
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null) 
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  const fetchUsers = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      setError(null)
      const apiUsers = await userService.getUsers(search)
      const transformedUsers = apiUsers.map(transformApiUserToUser)
      setUsers(transformedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      console.error("Error fetching users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        setCurrentPage(1)
        fetchUsers(searchTerm || undefined)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchUsers])

  const filteredUsers = users
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage)

  const handleInviteUser = async (inviteData: InviteUserRequest) => {
    try {
      const orgId = 1
      await userService.inviteUser(orgId, inviteData)
      setIsAddUserModalOpen(false)
      fetchUsers(searchTerm || undefined)
    } catch (error) {
      console.error("Error inviting user:", error)
      alert("Failed to invite user. Please try again.")
    }
  }

  const handleEditUser = (user: User) => {
    // Convert User back to ApiUser format for the modal
    const apiUser: ApiUser = {
      user_id: user.id,
      first_name: user.name.split(" ")[0] || "",
      last_name: user.name.split(" ").slice(1).join(" ") || "",
      email: user.email,
      role: user.role,
      therapeutic_areas: Array.isArray(user.therapeuticArea) ? user.therapeuticArea : [],
      accessible_countries: Array.isArray(user.accessibleCountries) ? user.accessibleCountries : [],
      employee_code: user.employeeCode,
      status: user.status,
    }
    setSelectedUser(apiUser)
    setIsEditUserModalOpen(true)
  }

  const handleUpdateUser = async (userId: number, userData: Partial<ApiUser>) => {
    try {
      await userService.updateUser(userId, userData)
      setIsEditUserModalOpen(false)
      setSelectedUser(null)
      fetchUsers(searchTerm || undefined)
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user. Please try again.")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await userService.deleteUser(userId)
      fetchUsers(searchTerm || undefined)
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user. Please try again.")
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isFilterSidebarOpen ? "mr-80" : ""}`}
      >
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">USER</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsFilterSidebarOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                    />
                  </svg>
                  Filter
                </button>
                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => fetchUsers(searchTerm || undefined)}
                        className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <UserTable
              users={paginatedUsers}
              onDeleteUser={handleDeleteUser}
              onEditUser={handleEditUser} 
              currentPage={currentPage}
              totalPages={totalPages}
              entriesPerPage={entriesPerPage}
              totalEntries={filteredUsers.length}
              onPageChange={setCurrentPage}
              onEntriesPerPageChange={setEntriesPerPage}
              loading={loading}
            />
          )}
        </div>
      </div>
      {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onInviteUser={handleInviteUser}
        />
      )}
      {isEditUserModalOpen && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false)
            setSelectedUser(null)
          }}
          onUpdateUser={handleUpdateUser}
          user={selectedUser}
        />
      )}
      {isFilterSidebarOpen && (
        <FilterSidebar isOpen={isFilterSidebarOpen} onClose={() => setIsFilterSidebarOpen(false)} />
      )}
    </div>
  )
}