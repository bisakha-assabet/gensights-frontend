"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth"
import ChangePasswordForm from "@/components/auth/ChangePasswordForm"

export default function ChangePasswordPage() {
  const { changePassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (data: {
    email: string // Added email parameter to handleSubmit
    temporary_password: string
    new_password: string
  }) => {
    try {
      await changePassword(data)
      router.push("/login")
    } catch (err) {
      // Error handling is managed by the form component
      console.error("Password change failed:", err)
    }
  }

  return <ChangePasswordForm onSubmit={handleSubmit} />
}
