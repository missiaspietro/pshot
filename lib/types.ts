export interface User {
  id: number | string
  name: string
  email: string
  access_level: string
  instancia?: string
  empresa?: string
  sub_rede?: string
  whatsapp?: string
  store_id?: number
  created_at?: string
  updated_at?: string
  permissions?: {
    dashboard: boolean
    visitantes: boolean
    historico: boolean
    mensagens: boolean
    eventos: boolean
    treinamento: boolean
    conexao: boolean
    users: boolean
  }
}

export interface Survey {
  id: string
  title: string
  description: string
  questions: SurveyQuestion[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface SurveyQuestion {
  id?: string
  question?: string
  pergunta?: string
  options?: string[]
  opcoes?: string
  step?: number
  passo?: number
  status: string
  loja: string
  bot: string
  sala: string
  rede?: string
  sub_rede?: string
}

export interface SurveyResponse {
  id: string
  survey_id: string
  customer_name: string
  customer_phone: string
  store_id: number
  question_step: number
  question: string
  answer: string
  salesperson: string
  cashier: string
  created_at: string
}

export interface Promotion {
  id: string
  title: string
  description: string
  image_url: string
  is_active: boolean
  store_id: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Birthday {
  id: string
  name: string
  birth_date: string
  store_id: number
  status: "pending" | "sent" | "completed"
  created_at: string
}

export interface Robot {
  id: string
  name: string
  status: "connected" | "disconnected"
  qr_code: string
  store_id: number
  created_at: string
  updated_at: string
}
