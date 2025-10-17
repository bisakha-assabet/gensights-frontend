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
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null)
  const [streamingKey, setStreamingKey] = useState(0) // Force re-render key
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch existing conversation details if conversationId is provided
  const {
    conversation,
    loading: conversationLoading,
    error: conversationError,
  } = useConversationDetails(conversationId || null)

  useEffect(() => {
    if (!idRef.current) {
      idRef.current = conversationId || getRandomUUID()
    }
  }, [conversationId])

  // Convert backend conversation data to ChatMessage format
  const convertToChatMessages = (conversation: any): ChatMessage[] => {
    const chatMessages: ChatMessage[] = []

    if (conversation.exchanges && Array.isArray(conversation.exchanges)) {
      conversation.exchanges.forEach((exchange: any, exchangeIndex: number) => {
        if (exchange.messages && Array.isArray(exchange.messages)) {
          exchange.messages.forEach((message: any) => {
            let content = ""
            if (Array.isArray(message.content)) {
              content = message.content
                .map((c: any) => {
                  if (typeof c === "string") return c
                  if (typeof c === "object") {
                    if (c.type === "text" && c.text) return c.text
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

    return chatMessages
  }

  // Load existing conversation messages
  useEffect(() => {
    if (conversation && !conversationLoading) {
      setIsLoadingExistingConversation(true)
      try {
        const existingMessages = convertToChatMessages(conversation)
        setMessages(existingMessages)
        setUserHasSentMessage(existingMessages.length > 0)
      } catch (error) {
        console.error("Error converting conversation messages:", error)
      } finally {
        setIsLoadingExistingConversation(false)
      }
    }
  }, [conversation, conversationLoading])

  // Reset messages when navigating to a new chat
  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setUserHasSentMessage(false)
      setIsProcessing(false)
      setStreamingMessage(null)
    }
  }, [conversationId])

  // Function to send message via SSE Streaming API
  const sendMessageViaStreamAPI = async (userMessage: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      setIsProcessing(true)
      setStreamingMessage(null)
      setStreamingKey(0)

      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

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

      // Build URL with conversation_id if available
      const url = new URL(`${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/chat/stream`)
      if (currentConversationId) {
        url.searchParams.append("conversation_id", currentConversationId)
      }

      console.log("Sending streaming chat request to:", url.toString())

      // Make SSE request
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          user_entry: {
            text: userMessage,
          },
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Streaming API error:", errorText)
        throw new Error(`API request failed: ${response.status}`)
      }

      // Process SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let accumulatedText = ""
      let tempMetadata: ConversationMetadata | null = null
      let citations: any = null
      let figureContent: any = null

      if (!reader) {
        throw new Error("No response body reader available")
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue

          if (line.startsWith("event:")) {
            continue
          }

          if (line.startsWith("data:")) {
            const data = line.substring(5).trim()
            
            try {
              const parsed = JSON.parse(data)

              // Handle metadata event
              if (parsed.type === "conversation_start") {
                tempMetadata = {
                  conversation_id: parsed.conversation_id,
                  message_id: parsed.user_message_id,
                  exchange_id: "",
                  exchange_index: realExchangeIndex,
                  user_message_id: parsed.user_message_id,
                  active_response_id: "",
                  can_like: true,
                  can_regenerate: true,
                  is_active: true,
                }
                
                // Update idRef with real conversation ID
                if (parsed.conversation_id) {
                  idRef.current = parsed.conversation_id
                }
              }

              // Handle text token streaming - UPDATE IN REAL-TIME
              if (parsed.type === "TEXT" && parsed.delta) {
                accumulatedText += parsed.delta
                console.log("Token received:", parsed.delta, "Accumulated:", accumulatedText.substring(0, 50))
                
                // Create/update streaming message with accumulated content
                const streamingMsg: ChatMessage = {
                  type: "ASSISTANT",
                  data: {
                    type: "TEXT",
                    content: accumulatedText,
                  },
                  ui_properties: {
                    disable_submit: false,
                    disable_close: false,
                    disable_text: false,
                  },
                  show_chat: true,
                  process_completed: false,
                  message_id: tempMetadata?.message_id || getRandomUUID(),
                  conversation_id: tempMetadata?.conversation_id || currentConversationId,
                  exchange_index: tempMetadata?.exchange_index ?? realExchangeIndex,
                }
                
                // Force immediate re-render by updating both state and key
                setStreamingMessage({ ...streamingMsg })
                setStreamingKey(prev => prev + 1)
              }

              // Handle FIGURE data (comes complete, not streamed)
              if (parsed.type === "FIGURE" && parsed.content) {
                figureContent = parsed.content
                console.log("Figure received:", figureContent)
              }

              // Handle references/citations
              if (parsed.type === "REFERENCES" && parsed.content) {
                citations = parsed.content
              }

              // Handle completion
              if (parsed.type === "COMPLETE") {
                if (parsed.conversation_metadata) {
                  const metadata = parsed.conversation_metadata
                  setConversationMetadata(metadata)
                  tempMetadata = metadata

                  // Update all messages with real conversation ID
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) => ({
                      ...msg,
                      conversation_id: metadata.conversation_id,
                      exchange_index:
                        msg.type === "USER" && msg === prevMessages[prevMessages.length - 1]
                          ? metadata.exchange_index
                          : msg.exchange_index,
                    }))
                  )
                }

                // Create a single combined assistant message when both text and figure exist
                if (figureContent) {
                  const combinedMessage: ChatMessage = {
                    type: "ASSISTANT",
                    data: {
                      type: "FIGURE",
                      content: figureContent,
                      // prefer accumulated text as the description; fall back to figure's own text_description
                      textDescription: accumulatedText.trim() || figureContent.text_description || undefined,
                      citations: citations?.citations || undefined,
                    },
                    ui_properties: {
                      disable_submit: false,
                      disable_close: false,
                      disable_text: false,
                    },
                    show_chat: true,
                    process_completed: true,
                    message_id: tempMetadata?.message_id || getRandomUUID(),
                    conversation_id: tempMetadata?.conversation_id || currentConversationId,
                    exchange_index: tempMetadata?.exchange_index ?? realExchangeIndex,
                  }

                  setMessages((prev) => [...prev, combinedMessage])
                } else if (accumulatedText.trim()) {
                  const assistantMessage: ChatMessage = {
                    type: "ASSISTANT",
                    data: {
                      type: "TEXT",
                      content: accumulatedText.trim(),
                      citations: citations?.citations || undefined,
                    },
                    ui_properties: {
                      disable_submit: false,
                      disable_close: false,
                      disable_text: false,
                    },
                    show_chat: true,
                    process_completed: true,
                    message_id: tempMetadata?.message_id || getRandomUUID(),
                    conversation_id: tempMetadata?.conversation_id || currentConversationId,
                    exchange_index: tempMetadata?.exchange_index ?? realExchangeIndex,
                  }

                  setMessages((prev) => [...prev, assistantMessage])
                }

                setStreamingMessage(null)
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Streaming request was aborted")
      } else {
        console.error("Error in streaming:", error)
      }
      setStreamingMessage(null)
    } finally {
      setIsProcessing(false)
      abortControllerRef.current = null
    }
  }

  // Function to add user message to chat
  const addUserMessage = (content: string) => {
    sendMessageViaStreamAPI(content)
  }

  const handleRegenerateResponse = async (conversationId: string, exchangeIndex: number) => {
    console.log("🔄 Handling regenerate response for exchange:", exchangeIndex)
    setIsProcessing(true)

    const realConversationId = conversationMetadata?.conversation_id || conversationId
    const realMessageId = conversationMetadata?.message_id || getRandomUUID()

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
      const apiData = await response.json()
      console.log("Regenerate API response:", apiData)

      // Support multiple API response shapes. Prefer apiData.data.response but
      // fall back to apiData.data or apiData itself.
      const responseObj = apiData?.data?.response ?? apiData?.data ?? apiData

      // Normalize content into an array of items
      let contentItems: any[] = []
      if (Array.isArray(responseObj?.content)) {
        contentItems = responseObj.content
      } else if (Array.isArray(responseObj)) {
        contentItems = responseObj
      } else if (responseObj && responseObj.content) {
        // If content is a single item, wrap it
        contentItems = Array.isArray(responseObj.content) ? responseObj.content : [responseObj.content]
      } else if (typeof responseObj === "string") {
        contentItems = [{ type: "TEXT", content: responseObj }]
      }

      if (!contentItems || contentItems.length === 0) {
        console.warn("Regenerate API returned unexpected payload", apiData)
        setIsProcessing(false)
        return
      }

      // Helper to safely convert response content to string
      const convertContentToString = (c: any) => {
        if (typeof c === "string") return c
        if (Array.isArray(c)) return c.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ")
        if (typeof c === "object" && c !== null) return JSON.stringify(c)
        return String(c ?? "")
      }

      let textContent = ""
      let citations = null

      contentItems.forEach((item: any) => {
        if (!item) return
        const itemType = item.type || (item?.content && typeof item.content === "string" ? "TEXT" : undefined)
        if (itemType === "TEXT") {
          textContent = convertContentToString(item.content ?? item.text ?? item)
        } else if (itemType === "REFERENCES") {
          citations = item.content?.citations || item.items || null
        } else if (typeof item === "string") {
          textContent = convertContentToString(item)
        }
      })

      if (!textContent || !textContent.trim()) {
        console.warn("Regenerated response contains no text content", apiData)
        setIsProcessing(false)
        return
      }

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
        message_id: apiData?.data?.response_id || apiData?.data?.response_id || apiData?.data?.response?.id || getRandomUUID(),
        conversation_id: realConversationId,
        exchange_index: exchangeIndex,
      }

      setExchangeResponses((prev) => {
        const currentExchange = prev[exchangeIndex] || { responses: [], currentIndex: 0 }
        // Try to find an existing assistant response for this exchange from current messages
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

      // Replace assistant/status messages for this exchange and insert regenerated message
      setMessages((prev) => {
        // remove existing assistant/status for this exchange
        const filtered = prev.filter((m) => !(m.exchange_index === exchangeIndex && (m.type === "ASSISTANT" || m.data.type === "STATUS")))

        const result: ChatMessage[] = []
        let inserted = false

        for (let i = 0; i < filtered.length; i++) {
          const m = filtered[i]
          result.push(m)

          // Insert regenerated message immediately after the user message for this exchange
          if (!inserted && m.type === "USER" && m.exchange_index === exchangeIndex) {
            result.push(regeneratedMessage)
            inserted = true
          }
        }

        // If we didn't find the user message, insert before the first message with a greater exchange_index
        if (!inserted) {
          const idx = result.findIndex((m) => (m.exchange_index ?? 0) > exchangeIndex)
          if (idx === -1) {
            result.push(regeneratedMessage)
          } else {
            result.splice(idx, 0, regeneratedMessage)
          }
        }

        return result
      })
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

  const combinedMessages = useChatMessages(messages)

  // Ref to messages container for auto-scrolling
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom whenever messages change or streaming message updates
  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return

    // Wait for next paint to ensure new message is rendered
    requestAnimationFrame(() => {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      } catch (e) {
        // Fallback
        el.scrollTop = el.scrollHeight
      }
    })
  }, [combinedMessages, streamingMessage])

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
    <div className="h-[calc(100vh-65px)] w-full flex flex-col">
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

  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0">
        {!userHasSentMessage ? (
          <div className="h-full">
            <EmptyState />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-2 py-3">
            <div className="space-y-6">
              {combinedMessages.map((message, index) => (
                <MessageBubble
                  key={`${index}-${message.type}-${message.data.type}-${message.message_id}`}
                  message={message}
                  isProcessing={false}
                  onRegenerateResponse={handleRegenerateResponse}
                  exchangeResponses={exchangeResponses}
                  onPreviousResponse={handlePreviousResponse}
                  onNextResponse={handleNextResponse}
                />
              ))}
              {streamingMessage && (
                <MessageBubble
                  key={`streaming-${
                    typeof streamingMessage.data.content === "string"
                      ? streamingMessage.data.content.length
                      : JSON.stringify(streamingMessage.data.content ?? "").length
                  }`}
                  message={streamingMessage}
                  // Show the streaming text as it arrives (do not render the loading indicator)
                  isProcessing={false}
                  onRegenerateResponse={handleRegenerateResponse}
                  exchangeResponses={exchangeResponses}
                  onPreviousResponse={handlePreviousResponse}
                  onNextResponse={handleNextResponse}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-10 py-6">
          <SendMessage onSendMessage={addUserMessage} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  )
}

export default ChatWithDataIndexPage