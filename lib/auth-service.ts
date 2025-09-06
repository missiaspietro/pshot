import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

interface AuthenticatedUser {
  id: number
  email: string
  nome?: string
  empresa?: string
  // Adicione outros campos conforme necessário
}

export class AuthService {
  /**
   * Obtém o usuário autenticado a partir da requisição
   * SUBSTITUA esta implementação pela sua lógica de autenticação
   */
  static async getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
    try {
      // MÉTODO 1: Se você usa cookies/sessions
      const cookieStore = cookies()
      const sessionToken = cookieStore.get('session-token')?.value
      
      if (!sessionToken) {
        return null
      }
      
      // Validar o token e obter dados do usuário
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
        headers: {
          'Cookie': `session-token=${sessionToken}`
        }
      })
      
      if (!response.ok) {
        return null
      }
      
      const session = await response.json()
      return session.user
      
      // MÉTODO 2: Se você usa JWT no header Authorization
      // const authHeader = request.headers.get('authorization')
      // if (!authHeader?.startsWith('Bearer ')) {
      //   return null
      // }
      // 
      // const token = authHeader.substring(7)
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      // return decoded as AuthenticatedUser
      
      // MÉTODO 3: Se você usa NextAuth.js
      // const session = await getServerSession(authOptions)
      // return session?.user || null
      
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return null
    }
  }

  /**
   * Versão alternativa que funciona com cookies diretamente
   */
  static async getCurrentUserFromCookies(): Promise<AuthenticatedUser | null> {
    try {
      const cookieStore = cookies()
      
      // Adapte estes nomes para os cookies que seu sistema usa
      const userId = cookieStore.get('user_id')?.value
      const userEmail = cookieStore.get('user_email')?.value
      
      if (!userId || !userEmail) {
        return null
      }
      
      return {
        id: parseInt(userId),
        email: userEmail
      }
      
    } catch (error) {
      console.error('Erro ao obter usuário dos cookies:', error)
      return null
    }
  }

  /**
   * Versão simplificada para desenvolvimento/teste
   * REMOVA em produção
   */
  static async getMockUser(): Promise<AuthenticatedUser> {
    return {
      id: 1,
      email: 'user@example.com',
      nome: 'Usuário Teste'
    }
  }
}