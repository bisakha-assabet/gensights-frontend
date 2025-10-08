interface Citation {
  case_no: string
  question_id: number
  question: string
  case_created_date: string | null
}

interface ChatMessage {
  type: string
  data: {
    type: string
    content:
      | string
      | FigureContent
      | {
          image_data: string
          title: string
          chart_type: string
        }
      | {
          citations: Citation[]
          count: number
        }
    textDescription?: string // For combined chart and text responses
    citations?: Citation[] // For combined citation and text responses
  }
  ui_properties: {
    disable_submit: boolean
    disable_close: boolean
    disable_text: boolean
  }
  show_chat: boolean
  process_completed: boolean
  message_id?: string
  conversation_id?: string
  exchange_index?: number
}

interface FigureContent {
  image_data?: string // Base64 string for images
  title?: string
  chart_type?: string
  plotly_config?: any // Define a more specific type if Plotly config structure is known
  textDescription?: string
}

interface ApiMessage {
  message_id: string
  role: string
  content: any[]
  created_at: string
  feedback?: string
  metadata?: any
}

interface ApiExchange {
  exchange_id: string
  exchange_index: number
  user_message: ApiMessage
  assistant_responses: ApiMessage[]
  created_at: string
  updated_at: string
}

interface ApiConversation {
  conversation_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  exchanges: ApiExchange[]
}

export type { ChatMessage, Citation, FigureContent, ApiMessage, ApiExchange, ApiConversation }
