"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { userService } from "../services/userService"
import type { ApiUser } from "../types/api.types"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateUser: (userId: number, userData: Partial<ApiUser>) => void
  user: ApiUser | null
}

interface Country {
  id: number
  name: string
}

interface TherapeuticArea {
  id: number
  area: string
}

export default function EditUserModal({ isOpen, onClose, onUpdateUser, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    therapeuticAreas: [] as number[],
    accessibleCountries: [] as number[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countries, setCountries] = useState<Country[]>([])
  const [therapeuticAreas, setTherapeuticAreas] = useState<TherapeuticArea[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingTherapeuticAreas, setLoadingTherapeuticAreas] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const roles = ["Country Head", "Global Head", "Therapeutic Specialist", "Global Admin"]

  useEffect(() => {
    if (isOpen && user) {
      // Pre-populate form with user data
      setFormData({
        email: user.email || "",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        role: user.role || "",
        therapeuticAreas: user.therapeutic_areas || [],
        accessibleCountries: user.accessible_countries || [],
      })
      fetchCountries()
      fetchTherapeuticAreas()
    }
  }, [isOpen, user])

  // Effect to handle role-based automatic selections
  useEffect(() => {
    const { role } = formData
    if (role === "Global Head" || role === "Global Admin") {
      setFormData((prev) => ({
        ...prev,
        accessibleCountries: countries.map((c) => c.id),
        therapeuticAreas: therapeuticAreas.map((ta) => ta.id),
      }))
    } else if (role === "Country Head") {
      setFormData((prev) => ({
        ...prev,
        therapeuticAreas: therapeuticAreas.map((ta) => ta.id),
      }))
    } else if (role === "Therapeutic Specialist") {
      setFormData((prev) => ({
        ...prev,
        accessibleCountries: countries.map((c) => c.id),
      }))
    } else if (role === "") {
      setFormData((prev) => ({
        ...prev,
        accessibleCountries: [],
        therapeuticAreas: [],
      }))
    }
  }, [formData.role, countries, therapeuticAreas])

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true)
      const countriesData = await userService.getCountries()
      setCountries(countriesData)
    } catch (error) {
      console.error("Error fetching countries:", error)
      setCountries([
        { id: 1, name: "Denmark" },
        { id: 2, name: "America" },
        { id: 3, name: "Germany" },
        { id: 4, name: "France" },
        { id: 5, name: "United Kingdom" },
        { id: 6, name: "Canada" },
        { id: 7, name: "Australia" },
        { id: 8, name: "Japan" },
      ])
    } finally {
      setLoadingCountries(false)
    }
  }

  const fetchTherapeuticAreas = async () => {
    try {
      setLoadingTherapeuticAreas(true)
      const therapeuticAreasData = await userService.getTherapeuticAreas()
      setTherapeuticAreas(therapeuticAreasData)
    } catch (error) {
      console.error("Error fetching therapeutic areas:", error)
      setTherapeuticAreas([
        { id: 1, area: "Respiratory" },
        { id: 2, area: "Heart" },
        { id: 3, area: "Dental" },
        { id: 4, area: "Cardiology" },
        { id: 5, area: "Oncology" },
        { id: 6, area: "Neurology" },
      ])
    } finally {
      setLoadingTherapeuticAreas(false)
    }
  }

  const handleInputChange = (field: string, value: string | number[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.role) {
      newErrors.role = "Role is required"
    }
    if (formData.therapeuticAreas.length === 0) {
      newErrors.therapeuticAreas = "At least one therapeutic area is required"
    }
    if (formData.accessibleCountries.length === 0) {
      newErrors.accessibleCountries = "At least one country is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !user) return

    const userData: Partial<ApiUser> = {
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role,
      therapeutic_areas: formData.therapeuticAreas,
      accessible_countries: formData.accessibleCountries,
    }

    onUpdateUser(user.user_id, userData)
    setSuccessMessage("User updated successfully!")
    setTimeout(() => {
      setSuccessMessage("")
      handleReset()
      onClose()
    }, 2000)
  }

  const handleReset = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "",
      therapeuticAreas: [],
      accessibleCountries: [],
    })
    setErrors({})
  }

  const handleCountryChange = (countryId: number, isChecked: boolean) => {
    const updatedCountries = isChecked
      ? [...formData.accessibleCountries, countryId]
      : formData.accessibleCountries.filter((id) => id !== countryId)
    handleInputChange("accessibleCountries", updatedCountries)
  }

  const handleTherapeuticAreaChange = (therapeuticAreaId: number, isChecked: boolean) => {
    const updatedAreas = isChecked
      ? [...formData.therapeuticAreas, therapeuticAreaId]
      : formData.therapeuticAreas.filter((id) => id !== therapeuticAreaId)
    handleInputChange("therapeuticAreas", updatedAreas)
  }

  const handleCancel = () => {
    handleReset()
    onClose()
  }

  const isCountrySelectionDisabled = () => {
    return formData.role === "Global Head" || formData.role === "Global Admin" || formData.role === "Therapeutic Specialist"
  }

  const isTherapeuticAreaSelectionDisabled = () => {
    return formData.role === "Global Head" || formData.role === "Global Admin" || formData.role === "Country Head"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">EDIT USER</h2>
          {successMessage && (
            <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm font-medium">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                      errors.role ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Choose Role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Therapeutic Areas
                  {isTherapeuticAreaSelectionDisabled() && (
                    <span className="text-sm text-gray-500 ml-2">(Auto-selected based on role)</span>
                  )}
                </label>
                <div
                  className={`border rounded-md p-3 max-h-40 overflow-y-auto ${
                    errors.therapeuticAreas ? "border-red-500" : "border-gray-300"
                  } ${isTherapeuticAreaSelectionDisabled() ? "bg-gray-50" : ""}`}
                >
                  {loadingTherapeuticAreas ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading therapeutic areas...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {therapeuticAreas.map((area) => (
                        <label key={area.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.therapeuticAreas.includes(area.id)}
                            onChange={(e) => handleTherapeuticAreaChange(area.id, e.target.checked)}
                            disabled={isTherapeuticAreaSelectionDisabled()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className={`text-sm ${isTherapeuticAreaSelectionDisabled() ? "text-gray-500" : "text-gray-700"}`}>
                            {area.area}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.therapeuticAreas.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected:{" "}
                    {formData.therapeuticAreas
                      .map((id) => therapeuticAreas.find((ta) => ta.id === id)?.area)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {errors.therapeuticAreas && (
                  <p className="mt-1 text-sm text-red-600">{errors.therapeuticAreas}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accessible Countries
                  {isCountrySelectionDisabled() && (
                    <span className="text-sm text-gray-500 ml-2">(Auto-selected based on role)</span>
                  )}
                </label>
                <div
                  className={`border rounded-md p-3 max-h-40 overflow-y-auto ${
                    errors.accessibleCountries ? "border-red-500" : "border-gray-300"
                  } ${isCountrySelectionDisabled() ? "bg-gray-50" : ""}`}
                >
                  {loadingCountries ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading countries...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {countries.map((country) => (
                        <label key={country.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.accessibleCountries.includes(country.id)}
                            onChange={(e) => handleCountryChange(country.id, e.target.checked)}
                            disabled={isCountrySelectionDisabled()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className={`text-sm ${isCountrySelectionDisabled() ? "text-gray-500" : "text-gray-700"}`}>
                            {country.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.accessibleCountries.length > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected:{" "}
                    {formData.accessibleCountries
                      .map((id) => countries.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {errors.accessibleCountries && (
                  <p className="mt-1 text-sm text-red-600">{errors.accessibleCountries}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
};