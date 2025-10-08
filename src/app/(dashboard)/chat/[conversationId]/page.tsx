"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import type React from "react"

import SendMessage from "../components/SendMessage"
import MessageBubble from "../components/MessageBubble"
import EmptyState from "../components/EmptyState"
import type { ChatMessage } from "../components/types"
import { getRandomUUID } from "../lib/utils"
import { useChatMessages } from "../hooks/use-chat-messages"
import { useConversationDetails } from "../hooks/useConversationDetails"

interface ExchangeResponses {
  [exchangeIndex: number]: {
    responses: ChatMessage[]
    currentIndex: number
  }
}

const ConversationPage: React.FC = () => {
  const params = useParams()
  const conversationId = params?.conversationId as string | undefined

  const wsRef = useRef<WebSocket | null>(null)
  const idRef = useRef<string>("")
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [userHasSentMessage, setUserHasSentMessage] = useState(false)
  const [isLoadingExistingConversation, setIsLoadingExistingConversation] = useState(false)
  const [exchangeResponses, setExchangeResponses] = useState<ExchangeResponses>({})

  const {
    conversation,
    loading: conversationLoading,
    error: conversationError,
  } = useConversationDetails(conversationId || null)

  useEffect(() => {
    if (!idRef.current) {
      idRef.current = getRandomUUID()
    }
  }, [conversationId])

  const convertToChatMessages = (conversation: any): ChatMessage[] => {
    const chatMessages: ChatMessage[] = []

    if (conversation.exchanges && Array.isArray(conversation.exchanges)) {
      conversation.exchanges.forEach((exchange: any, exchangeIndex: number) => {
        if (exchange.user_message) {
          let content = ""

          // Enhanced parsing for user message content
          if (typeof exchange.user_message.content === "string") {
            content = exchange.user_message.content
          } else if (Array.isArray(exchange.user_message.content)) {
            // Handle array format - extract text from TEXT type objects
            exchange.user_message.content.forEach((item: any) => {
              if (typeof item === "string") {
                content += item + " "
              } else if (item.type === "TEXT" && item.text) {
                content += item.text + " "
              } else if (typeof item === "object" && item.text) {
                content += (typeof item.text === "string" ? item.text : JSON.stringify(item.text)) + " "
              }
            })
          } else if (typeof exchange.user_message.content === "object" && exchange.user_message.content !== null) {
            
            if (exchange.user_message.content.text) {
              if (typeof exchange.user_message.content.text === "string") {
                content = exchange.user_message.content.text
              } else if (typeof exchange.user_message.content.text === "object") {
                // If it's nested further, try to extract the actual text
                const textObj = exchange.user_message.content.text
                if (typeof textObj === "object" && textObj !== null) {
                  // Try common properties that might contain the actual text
                  content = textObj.content || textObj.text || textObj.message || Object.values(textObj)[0] || JSON.stringify(textObj)
                } else {
                  content = String(textObj)
                }
              }
            } else if (exchange.user_message.content.content) {
              // Handle cases where content is nested under 'content' property
              content = typeof exchange.user_message.content.content === "string" 
                ? exchange.user_message.content.content 
                : JSON.stringify(exchange.user_message.content.content)
            } else {
              // Fallback: try to find any string value in the object
              const values = Object.values(exchange.user_message.content)
              const stringValue = values.find(v => typeof v === "string")
              content = stringValue || JSON.stringify(exchange.user_message.content)
            }
          } else {
            content = String(exchange.user_message.content)
          }

          chatMessages.push({
            type: "USER",
            data: { type: "TEXT", content: content.trim() },
            ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
            show_chat: true,
            process_completed: true,
            message_id: exchange.user_message.message_id || getRandomUUID(),
            conversation_id: conversation.conversation_id || conversationId,
            exchange_index: exchangeIndex,
          })
        }

        // Handle assistant responses with support for both TEXT and FIGURE types
        if (exchange.assistant_responses && Array.isArray(exchange.assistant_responses)) {
          const allResponses: ChatMessage[] = []

          exchange.assistant_responses.forEach((assistantMessage: any) => {
            if (Array.isArray(assistantMessage.content)) {
              // Handle array format content - can contain both TEXT and FIGURE
              let textContent = ""
              let citations: any[] = []
              let figureContent: any = null
              let textDescription = ""

              assistantMessage.content.forEach((item: any) => {
                if (item.type === "TEXT") {
                  textContent = item.text || item.content || ""
                } else if (item.type === "REFERENCES") {
                  citations = item.items || []
                } else if (item.type === "FIGURE") {
                  figureContent = {
                    chart_type: item.chart_type || "chart",
                    caption: item.caption || "",
                    plotly_config: item.plotly_config || null,
                    image_data: item.image_data || null
                  }
                }
              })

              // Decide what type of message this should be
              if (figureContent && (figureContent.plotly_config || figureContent.image_data)) {
                // Create FIGURE message with text as description
                const figureMessage: ChatMessage = {
                  type: "ASSISTANT",
                  data: {
                    type: "FIGURE",
                    content: figureContent,
                    textDescription: textContent.trim() || undefined,
                  },
                  ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
                  show_chat: true,
                  process_completed: true,
                  message_id: assistantMessage.message_id || getRandomUUID(),
                  conversation_id: conversation.conversation_id || conversationId,
                  exchange_index: exchange.exchange_index || exchangeIndex,
                }
                allResponses.push(figureMessage)
              } else if (textContent.trim()) {
                // Create TEXT message only if there's no figure content
                const textMessage: ChatMessage = {
                  type: "ASSISTANT",
                  data: {
                    type: "TEXT",
                    content: textContent.trim(),
                    citations: citations.length > 0 ? citations : undefined,
                  },
                  ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
                  show_chat: true,
                  process_completed: true,
                  message_id: assistantMessage.message_id || getRandomUUID(),
                  conversation_id: conversation.conversation_id || conversationId,
                  exchange_index: exchange.exchange_index || exchangeIndex,
                }
                allResponses.push(textMessage)
              }
            } else {
              // Handle legacy string format (existing logic)
              let textContent = ""
              let citations: any[] = []

              if (typeof assistantMessage.content === "string") {
                // Try to parse as JSON
                try {
                  const lines: string[] = assistantMessage.content.trim().split("\n")
                  lines.forEach((line) => {
                    if (line.trim()) {
                      const parsed = JSON.parse(line)
                      if (parsed.type === "TEXT") {
                        textContent = parsed.text
                      } else if (parsed.type === "REFERENCES") {
                        citations = parsed.items || []
                      }
                    }
                  })
                } catch {
                  // If parsing fails, treat as plain text
                  textContent = assistantMessage.content
                }
              } else {
                textContent = JSON.stringify(assistantMessage.content)
              }

              const chatMessage: ChatMessage = {
                type: "ASSISTANT",
                data: {
                  type: "TEXT",
                  content: textContent.trim(),
                  citations: citations.length > 0 ? citations : undefined,
                },
                ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
                show_chat: true,
                process_completed: true,
                message_id: assistantMessage.message_id || getRandomUUID(),
                conversation_id: conversation.conversation_id || conversationId,
                exchange_index: exchange.exchange_index || exchangeIndex,
              }

              allResponses.push(chatMessage)
            }
          })

          // Add all responses to chat messages
          allResponses.forEach(response => {
            chatMessages.push(response)
          })

          // Handle multiple responses for regeneration feature
          if (allResponses.length > 1) {
            setExchangeResponses((prev) => ({
              ...prev,
              [exchangeIndex]: {
                responses: allResponses,
                currentIndex: 0,
              },
            }))
          }
        }
      })
    }

    return chatMessages
  }

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

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setUserHasSentMessage(false)
      setIsProcessing(false)
    }
  }, [conversationId])

  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      type: "USER",
      data: { type: "TEXT", content },
      ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
      show_chat: true,
      process_completed: true,
      message_id: getRandomUUID(),
      conversation_id: conversationId,
      exchange_index: Math.floor(messages.length / 2),
    }
    setMessages((prev) => [...prev, userMessage])
    setUserHasSentMessage(true)
    setIsProcessing(true)
  }

  const handleRegenerateResponse = async (conversationId: string, exchangeIndex: number) => {
    console.log("🔄 Handling regenerate response for exchange:", exchangeIndex)
    setIsProcessing(true)

    const statusMessage: ChatMessage = {
      type: "ASSISTANT",
      data: { type: "STATUS", content: "Processing..." },
      ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
      show_chat: true,
      process_completed: false,
      message_id: getRandomUUID(),
      conversation_id: conversationId,
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
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${conversationId}/exchanges/${exchangeIndex}/regenerate-with-ai`,
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

        // Extract text and citations from the response
        apiData.data.response.content.forEach((item: any) => {
          if (item.type === "TEXT") {
            textContent = item.content
          } else if (item.type === "REFERENCES") {
            citations = item.content.citations
          }
        })

        // Create the new assistant message
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
          message_id: apiData.data.response_id || getRandomUUID(),
          conversation_id: conversationId,
          exchange_index: exchangeIndex,
        }

        setExchangeResponses((prev) => {
          const currentExchange = prev[exchangeIndex] || { responses: [], currentIndex: 0 }

          // Find existing response in messages to add to responses array 
          const existingResponse = messages.find(
            (m) => m.exchange_index === exchangeIndex && m.type === "ASSISTANT" && m.data.type !== "STATUS",
          )

          let updatedResponses = [...currentExchange.responses]

          // Add existing response 
          if (existingResponse && !updatedResponses.find((r) => r.message_id === existingResponse.message_id)) {
            updatedResponses = [existingResponse, ...updatedResponses]
          }

          // Add the new regenerated response
          updatedResponses.push(regeneratedMessage)

          return {
            ...prev,
            [exchangeIndex]: {
              responses: updatedResponses,
              currentIndex: updatedResponses.length - 1, // Show the newest response
            },
          }
        })

        // Update messages by replacing the status message 
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

  const setActiveResponse = async (conversation_id: string, exchange_index: number, response_id: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/${conversation_id}/exchanges/${exchange_index}/active-response`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ response_id: response_id }),
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

      if (conversationId && selectedResponse.message_id) {
        setActiveResponse(conversationId, exchangeIndex, selectedResponse.message_id)
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

      if (conversationId && selectedResponse.message_id) {
        setActiveResponse(conversationId, exchangeIndex, selectedResponse.message_id)
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

  useEffect(() => {
    if (!wsRef.current && idRef.current) {
      const token = localStorage.getItem("token")

      const url = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/ws/ai/${idRef.current}/?token=${token}&conversation_id=${conversationId}`
      console.log("Attempting WebSocket connection:", url, "with token:", token ? "present" : "missing")

      try {
        wsRef.current = new WebSocket(url)

        wsRef.current.onopen = () => setConnected(true)

        wsRef.current.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data)
            console.log(" Raw WebSocket data received:", rawData)

            let messageWithProperties: ChatMessage

            // Check if this is a regenerated response format
            if (rawData.data && rawData.data.response && rawData.data.response.content) {
              console.log(" Processing regenerated response format")

              // Transform regenerated response to ChatMessage format
              const responseData = rawData.data
              const content = responseData.response.content

              // Find the TEXT content from the content array
              const textContent = content.find((c: any) => c.type === "TEXT")
              const referencesContent = content.find((c: any) => c.type === "REFERENCES")

              messageWithProperties = {
                type: "ASSISTANT",
                data: {
                  type: "TEXT",
                  content: textContent ? textContent.content : "",
                  citations: referencesContent ? referencesContent.content.citations : undefined,
                },
                ui_properties: { disable_submit: false, disable_close: false, disable_text: false },
                show_chat: true,
                process_completed: true,
                message_id: responseData.response_id || getRandomUUID(),
                conversation_id: responseData.conversation_id || conversationId,
                exchange_index: responseData.exchange_index ?? Math.floor(messages.length / 2),
              }
            } else {
              // Handle regular WebSocket message format
              const data = rawData as ChatMessage
              messageWithProperties = {
                ...data,
                message_id: data.message_id || getRandomUUID(),
                conversation_id: data.conversation_id || conversationId,
                exchange_index: data.exchange_index ?? Math.floor(messages.length / 2),
              }
            }

            console.log(" Processed WebSocket message:", {
              type: messageWithProperties.type,
              dataType: messageWithProperties.data.type,
              exchangeIndex: messageWithProperties.exchange_index,
              messageId: messageWithProperties.message_id,
            })

            setMessages((prev) => {
              const filtered = prev.filter((m) => {
                // Remove STATUS messages for this exchange
                if (m.exchange_index === messageWithProperties.exchange_index && m.data.type === "STATUS") {
                  console.log(" Removing STATUS message for exchange", messageWithProperties.exchange_index)
                  return false
                }
                if (
                  messageWithProperties.type === "ASSISTANT" &&
                  (messageWithProperties.data.type === "TEXT" || messageWithProperties.data.type === "FIGURE")
                ) {
                  const shouldRemove =
                    m.exchange_index === messageWithProperties.exchange_index && m.type === "ASSISTANT"
                  if (shouldRemove) {
                    console.log(
                      " Replacing existing assistant message for exchange",
                      messageWithProperties.exchange_index,
                    )
                  }
                  return !shouldRemove
                }

                return true
              })

              console.log(" Adding new message to filtered array")
              return [...filtered, messageWithProperties]
            })

            if (messageWithProperties.data.type === "STATUS") {
              setIsProcessing(messageWithProperties.data.content === "Processing")
            } else if (
              messageWithProperties.process_completed ||
              messageWithProperties.data.type === "TEXT" ||
              messageWithProperties.data.type === "FIGURE"
            ) {
              setIsProcessing(false)
            }
          } catch (err) {
            console.error("❌ Error parsing WebSocket message:", err)
          }
        }

        wsRef.current.onclose = () => setConnected(false)
        wsRef.current.onerror = () => setConnected(false)
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error)
        setConnected(false)
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [conversationId])

  if (conversationId && (conversationLoading || isLoadingExistingConversation)) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Conversation ID: {conversationId}</p>
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
              {combinedMessages.map((message) => (
                <MessageBubble
                  key={message.message_id}
                  message={message}
                  isProcessing={isProcessing && message.data.type === "STATUS"}
                  onRegenerateResponse={handleRegenerateResponse}
                  exchangeResponses={exchangeResponses}
                  onPreviousResponse={handlePreviousResponse}
                  onNextResponse={handleNextResponse}
                />
              ))}
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

export default ConversationPage
