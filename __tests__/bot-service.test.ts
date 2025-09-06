import { botService, accessControlUtils } from '@/lib/bot-service'

// Mock do Supabase client
jest.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  })
}))

describe('Bot Service Access Control', () => {
  describe('accessControlUtils', () => {
    describe('isSuperAdmin', () => {
      it('should return true for super_admin access level', () => {
        const user = { access_level: 'super_admin', empresa: 'test', loja: 'test' }
        expect(accessControlUtils.isSuperAdmin(user)).toBe(true)
      })

      it('should return true for admin access level', () => {
        const user = { access_level: 'admin', empresa: 'test', loja: 'test' }
        expect(accessControlUtils.isSuperAdmin(user)).toBe(true)
      })

      it('should return true for case insensitive super_admin', () => {
        const user = { access_level: 'SUPER_ADMIN', empresa: 'test', loja: 'test' }
        expect(accessControlUtils.isSuperAdmin(user)).toBe(true)
      })

      it('should return false for non-admin access level', () => {
        const user = { access_level: 'user', empresa: 'test', loja: 'test' }
        expect(accessControlUtils.isSuperAdmin(user)).toBe(false)
      })

      it('should return false for null user', () => {
        expect(accessControlUtils.isSuperAdmin(null)).toBe(false)
      })
    })

    describe('hasStoreAssigned', () => {
      it('should return true when user has store assigned', () => {
        const user = { access_level: 'user', empresa: 'test', loja: 'store1' }
        expect(accessControlUtils.hasStoreAssigned(user)).toBe(true)
      })

      it('should return false when user has no store assigned', () => {
        const user = { access_level: 'user', empresa: 'test', loja: '' }
        expect(accessControlUtils.hasStoreAssigned(user)).toBe(false)
      })

      it('should return false when user has null store', () => {
        const user = { access_level: 'user', empresa: 'test', loja: undefined }
        expect(accessControlUtils.hasStoreAssigned(user)).toBe(false)
      })

      it('should return false for null user', () => {
        expect(accessControlUtils.hasStoreAssigned(null)).toBe(false)
      })
    })

    describe('getUserAccessType', () => {
      it('should return super_admin for super admin users', () => {
        const user = { access_level: 'super_admin', empresa: 'test', loja: 'store1' }
        expect(accessControlUtils.getUserAccessType(user)).toBe('super_admin')
      })

      it('should return store_user for regular users with store', () => {
        const user = { access_level: 'user', empresa: 'test', loja: 'store1' }
        expect(accessControlUtils.getUserAccessType(user)).toBe('store_user')
      })

      it('should return no_access for users without store', () => {
        const user = { access_level: 'user', empresa: 'test', loja: '' }
        expect(accessControlUtils.getUserAccessType(user)).toBe('no_access')
      })

      it('should return no_access for null user', () => {
        expect(accessControlUtils.getUserAccessType(null)).toBe('no_access')
      })
    })

    describe('canAccessRobots', () => {
      it('should allow access for super admin', () => {
        const user = { access_level: 'super_admin', empresa: 'test', loja: 'store1' }
        expect(accessControlUtils.canAccessRobots(user)).toBe(true)
      })

      it('should allow access for store user', () => {
        const user = { access_level: 'user', empresa: 'test', loja: 'store1' }
        expect(accessControlUtils.canAccessRobots(user)).toBe(true)
      })

      it('should deny access for user without store', () => {
        const user = { access_level: 'user', empresa: 'test', loja: '' }
        expect(accessControlUtils.canAccessRobots(user)).toBe(false)
      })

      it('should deny access for null user', () => {
        expect(accessControlUtils.canAccessRobots(null)).toBe(false)
      })
    })

    describe('getNoAccessMessage', () => {
      it('should return authentication message for null user', () => {
        const message = accessControlUtils.getNoAccessMessage(null)
        expect(message).toContain('não autenticado')
      })

      it('should return store configuration message for user without store', () => {
        const user = { access_level: 'user', empresa: 'test', loja: '' }
        const message = accessControlUtils.getNoAccessMessage(user)
        expect(message).toContain('configurar sua loja')
      })

      it('should return access denied message for other cases', () => {
        const user = { access_level: 'user', empresa: 'test', loja: 'store1' }
        const message = accessControlUtils.getNoAccessMessage(user)
        expect(message).toContain('Acesso negado')
      })
    })
  })

  describe('botService', () => {
    describe('getBotsByUserAccess', () => {
      it('should return empty array for null user', async () => {
        const result = await botService.getBotsByUserAccess(null)
        expect(result).toEqual([])
      })

      it('should call getBotsPorEmpresa for super admin', async () => {
        const user = { access_level: 'super_admin', empresa: 'test_company', loja: 'store1' }
        const spy = jest.spyOn(botService, 'getBotsPorEmpresa').mockResolvedValue([])
        
        await botService.getBotsByUserAccess(user)
        
        expect(spy).toHaveBeenCalledWith('test_company')
        spy.mockRestore()
      })

      it('should call getBotsPorEmpresaELoja for store user', async () => {
        const user = { access_level: 'user', empresa: 'test_company', loja: 'store1' }
        const spy = jest.spyOn(botService, 'getBotsPorEmpresaELoja').mockResolvedValue([])
        
        await botService.getBotsByUserAccess(user)
        
        expect(spy).toHaveBeenCalledWith('test_company', 'store1')
        spy.mockRestore()
      })

      it('should return empty array for user without store', async () => {
        const user = { access_level: 'user', empresa: 'test_company', loja: '' }
        
        const result = await botService.getBotsByUserAccess(user)
        
        expect(result).toEqual([])
      })
    })
  })
})