"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/auth"

interface ChangePasswordFormProps {
  onSubmit: (data: {
    email: string
    temporary_password: string
    new_password: string
  }) => Promise<void>
}

export default function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    temporary_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    temporary_password: false,
    new_password: false,
    confirm_password: false,
  })
  const { error: authError, clearError } = useAuth()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.temporary_password) {
      newErrors.temporary_password = "Temporary password is required"
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required"
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters"
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true)
      try {
        setFormError(null)
        // Clear any auth-level error before attempting
        if (authError) clearError()
        await onSubmit({
          email: formData.email,
          temporary_password: formData.temporary_password,
          new_password: formData.new_password,
        })
      } catch (err: any) {
        // Prefer structured message from API client, fall back to generic
        const message = err?.message || err?.detail || "Failed to change password"
        setFormError(message)

        // If the error clearly refers to temporary/old password, attach to that field
        const lower = String(message).toLowerCase()
        if (lower.includes("temporary") || lower.includes("old_password") || lower.includes("old password") || lower.includes("temporary password")) {
          setErrors((prev) => ({ ...prev, temporary_password: message }))
        }
        throw err
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    // Clear form-level and auth-level errors when user edits fields
    if (formError) setFormError(null)
    if (authError) clearError()
  }

  useEffect(() => {
    if (authError) {
      setFormError(authError)
      // If auth error references temporary password, attach to field
      const lower = String(authError).toLowerCase()
      if (lower.includes("temporary") || lower.includes("old_password") || lower.includes("temporary password")) {
        setErrors((prev) => ({ ...prev, temporary_password: authError }))
      }
    }
  }, [authError])

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="GENSIGHTS" width={120} height={120} className="mr-2" />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white py-12 px-8 shadow-lg rounded-lg border border-gray-200">
          <div className="space-y-6">
            {formError && (
              <div className="rounded-md bg-red-50 p-3 border border-red-100">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}
            {/* Email */}
            <div>
              <input
                type="email"
                className={`block w-full px-4 py-4 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400 text-sm`}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email Address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Temporary Password */}
            <div>
              <div className="relative">
                <input
                  type={showPasswords.temporary_password ? "text" : "password"}
                  className={`block w-full px-4 py-4 border ${
                    errors.temporary_password ? "border-red-500" : "border-gray-300"
                  } rounded-md placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400 text-sm`}
                  value={formData.temporary_password}
                  onChange={(e) => handleChange("temporary_password", e.target.value)}
                  placeholder="Temporary Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => togglePasswordVisibility("temporary_password")}
                >
                  {showPasswords.temporary_password ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.temporary_password && <p className="mt-1 text-sm text-red-600">{errors.temporary_password}</p>}
            </div>

            {/* New Password */}
            <div>
              <div className="relative">
                <input
                  type={showPasswords.new_password ? "text" : "password"}
                  className={`block w-full px-4 py-4 border ${
                    errors.new_password ? "border-red-500" : "border-gray-300"
                  } rounded-md placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400 text-sm`}
                  value={formData.new_password}
                  onChange={(e) => handleChange("new_password", e.target.value)}
                  placeholder="New Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => togglePasswordVisibility("new_password")}
                >
                  {showPasswords.new_password ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.new_password && <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showPasswords.confirm_password ? "text" : "password"}
                  className={`block w-full px-4 py-4 border ${
                    errors.confirm_password ? "border-red-500" : "border-gray-300"
                  } rounded-md placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-400 text-sm`}
                  value={formData.confirm_password}
                  onChange={(e) => handleChange("confirm_password", e.target.value)}
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => togglePasswordVisibility("confirm_password")}
                >
                  {showPasswords.confirm_password ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
