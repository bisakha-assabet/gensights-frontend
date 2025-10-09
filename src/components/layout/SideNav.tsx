"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Grid3X3,
  Shield,
  Settings,
  Moon,
  LogOut,
  MessageCircleMore,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  MessageSquare,
  Clock,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useDarkMode } from "../../context/DarkModeContext"
import { useAuth } from "@/context/auth"
import { useConversations } from "@/app/(dashboard)/chat/hooks/useConversations"

// Interface for conversation data
interface Conversation {
  conversation_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

const SideNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({})
  const [searchQuery, setSearchQuery] = useState("") // State for search input
  const [searchResults, setSearchResults] = useState<Conversation[]>([]) // State for search results
  const [isSearching, setIsSearching] = useState(false) // State for search loading
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { logout, user } = useAuth() // Get user for role-based access
  const router = useRouter()
  const pathname = usePathname()

  // Local loading state for optimistic UI feedback
  const [newChatLoading, setNewChatLoading] = useState(false)
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null)

  // Check if user is on chat page
  const isOnChatPage = pathname.startsWith("/chat")

  // Fetch conversations only when on chat page
  const { conversations, loading, error, refetch } = useConversations(100, 0, "-updated_at")

  // Role-based access control for admin panel
  const hasAdminAccess = () => {
    if (!user) return false
    
    const allowedRoles = [
      'Global Admin'
    ]
    
    return allowedRoles.includes(user.role)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    logout()
    router.push("/login")
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    window.dispatchEvent(new Event("resize"))
  }

  // Handle chat-specific actions
  const handleNewChat = () => {
    // set optimistic loading state so user sees immediate feedback
    setNewChatLoading(true)
    // navigate to chat and refresh list; avoid full page reload for better UX
    router.push("/chat")
    refetch()
  }

  // Search conversation implementation - FIXED
  const handleSearchConversation = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      // Encode the query parameter properly
      const encodedQuery = encodeURIComponent(searchQuery)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDGENTICS_API_BASE_URL}/conversations/search/?query=${encodedQuery}&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to search conversations: ${response.status} - ${errorText}`)
      }

      const data: Conversation[] = await response.json()
      setSearchResults(data)
    } catch (err) {
      console.error("Search error:", err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Trigger search when query changes (with debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearchConversation()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleConversationClick = (conversationId: string) => {
    // mark the conversation as loading so UI shows feedback immediately
    setLoadingConversationId(conversationId)
    router.push(`/chat/${conversationId}`)
  }

  // Clear optimistic loading indicators when navigation completes or we leave chat
  useEffect(() => {
    if (pathname === "/chat") {
      setNewChatLoading(false)
      // If we navigated to chat root, clear any conversation loading id
      setLoadingConversationId(null)
      return
    }

    if (pathname.startsWith("/chat/")) {
      // extract id from path: /chat/:id
      const parts = pathname.split("/")
      const id = parts.length >= 3 ? parts[2] : null
      // stop the loading indicator if it matches the id we navigated to
      if (id && loadingConversationId === id) {
        setLoadingConversationId(null)
      }
      // also clear new chat loading once we are on a chat route
      setNewChatLoading(false)
      return
    }

    // left chat area: clear both
    setNewChatLoading(false)
    setLoadingConversationId(null)
  }, [pathname])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  interface MenuChild {
    id: string
    label: string
    href?: string
    onClick?: () => void
  }

  interface MenuItem {
    id: string
    label: string
    icon: React.ElementType
    href?: string
    onClick?: () => void
    children?: MenuChild[]
  }

  interface ExpandedMenus {
    [key: string]: boolean
  }

  const toggleSubmenu = (menuId: string) => {
    if (isCollapsed) return
    setExpandedMenus((prev: ExpandedMenus) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Grid3X3,
      href: "/dashboard",
    },
    // Show analytics for all users (data filtering is handled in components)
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      children: [
        { id: "weekly-timeline", label: "Weekly Timeline", href: "/analytics/weeklyTimeline" },
        { id: "topics-by-group", label: "Topics by group", href: "/analytics/topicsByGroup" },
        { id: "topics-by-country", label: "Topics by country", href: "/analytics/topicsByCountry" },
        { id: "topics-by-month", label: "Topics by month", href: "/analytics/topicsByMonth" },
      ],
    },
    // Only show admin panel if user has access
    ...(hasAdminAccess() ? [{
      id: "admin",
      label: "Admin Panel",
      icon: Shield,
      children: [
        { id: "users", label: "Users", href: "/admin/users" },
        { id: "data", label: "Data", href: "/admin/data" },
      ],
    }] : []),
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  const chatMenuItems = [
    {
      id: "new-chat",
      label: "New chat",
      icon: Plus,
      onClick: handleNewChat,
    },
    {
      id: "search-conversation",
      label: "Search Conversation",
      icon: Search,
      // No onClick here as we'll use the input field
    },
  ]

  type IsActiveRoute = (href: string) => boolean

  const isActiveRoute: IsActiveRoute = (href: string): boolean => {
    return pathname === href
  }

  interface ParentMenuItem extends MenuItem {
    children?: MenuChild[]
  }

  const isParentActive = (item: ParentMenuItem): boolean => {
    if (item.href && isActiveRoute(item.href)) return true
    if (item.children) {
      return item.children.some((child: MenuChild) => child.href && isActiveRoute(child.href))
    }
    return false
  }

  type GetActiveStyles = (isActive: boolean) => string

  const getActiveStyles: GetActiveStyles = (isActive: boolean): string => {
    return isActive
      ? "bg-blue-50 text-black dark:bg-blue-900/20 dark:text-white"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  }

  const logoSrc = isDarkMode ? "/dark-logo.svg" : "/logo.svg"

  return (
    <div
      className={`h-screen bg-white dark:bg-[#1C1C1C] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } relative flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 h-[65px] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isCollapsed ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Image src="/collapsed-logo.svg" alt="Gensights Logo" width={120} height={40} className="mx-auto" />
              </div>
            ) : (
              <Image
                src={logoSrc || "/placeholder.svg"}
                alt="Gensights Logo"
                width={120}
                height={40}
                className="mx-auto"
              />
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Chat With Data Button */}
      <div className="p-4 flex-shrink-0">
        <Link
          href="/chat"
          className={`w-full bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-md transition-colors inline-block text-center ${isCollapsed ? "py-1 px-1" : "py-3 px-4"}`}
          style={{ backgroundColor: "#132674" }}
        >
          {isCollapsed ? (
            <div className="flex justify-center">
              <MessageCircleMore size={16} />
            </div>
          ) : (
            "Chat With Data"
          )}
        </Link>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Navigation Menu */}
        <nav className="px-4 space-y-2 flex-shrink-0">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = isParentActive(item)
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMenus[item.id]

            return (
              <div key={item.id}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`flex items-center w-full rounded-md transition-colors group ${isCollapsed ? "px-1 py-1" : "px-3 py-3"} ${getActiveStyles(isActive)}`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 text-sm font-medium flex-1 text-left">{item.label}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href as string}
                    className={`flex items-center rounded-md transition-colors group ${isCollapsed ? "px-1 py-1" : "px-3 py-3"} ${getActiveStyles(isActive)}`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                  </Link>
                )}

                {hasChildren && isExpanded && !isCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href!}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          isActiveRoute(child.href!)
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Chat-specific menu items (shown only when on chat page) */}
        {isOnChatPage && (
          <div className="px-4 mt-4 flex-1 overflow-hidden flex flex-col">
            {/* Chat Action Buttons */}
            <div className="space-y-1 flex-shrink-0">
              {chatMenuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <div key={item.id}>
                    {item.id === "search-conversation" ? (
                      <div
                        className={`flex items-center w-full rounded-md transition-colors group ${
                          isCollapsed ? "px-1 py-1" : "px-3 py-2"
                        } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="ml-3 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none w-full"
                          />
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className={`flex items-center w-full rounded-md transition-colors group ${
                          isCollapsed ? "px-1 py-1" : "px-3 py-2"
                        } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                        aria-busy={item.id === "new-chat" ? newChatLoading : undefined}
                      >
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3 text-sm">{item.label}</span>
                            {item.id === "new-chat" && newChatLoading && (
                              <div className="ml-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Past conversations */}
            {!isCollapsed && (
              <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-3 flex items-center justify-between flex-shrink-0">
                  <span>RECENT CONVERSATIONS</span>
                  {(loading || isSearching) && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                  )}
                </div>

                {/* Scrollable conversations list */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                  <div className="space-y-1 pb-4">
                    {error && (
                      <div className="px-3 py-2 text-xs text-red-500 dark:text-red-400">
                        Failed to load conversations
                      </div>
                    )}

                    {searchQuery && searchResults.length === 0 && !isSearching && (
                      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        No conversations found
                      </div>
                    )}

                    {searchQuery ? (
                      // Display search results
                      searchResults.map((conversation) => (
                        <button
                          key={conversation.conversation_id}
                          className="flex items-start w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors group"
                          onClick={() => handleConversationClick(conversation.conversation_id)}
                          title={conversation.title}
                          aria-busy={loadingConversationId === conversation.conversation_id}
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0 mr-3 mt-0.5" />
                          <div className="flex-1 text-left overflow-hidden">
                            <div className="flex items-center">
                              <div className="truncate font-medium">{conversation.title || "Untitled Conversation"}</div>
                              {loadingConversationId === conversation.conversation_id && (
                                <div className="ml-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(conversation.updated_at)}</span>
                              <span className="ml-2">•</span>
                              <span className="ml-1">{conversation.message_count} messages</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      // Display all conversations
                      conversations.length === 0 && !loading && !error && (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">No conversations yet</div>
                      )
                    )}

                    {!searchQuery &&
                      conversations.map((conversation) => (
                        <button
                          key={conversation.conversation_id}
                          className="flex items-start w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors group"
                          onClick={() => handleConversationClick(conversation.conversation_id)}
                          title={conversation.title}
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0 mr-3 mt-0.5" />
                          <div className="flex-1 text-left overflow-hidden">
                            <div className="truncate font-medium">{conversation.title || "Untitled Conversation"}</div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(conversation.updated_at)}</span>
                              <span className="ml-2">•</span>
                              <span className="ml-1">{conversation.message_count} messages</span>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="mb-3">
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <Moon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Dark Mode</span>}
            {!isCollapsed && (
              <div className="ml-auto">
                <div
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    isDarkMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default SideNav;