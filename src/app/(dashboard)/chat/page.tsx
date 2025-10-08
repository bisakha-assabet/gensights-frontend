"use client"
import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import type React from "react"

import SendMessage from "./components/SendMessage"
import MessageBubble from "./components/MessageBubble"
import EmptyState from "./components/EmptyState"
import type { ChatMessage } from "./components/types"
import { getRandomUUID } from "./lib/utils"
import { useChatMessages } from "./hooks/use-chat-messages"
import { useConversationDetails } from "./hooks/useConversationDetails"

interface BackendMessage {
  role: "user" | "assistant"
  content: string | Array<string | object>
  message_id: string
}

interface BackendExchange {
  messages: BackendMessage[]
  exchange_index: number
}

interface BackendConversation {
  exchanges: BackendExchange[]
  title?: string
  created_at: string
  conversation_id: string
}

interface ExchangeResponses {
  [exchangeIndex: number]: {
    responses: ChatMessage[]
    currentIndex: number
  }
}

interface ConversationMetadata {
  conversation_id: string
  message_id: string
  exchange_id: string
  exchange_index: number
  user_message_id: string
  active_response_id: string
  can_like: boolean
  can_regenerate: boolean
  is_active: boolean
}

const ChatWithDataIndexPage: React.FC = () => {
  const params = useParams()
  const conversationId = params?.conversationId as string | undefined

  const idRef = useRef<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [userHasSentMessage, setUserHasSentMessage] = useState(false)
  const [isLoadingExistingConversation, setIsLoadingExistingConversation] = useState(false)
  const [exchangeResponses, setExchangeResponses] = useState<ExchangeResponses>({})
  const [conversationMetadata, setConversationMetadata] = useState<ConversationMetadata | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch existing conversation details if conversationId is provided
  const {
    conversation,
    loading: conversationLoading,
    error: conversationError,
  } = useConversationDetails(conversationId || null)

  useEffect(() => {
    if (!idRef.current) {
      // Use existing conversation ID or generate new UUID
      idRef.current = conversationId || getRandomUUID()
    }
  }, [conversationId])

  // Convert backend conversation data to ChatMessage format
  const convertToChatMessages = (conversation: any): ChatMessage[] => {
    const chatMessages: ChatMessage[] = []

    console.log("Converting conversation:", conversation)

    if (conversation.exchanges && Array.isArray(conversation.exchanges)) {
      conversation.exchanges.forEach((exchange: any, exchangeIndex: number) => {
        console.log(`Processing exchange ${exchangeIndex}:`, exchange)

        if (exchange.messages && Array.isArray(exchange.messages)) {
          exchange.messages.forEach((message: any, messageIndex: number) => {
            console.log(`Processing message ${messageIndex} in exchange ${exchangeIndex}:`, message)

            // Convert content array to string if needed
            let content = ""
            if (Array.isArray(message.content)) {
              content = message.content
                .map((c: any) => {
                  if (typeof c === "string") {
                    return c
                  } else if (typeof c === "object") {
                    if (c.type === "text" && c.text) {
                      return c.text
                    }
                    return JSON.stringify(c)
                  }
                  return String(c)
                })
                .join(" ")
            } else if (typeof message.content === "string") {
              content = message.content
            } else {
              content = JSON.stringify(message.content)
            }

            const chatMessage: ChatMessage = {
              type: message.role === "user" ? "USER" : "ASSISTANT",
              data: {
                type: "TEXT",
                content: content,
              },
              ui_properties: {
                disable_submit: false,
                disable_close: false,
                disable_text: false,
              },
              show_chat: true,
              process_completed: true,
              message_id: message.message_id,
              conversation_id: conversation.conversation_id || conversationId,
              exchange_index: exchange.exchange_index || exchangeIndex,
            }
            chatMessages.push(chatMessage)
          })
        }
      })
    }

    console.log("Converted messages:", chatMessages)
    return chatMessages
  }

  // Load existing conversation messages
  useEffect(() => {
    if (conversation && !conversationLoading) {
      console.log("Loading existing conversation:", conversation)
      setIsLoadingExistingConversation(true)
      try {
        const existingMessages = convertToChatMessages(conversation)
        console.log("Setting messages:", existingMessages)
        setMessages(existingMessages)
        setUserHasSentMessage(existingMessages.length > 0)
      } catch (error) {
        console.error("Error converting conversation messages:", error)
      } finally {
        setIsLoadingExistingConversation(false)
      }
    }
  }, [conversation, conversationLoading])

  // Reset messages when navigating to a new chat (no conversationId)
  useEffect(() => {
    if (!conversationId) {
      console.log("No conversation ID, resetting messages")
      setMessages([])
      setUserHasSentMessage(false)
      setIsProcessing(false)
    }
  }, [conversationId])

  // Function to send message via REST API
  const sendMessageViaAPI = async (userMessage: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      setIsProcessing(true)

      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      // Determine if we should include conversation_id
      // Only include it if we have a real conversation ID from previous response
      const currentConversationId = conversationMetadata?.conversation_id || conversationId
      const realExchangeIndex =
        conversationMetadata?.exchange_index !== undefined
          ? conversationMetadata.exchange_index + 1
          : Math.floor(messages.length / 2)

      // Add user message immediately
      const userChatMessage: ChatMessage = {
        type: "USER",
        data: {
          type: "TEXT",
          content: userMessage,
        },
        ui_properties: {
          disable_submit: false,
          disable_close: false,
          disable_text: false,
        },
        show_chat: true,
        process_completed: true,
        conversation_id: currentConversationId,
        exchange_index: realExchangeIndex,
      }

      setMessages((prev) => [...prev, userChatMessage])
      setUserHasSentMessage(true)

      // Build URL with conversation_id only if we have one from a previous response
      const url = new URL(`${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/chat`)
      if (currentConversationId) {
        url.searchParams.append("conversation_id", currentConversationId)
      }

      console.log("Sending chat request to:", url.toString())
      console.log("Request body:", {
        user_entry: {
          text: userMessage,
        },
      })

      // Make API request
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_entry: {
            text: userMessage,
          },
        }),
        signal: abortControllerRef.current.signal,
      })

      console.log("API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Chat API error:", errorText)
        throw new Error(`API request failed: ${response.status}`)
      }

      // Parse the complete JSON response
      const apiData = await response.json()
      console.log("API Response data:", apiData)

      // Extract conversation metadata from response
      if (apiData.data?.conversation_metadata) {
        const metadata = apiData.data.conversation_metadata
        console.log("Setting conversation metadata:", metadata)
        setConversationMetadata(metadata)

        // Update idRef with the real conversation ID
        if (metadata.conversation_id) {
          idRef.current = metadata.conversation_id
        }

        // Update all messages with the real conversation ID
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => ({
            ...msg,
            conversation_id: metadata.conversation_id,
            exchange_index: msg.type === "USER" && msg === prevMessages[prevMessages.length - 1]
              ? metadata.exchange_index
              : msg.exchange_index,
          }))
        })
      }

      // Extract response content
      if (apiData.data?.response?.content) {
        let textContent = ""
        let citations = null
        let figureContent = null

        // Process all content items
        apiData.data.response.content.forEach((item: any) => {
          if (item.type === "TEXT") {
            textContent = item.content
          } else if (item.type === "REFERENCES") {
            citations = item.content
          } else if (item.type === "FIGURE") {
            figureContent = item.content
          }
        })

        // Create assistant message with text content
        if (textContent) {
          const assistantMessage: ChatMessage = {
            type: "ASSISTANT",
            data: {
              type: "TEXT",
              content: textContent.trim(),
              citations: citations || undefined,
            },
            ui_properties: {
              disable_submit: false,
              disable_close: false,
              disable_text: false,
            },
            show_chat: true,
            process_completed: true,
            message_id: apiData.data.conversation_metadata?.message_id || getRandomUUID(),
            conversation_id: apiData.data.conversation_metadata?.conversation_id || currentConversationId,
            exchange_index: apiData.data.conversation_metadata?.exchange_index ?? realExchangeIndex,
          }

          setMessages((prev) => [...prev, assistantMessage])
        }

        // Add figure content as separate message if present
        if (figureContent) {
          const figureMessage: ChatMessage = {
            type: "ASSISTANT",
            data: {
              type: "FIGURE",
              content: figureContent,
            },
            ui_properties: {
              disable_submit: false,
              disable_close: false,
              disable_text: false,
            },
            show_chat: true,
            process_completed: true,
            message_id: getRandomUUID(),
            conversation_id: apiData.data.conversation_metadata?.conversation_id || currentConversationId,
            exchange_index: apiData.data.conversation_metadata?.exchange_index ?? realExchangeIndex,
          }

          setMessages((prev) => [...prev, figureMessage])
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request was aborted")
      } else {
        console.error("Error sending message:", error)
      }
    } finally {
      setIsProcessing(false)
      abortControllerRef.current = null
    }
  }

  // Function to add user message to chat
  const addUserMessage = (content: string) => {
    sendMessageViaAPI(content)
  }

  const handleRegenerateResponse = async (conversationId: string, exchangeIndex: number) => {
    console.log("🔄 Handling regenerate response for exchange:", exchangeIndex)
    setIsProcessing(true)

    const realConversationId = conversationMetadata?.conversation_id || conversationId
    const realMessageId = conversationMetadata?.message_id || getRandomUUID()

    // Add a temporary status message to show processing
    const statusMessage: ChatMessage = {
      type: "ASSISTANT",
      data: { type: "STATUS", content: "Processing..." },
      ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
      show_chat: true,
      process_completed: false,
      message_id: realMessageId,
      conversation_id: realConversationId,
      exchange_index: exchangeIndex,
    }

    setMessages((prev) => {
      const filtered = prev.filter((m) => !(m.exchange_index === exchangeIndex && m.type === "ASSISTANT"))
      return [...filtered, statusMessage]
    })

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${realConversationId}/exchanges/${exchangeIndex}/regenerate-with-ai`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Regenerate API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Regenerate API error:", errorText)
        setIsProcessing(false)
        return
      }

      const apiData = await response.json()
      console.log("Regenerate API response:", apiData)

      if (apiData.success && apiData.data?.response?.content) {
        let textContent = ""
        let citations = null

        apiData.data.response.content.forEach((item: any) => {
          if (item.type === "TEXT") {
            textContent = item.content
          } else if (item.type === "REFERENCES") {
            citations = item.content.citations
          }
        })

        const regeneratedMessage: ChatMessage = {
          type: "ASSISTANT",
          data: {
            type: "TEXT",
            content: textContent.trim(),
            citations: citations || [],
          },
          ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
          show_chat: true,
          process_completed: true,
          message_id: apiData.data.response_id,
          conversation_id: realConversationId,
          exchange_index: exchangeIndex,
        }

        setExchangeResponses((prev) => {
          const currentExchange = prev[exchangeIndex] || { responses: [], currentIndex: 0 }

          const existingResponse = messages.find(
            (m) => m.exchange_index === exchangeIndex && m.type === "ASSISTANT" && m.data.type !== "STATUS",
          )

          let updatedResponses = [...currentExchange.responses]

          if (existingResponse && !updatedResponses.find((r) => r.message_id === existingResponse.message_id)) {
            updatedResponses = [existingResponse, ...updatedResponses]
          }

          updatedResponses.push(regeneratedMessage)

          return {
            ...prev,
            [exchangeIndex]: {
              responses: updatedResponses,
              currentIndex: updatedResponses.length - 1,
            },
          }
        })

        setMessages((prev) => {
          const filtered = prev.filter((m) => !(m.exchange_index === exchangeIndex && m.type === "ASSISTANT"))
          return [...filtered, regeneratedMessage]
        })

        console.log("✅ Regenerated response processed and displayed")
      }
    } catch (error) {
      console.error("Error in regenerate process:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const setActiveResponse = async (conversationId: string, exchange_index: number, responseId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const conversation_id = conversationMetadata?.conversation_id || conversationId

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${conversation_id}/exchanges/${exchange_index}/active-response`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ response_id: responseId }),
        },
      )

      if (!response.ok) {
        console.error("Failed to set active response:", response.status)
      }
    } catch (error) {
      console.error("Error setting active response:", error)
    }
  }

  const handlePreviousResponse = async (exchangeIndex: number) => {
    setExchangeResponses((prev) => {
      const currentExchange = prev[exchangeIndex]
      if (!currentExchange || currentExchange.currentIndex <= 0) return prev

      const newIndex = currentExchange.currentIndex - 1
      const selectedResponse = currentExchange.responses[newIndex]

      const currentConversationId = conversationMetadata?.conversation_id || conversationId || idRef.current
      if (currentConversationId && selectedResponse.message_id) {
        setActiveResponse(currentConversationId, exchangeIndex, selectedResponse.message_id)
      }

      setMessages((prevMessages) => {
        const filtered = prevMessages.filter((m) => !(m.exchange_index === exchangeIndex && m.type === "ASSISTANT"))
        return [...filtered, selectedResponse]
      })

      return {
        ...prev,
        [exchangeIndex]: {
          ...currentExchange,
          currentIndex: newIndex,
        },
      }
    })
  }

  const handleNextResponse = async (exchangeIndex: number) => {
    setExchangeResponses((prev) => {
      const currentExchange = prev[exchangeIndex]
      if (!currentExchange || currentExchange.currentIndex >= currentExchange.responses.length - 1) return prev

      const newIndex = currentExchange.currentIndex + 1
      const selectedResponse = currentExchange.responses[newIndex]

      const currentConversationId = conversationMetadata?.conversation_id || conversationId || idRef.current
      if (currentConversationId && selectedResponse.message_id) {
        setActiveResponse(currentConversationId, exchangeIndex, selectedResponse.message_id)
      }

      setMessages((prevMessages) => {
        const filtered = prevMessages.filter((m) => !(m.exchange_index === exchangeIndex && m.type === "ASSISTANT"))
        return [...filtered, selectedResponse]
      })

      return {
        ...prev,
        [exchangeIndex]: {
          ...currentExchange,
          currentIndex: newIndex,
        },
      }
    })
  }

  // Use the custom hook for combining messages
  const combinedMessages = useChatMessages(messages)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  if (conversationId && (conversationLoading || isLoadingExistingConversation)) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (conversationId && conversationError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load conversation</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{conversationError}</p>
          <button
            onClick={() => (window.location.href = "/chat")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start New Chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      {conversation && (
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {conversation.title || "Untitled Conversation"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created {new Date(conversation.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        {!userHasSentMessage ? (
          <div className="h-full">
            <EmptyState />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-2 py-3">
            <div className="space-y-6">
              {combinedMessages.map((message, index) => (
                <MessageBubble
                  key={`${index}-${message.type}-${message.data.type}`}
                  message={message}
                  isProcessing={false}
                  onRegenerateResponse={handleRegenerateResponse}
                  exchangeResponses={exchangeResponses}
                  onPreviousResponse={handlePreviousResponse}
                  onNextResponse={handleNextResponse}
                />
              ))}
              {isProcessing && (
                <MessageBubble
                  message={{
                    type: "ASSISTANT",
                    data: { type: "TEXT", content: "Processing..." },
                    ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
                    show_chat: true,
                    process_completed: false,
                  }}
                  isProcessing={true}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-10 py-6">
          <SendMessage
            onSendMessage={addUserMessage}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatWithDataIndexPage