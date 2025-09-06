/**
 * End-to-end tests to verify network consistency across the promotion system
 */

import { resolveUserNetwork, validateNetworkExists, type UserData } from '../lib/network-utils'
import { promotionService } from '../lib/promotion-service'
import { shotLojasService } from '../lib/shot-lojas'

// Mock Supabase client for controlled testing
jest.mock('../lib/supabase-client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      if (table === 'promocoes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [
                  {
                    Id: 'test-promo-1',
                    Titulo: 'Test Promotion',
                    Msg: 'Test Description',
                    Foto: 'test.jpg',
                    Status: 'ATIVADA',
                    Loja: '123',
                    Rede: 'test-network',
                    Sub_Rede: 'test-subnet',
                    Criador: 'test@example.com',
                    Data_Criacao: new Date().toISOString(),
                    Data_Atualizacao: new Date().toISOString()
                  }
                ],
                error: null
              }))
            }))
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  Id: 'new-promo-id',
                  Titulo: 'New Promotion',
                  Msg: 'New Description',
                  Foto: 'new.jpg',
                  Status: 'ATIVADA',
                  Loja: '456',
                  Rede: 'test-network',
                  Sub_Rede: 'test-subnet',
                  Criador: 'test@example.com',
                  Data_Criacao: new Date().toISOString(),
                  Data_Atualizacao: new Date().toISOString()
                },
                error: null
              }))
            }))
          }))
        }
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }
    }))
  }))
}))

// Mock shot-lojas service
jest.mock('../lib/shot-lojas', () => ({
  shotLojasService: {
    getLojasPorUsuario: jest.fn()
  }
}))

describe('Network Consistency End-to-End Tests', () => {
  const mockShotLojasService = shotLojasService as jest.Mocked<typeof shotLojasService>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete promotion workflow consistency', () => {
    it('should use consistent network resolution throughout the entire flow', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'consistent-network',
        empresa: 'fallback-empresa',
        sub_rede: 'fallback-subnet'
      }

      // Mock stores for network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['store1', 'store2', 'store3'])

      // Step 1: Verify network resolution
      const resolvedNetwork = resolveUserNetwork(userData)
      expect(resolvedNetwork).toBe('consistent-network')

      // Step 2: Validate network exists (simulates store loading)
      const isNetworkValid = await validateNetworkExists(resolvedNetwork, mockShotLojasService)
      expect(isNetworkValid).toBe(true)
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('consistent-network')

      // Step 3: Load promotions (should use same network)
      const promotions = await promotionService.getPromotions(userData)
      expect(promotions).toBeDefined()
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('consistent-network')

      // Step 4: Create promotion (should use same network)
      const newPromotion = await promotionService.createPromotion({
        title: 'Test Promotion',
        description: 'Test Description',
        image_url: 'test.jpg',
        is_active: true,
        store_id: 123
      }, userData)

      expect(newPromotion).toBeDefined()
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('consistent-network')

      // Verify all calls used the same network
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledTimes(3)
      mockShotLojasService.getLojasPorUsuario.mock.calls.forEach(call => {
        expect(call[0]).toBe('consistent-network')
      })
    })

    it('should handle fallback network consistently across operations', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        empresa: 'fallback-empresa', // No rede field, should use empresa
        sub_rede: 'fallback-subnet'
      }

      // Mock stores for network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['store1'])

      // All operations should use 'fallback-empresa'
      const resolvedNetwork = resolveUserNetwork(userData)
      expect(resolvedNetwork).toBe('fallback-empresa')

      await validateNetworkExists(resolvedNetwork, mockShotLojasService)
      await promotionService.getPromotions(userData)
      await promotionService.createPromotion({
        title: 'Test Promotion',
        description: 'Test Description',
        image_url: 'test.jpg',
        is_active: true,
        store_id: 123
      }, userData)

      // Verify all calls used the fallback network
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledTimes(3)
      mockShotLojasService.getLojasPorUsuario.mock.calls.forEach(call => {
        expect(call[0]).toBe('fallback-empresa')
      })
    })

    it('should fail consistently when no valid network is available', async () => {
      const userData: UserData = {
        email: 'test@example.com'
        // No network fields
      }

      // Network resolution should fail
      const resolvedNetwork = resolveUserNetwork(userData)
      expect(resolvedNetwork).toBeNull()

      // Validation should fail
      const isNetworkValid = await validateNetworkExists(resolvedNetwork, mockShotLojasService)
      expect(isNetworkValid).toBe(false)

      // Get promotions should return empty array
      const promotions = await promotionService.getPromotions(userData)
      expect(promotions).toEqual([])

      // Create promotion should throw error
      await expect(promotionService.createPromotion({
        title: 'Test Promotion',
        description: 'Test Description',
        image_url: 'test.jpg',
        is_active: true,
        store_id: 123
      }, userData)).rejects.toThrow()

      // No network validation calls should have been made
      expect(mockShotLojasService.getLojasPorUsuario).not.toHaveBeenCalled()
    })
  })

  describe('Backward compatibility verification', () => {
    it('should handle existing data with different network field combinations', async () => {
      const testCases = [
        {
          name: 'User with only rede',
          userData: { email: 'test1@example.com', rede: 'network1' },
          expectedNetwork: 'network1'
        },
        {
          name: 'User with only empresa',
          userData: { email: 'test2@example.com', empresa: 'network2' },
          expectedNetwork: 'network2'
        },
        {
          name: 'User with only sub_rede',
          userData: { email: 'test3@example.com', sub_rede: 'network3' },
          expectedNetwork: 'network3'
        },
        {
          name: 'User with all fields (should prioritize rede)',
          userData: { 
            email: 'test4@example.com', 
            rede: 'primary', 
            empresa: 'secondary', 
            sub_rede: 'tertiary' 
          },
          expectedNetwork: 'primary'
        }
      ]

      for (const testCase of testCases) {
        // Mock stores for each network
        mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['store1'])

        const resolvedNetwork = resolveUserNetwork(testCase.userData as UserData)
        expect(resolvedNetwork).toBe(testCase.expectedNetwork)

        // Verify operations work with resolved network
        const promotions = await promotionService.getPromotions(testCase.userData as UserData)
        expect(promotions).toBeDefined()

        // Reset mock for next iteration
        jest.clearAllMocks()
      }
    })
  })

  describe('Error handling consistency', () => {
    it('should handle network validation failures consistently', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'invalid-network'
      }

      // Mock network validation failure (no stores)
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue([])

      // Get promotions should return empty array
      const promotions = await promotionService.getPromotions(userData)
      expect(promotions).toEqual([])

      // Create promotion should throw specific error
      await expect(promotionService.createPromotion({
        title: 'Test Promotion',
        description: 'Test Description',
        image_url: 'test.jpg',
        is_active: true,
        store_id: 123
      }, userData)).rejects.toThrow('A rede "invalid-network" não foi encontrada no sistema')

      // Both operations should have attempted validation
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledTimes(2)
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('invalid-network')
    })
  })
})