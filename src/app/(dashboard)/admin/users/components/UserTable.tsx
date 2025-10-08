"use client"

import type { User } from "../page"

interface UserTableProps {
  users: User[]
  onDeleteUser: (userId: number) => void
  onEditUser: (user: User) => void
  currentPage: number
  totalPages: number
  entriesPerPage: number
  totalEntries: number
  onPageChange: (page: number) => void
  onEntriesPerPageChange: (entries: number) => void
  loading?: boolean
}

export default function UserTable({
  users,
  onDeleteUser,
  onEditUser,
  currentPage,
  totalPages,
  entriesPerPage,
  totalEntries,
  onPageChange,
  onEntriesPerPageChange,
  loading = false,
}: UserTableProps) {
  const getStatusBadgeClass = (status: User["status"]) => {
    switch (status) {
      case "Invited":
        return "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
      case "Active":
        return "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white"
      case "Inactive":
        return "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white"
      default:
        return "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
    }
  }

  const handleEdit = (user: User) => {
    onEditUser(user)
  }

  const handleDelete = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      onDeleteUser(userId)
    }
  }

  const generatePageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg">
          <thead className="bg-blue-400">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Accessible Countries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Therapeutic Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: entriesPerPage }).map((_, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-8"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-40"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-6 bg-gray-200 rounded-full w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-28"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 4 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  
                  {/* Accessible Countries */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(user.accessibleCountries) ? (
                      <ul className="list-disc list-inside space-y-1 max-h-24 scrollbar-none overflow-y-auto">
                        {user.accessibleCountries.map((country, i) => (
                          <li key={i}>{country}</li>
                        ))}
                      </ul>
                    ) : (
                      user.accessibleCountries
                    )}
                  </td>

                  {/* Therapeutic Area */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Array.isArray(user.therapeuticArea) ? (
                      <ul className="list-disc list-inside space-y-1 max-h-24 scrollbar-none overflow-y-auto">
                        {user.therapeuticArea.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    ) : (
                      user.therapeuticArea
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClass(user.status)}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * entriesPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * entriesPerPage, totalEntries)}</span> of{" "}
              <span className="font-medium">{totalEntries}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm">
              {generatePageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    pageNumber === currentPage ? "bg-blue-500 text-white" : "bg-white text-gray-500"
                  } border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={() => {
                    if (typeof pageNumber === "number") {
                      onPageChange(pageNumber)
                    }
                  }}
                  disabled={pageNumber === "..."}
                >
                  {pageNumber}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
