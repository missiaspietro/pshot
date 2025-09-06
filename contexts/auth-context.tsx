'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  name: string
  email: string
  access_level: string
  instancia?: string | null
  empresa?: string
  rede?: string | null
  sub_rede?: string | null
  whatsapp?: string
  loja?: string
  permissions: {
    dashboard: boolean
    visitantes: boolean
    historico: boolean
    mensagens: boolean
    eventos: boolean
    treinamento: boolean
    conexao: boolean
    users: boolean
  }
  telaShotPermissions?: {
    telaShot_promocoes: boolean
    telaShot_relatorios: boolean
    telaShot_aniversarios: boolean
    telaShot_pesquisas: boolean
    telaShot_usuarios: boolean
    telaShot_bots: boolean
  }
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User | void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Carregamento inicial
  const router = useRouter()
  
  // Carrega do localStorage para persistir sessão entre recargas
  useEffect(() => {
    try {
      // Tenta recuperar dados do usuário do localStorage
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('ps_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          console.log('[AUTH] Sessão recuperada do localStorage')
        } else {
          setUser(null)
          console.log('[AUTH] Nenhuma sessão encontrada no localStorage')
        }
      }
    } catch (error) {
      console.error('[AUTH] Erro ao recuperar sessão:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log('[AUTH] Validando credenciais para:', email)
      
      // NÃO limpa a sessão nem altera o estado do usuário ainda
      // Apenas valida as credenciais primeiro
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Timestamp': Date.now().toString()
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
        cache: 'no-store'
      })

      console.log('[AUTH] Resposta da API:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[AUTH] Erro na resposta da API:', errorData)
        throw new Error(errorData.error || 'Senha e/ou e-mail incorretos.')
      }

      const data = await res.json()
      console.log('[AUTH] Dados recebidos da API:', data)

      // Garante que todos os campos obrigatórios existam
      const userData: User = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        access_level: data.access_level || 'user',
        empresa: data.empresa || '',
        rede: data.rede || null,
        whatsapp: data.whatsapp || '',
        instancia: data.instancia || null,
        sub_rede: data.sub_rede || data.subrede || null,
        loja: data.loja || null,
        permissions: data.permissions || {
          dashboard: false,
          visitantes: false,
          historico: false,
          mensagens: false,
          eventos: false,
          treinamento: false,
          conexao: false,
          users: false
        },
        telaShotPermissions: data.telaShotPermissions || {
          telaShot_promocoes: false,
          telaShot_relatorios: false,
          telaShot_aniversarios: false,
          telaShot_pesquisas: false,
          telaShot_usuarios: false,
          telaShot_bots: false,
        }
      }

      console.log('[AUTH] Credenciais válidas - processando login')
      
      // Limpa sessões anteriores ANTES de definir nova sessão
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ps_user')
        sessionStorage.removeItem('ps_user')
        localStorage.clear()
        sessionStorage.clear()
      }
      if (typeof document !== 'undefined') {
        document.cookie = 'ps_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        // Limpa todos os cookies do domínio
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      
      // Define um cookie de sessão temporário para o middleware
      if (typeof document !== 'undefined') {
        const sessionValue = `${userData.email}_${Date.now()}`
        document.cookie = `ps_session=${sessionValue}; path=/; max-age=86400; SameSite=Strict`
        console.log('[AUTH] Cookie de sessão definido:', sessionValue)
      }
      
      // APENAS AGORA atualiza o estado do usuário
      setUser(userData)
      
      // Salva os dados do usuário no localStorage para persistir a sessão
      if (typeof window !== 'undefined') {
        localStorage.setItem('ps_user', JSON.stringify(userData))
        console.log('[AUTH] Dados do usuário salvos no localStorage')
      }
      
      console.log('[AUTH] Login concluído - redirecionando')
      
      // FORÇAR REDIRECIONAMENTO IMEDIATO - SEM DELAY
      console.log('[AUTH] Executando redirecionamento IMEDIATO para /dashboard')
      
      // Tentar múltiplas formas de redirecionamento
      try {
        // Método 1: router.replace
        router.replace('/dashboard')
        
        // Método 2: window.location (fallback)
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            console.log('[AUTH] Fallback - usando window.location')
            window.location.href = '/dashboard'
          }, 50)
        }
      } catch (error) {
        console.error('[AUTH] Erro no redirecionamento:', error)
        // Método 3: Forçar com window.location imediatamente
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
      }
      
      return userData
    } catch (error: any) {
      // NÃO altera o estado do usuário em caso de erro
      // Mantém o usuário na página de login
      console.error('[AUTH] Erro de login:', error.message)
      throw new Error(error.message || 'Senha e/ou e-mail incorretos.')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    
    // Limpa qualquer armazenamento (por segurança)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ps_user')
      sessionStorage.removeItem('ps_user')
      localStorage.clear()
      sessionStorage.clear()
    }
    
    // Remove o cookie de sessão
    if (typeof document !== 'undefined') {
      document.cookie = 'ps_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    
    console.log('[AUTH] Logout realizado - redirecionando para login')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
