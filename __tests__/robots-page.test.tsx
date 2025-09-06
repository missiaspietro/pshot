import { render, screen, waitFor } from '@testing-library/react'
import { useAuth } from '@/contexts/auth-context'
import RobotsPage from '@/app/robots/page'

// Mock do contexto de autenticação
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn()
}))

// Mock do bot service
jest.mock('@/lib/bot-service', () => ({
  botService: {
    getBotsByUserAccess: jest.fn()
  },
  accessControlUtils: {
    canAccessRobots: jest.fn(),
    getNoAccessMessage: jest.fn(),
    getUserAccessType: jest.fn()
  }
}))

// Mock do componente de proteção de rota
jest.mock('@/components/protected-route-with-permission', () => ({
  ProtectedRouteWithPermission: ({ children }: { children: React.ReactNode }) => children
}))

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  }
}))

// Mock do fetch global
global.fetch = jest.fn()

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Robots Page Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock fetch para user-data API
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_level: 'user',
        empresa: 'test_company',
        loja: 'test_store'
      })
    })
  })

  describe('Super Admin Access', () => {
    it('should show all company robots for super admin', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          name: 'Super Admin',
          email: 'admin@test.com',
          access_level: 'super_admin',
          empresa: 'test_company',
          loja: 'store1',
          permissions: {},
          telaShotPermissions: { telaShot_bots: true }
        },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn()
      })

      const { botService, accessControlUtils } = await import('@/lib/bot-service')
      ;(accessControlUtils.canAccessRobots as jest.Mock).mockReturnValue(true)
      ;(accessControlUtils.getUserAccessType as jest.Mock).mockReturnValue('super_admin')
      ;(botService.getBotsByUserAccess as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Bot 1', loja: 'store1', rede: 'test_company', status: 'open' },
        { id: '2', nome: 'Bot 2', loja: 'store2', rede: 'test_company', status: 'close' }
      ])

      render(<RobotsPage />)

      await waitFor(() => {
        expect(screen.getByText('Super Admin')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Bot 1')).toBeInTheDocument()
        expect(screen.getByText('Bot 2')).toBeInTheDocument()
      })
    })
  })

  describe('Store User Access', () => {
    it('should show only store robots for regular user', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 2,
          name: 'Store User',
          email: 'user@test.com',
          access_level: 'user',
          empresa: 'test_company',
          loja: 'store1',
          permissions: {},
          telaShotPermissions: { telaShot_bots: true }
        },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn()
      })

      const { botService, accessControlUtils } = await import('@/lib/bot-service')
      ;(accessControlUtils.canAccessRobots as jest.Mock).mockReturnValue(true)
      ;(accessControlUtils.getUserAccessType as jest.Mock).mockReturnValue('store_user')
      ;(botService.getBotsByUserAccess as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Bot 1', loja: 'store1', rede: 'test_company', status: 'open' }
      ])

      render(<RobotsPage />)

      await waitFor(() => {
        expect(screen.getByText('Bot 1')).toBeInTheDocument()
      })

      // Não deve mostrar o badge de Super Admin
      expect(screen.queryByText('Super Admin')).not.toBeInTheDocument()
    })

    it('should show store-specific description for regular user', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 2,
          name: 'Store User',
          email: 'user@test.com',
          access_level: 'user',
          empresa: 'test_company',
          loja: 'store1',
          permissions: {},
          telaShotPermissions: { telaShot_bots: true }
        },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn()
      })

      const { botService, accessControlUtils } = await import('@/lib/bot-service')
      ;(accessControlUtils.canAccessRobots as jest.Mock).mockReturnValue(true)
      ;(accessControlUtils.getUserAccessType as jest.Mock).mockReturnValue('store_user')
      ;(botService.getBotsByUserAccess as jest.Mock).mockResolvedValue([])

      render(<RobotsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Gerencie a conexão dos robôs de WhatsApp da loja store1/)).toBeInTheDocument()
      })
    })
  })

  describe('No Access Scenarios', () => {
    it('should show no access message for user without store', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 3,
          name: 'No Store User',
          email: 'nostore@test.com',
          access_level: 'user',
          empresa: 'test_company',
          loja: '',
          permissions: {},
          telaShotPermissions: { telaShot_bots: true }
        },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn()
      })

      const { accessControlUtils } = await import('@/lib/bot-service')
      ;(accessControlUtils.canAccessRobots as jest.Mock).mockReturnValue(false)
      ;(accessControlUtils.getNoAccessMessage as jest.Mock).mockReturnValue(
        'Nenhum robô encontrado. Entre em contato com o administrador para configurar sua loja.'
      )

      render(<RobotsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Entre em contato com o administrador para configurar sua loja/)).toBeInTheDocument()
      })
    })
  })

  describe('Statistics Calculations', () => {
    it('should calculate statistics based on visible robots only', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 2,
          name: 'Store User',
          email: 'user@test.com',
          access_level: 'user',
          empresa: 'test_company',
          loja: 'store1',
          permissions: {},
          telaShotPermissions: { telaShot_bots: true }
        },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn()
      })

      const { botService, accessControlUtils } = await import('@/lib/bot-service')
      ;(accessControlUtils.canAccessRobots as jest.Mock).mockReturnValue(true)
      ;(accessControlUtils.getUserAccessType as jest.Mock).mockReturnValue('store_user')
      ;(botService.getBotsByUserAccess as jest.Mock).mockResolvedValue([
        { id: '1', nome: 'Bot 1', loja: 'store1', rede: 'test_company', status: 'open' },
        { id: '2', nome: 'Bot 2', loja: 'store1', rede: 'test_company', status: 'close' }
      ])

      render(<RobotsPage />)

      await waitFor(() => {
        // Total deve ser 2 (apenas bots da loja do usuário)
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('Total de Robôs')).toBeInTheDocument()
      })
    })

    it('should show zero statistics when no robots are visible', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 2,
          name: 'Store User',
          email: 'user@test.com',
          access_level: 'user',
          empresa: 'test_company',
          loja: 'store1',
          permissions: {},
          telaShotPermissions: { telaShot_bots: true }
        },
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn()
      })

      const { botService, accessControlUtils } = await import('@/lib/bot-service')
      ;(accessControlUtils.canAccessRobots as jest.Mock).mockReturnValue(true)
      ;(accessControlUtils.getUserAccessType as jest.Mock).mockReturnValue('store_user')
      ;(botService.getBotsByUserAccess as jest.Mock).mockResolvedValue([])

      render(<RobotsPage />)

      await waitFor(() => {
        // Deve mostrar 0 em todas as estatísticas
        const zeroElements = screen.getAllByText('0')
        expect(zeroElements.length).toBeGreaterThanOrEqual(3) // Total, Conectados, Desconectados
      })
    })
  })
})