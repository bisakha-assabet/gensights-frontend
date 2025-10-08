"use client"

import { useState, useEffect } from "react"

export interface Conversation {
  conversation_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface UseConversationsResult {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useConversations = (limit = 20, offset = 0, order_by = "-updated_at"): UseConversationsResult => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No authentication token found")
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        order_by: order_by,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: Conversation[] = await response.json()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching conversations:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [limit, offset, order_by])

  const refetch = () => {
    fetchConversations()
  }

  return {
    conversations,
    loading,
    error,
    refetch,
  }
}
