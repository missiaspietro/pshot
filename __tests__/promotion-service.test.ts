/**
 * Integration tests for promotion service with corrected network logic
 */

import { promotionService } from '../lib/promotion-service'
import { type UserData } from '../lib/network-utils'

// Mock dependencies
jest.mock('../lib/supabase-client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              Id: 'test-id',
              Titulo: 'Test Title',
              Msg: 'Test Description',
              Foto: 'test-image.jpg',
              Status: 'ATIVADA',
              Loja: '123',
              Criador: 'test@example.com',
              Data_Criacao: new Date().toISOString(),
              Data_Atualizacao: new Date().toISOString()
            },
            error: null
          }))
        }))
      }))
    }))
  }))
}))

jest.mock('../lib/shot-lojas', () => ({
  shotLojasService: {
    getLojasPorUsuario: jest.fn()
  }
}))

import { shotLojasService } from '../lib/shot-lojas'

describe('Promotion Service Integration Tests', () => {
  const mockShotLojasService = shotLojasService as jest.Mocked<typeof shotLojasService>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPromotions', () => {
    it('should use rede field with highest priority for filtering', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-principal',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback'
      }

      // Mock network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1', 'loja2'])

      const result = await promotionService.getPromotions(userData)

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('rede-principal')
      expect(result).toEqual([])
    })

    it('should use empresa as fallback when rede is not available', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback'
      }

      // Mock network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1'])

      const result = await promotionService.getPromotions(userData)

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('empresa-fallback')
      expect(result).toEqual([])
    })

    it('should use sub_rede as last resort', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        sub_rede: 'sub-rede-fallback'
      }

      // Mock network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1'])

      const result = await promotionService.getPromotions(userData)

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('sub-rede-fallback')
      expect(result).toEqual([])
    })

    it('should return empty array when no network can be resolved', async () => {
      const userData: UserData = {
        email: 'test@example.com'
      }

      const result = await promotionService.getPromotions(userData)

      expect(mockShotLojasService.getLojasPorUsuario).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('should return empty array when network validation fails', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-invalida'
      }

      // Mock network validation failure (no stores found)
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue([])

      const result = await promotionService.getPromotions(userData)

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('rede-invalida')
      expect(result).toEqual([])
    })

    it('should return empty array when user data is not provided', async () => {
      const result = await promotionService.getPromotions()

      expect(mockShotLojasService.getLojasPorUsuario).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('createPromotion', () => {
    const promotionParams = {
      title: 'Test Promotion',
      description: 'Test Description',
      image_url: 'test-image.jpg',
      is_active: true,
      store_id: 123
    }

    it('should use rede field with highest priority for creation', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-principal',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback',
        instancia: 'test-instance'
      }

      // Mock network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1', 'loja2'])

      const result = await promotionService.createPromotion(promotionParams, userData)

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('rede-principal')
      expect(result).toMatchObject({
        id: 'test-id',
        title: 'Test Title',
        description: 'Test Description',
        is_active: true,
        store_id: 123
      })
    })

    it('should use empresa as fallback when rede is not available', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback',
        instancia: 'test-instance'
      }

      // Mock network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1'])

      const result = await promotionService.createPromotion(promotionParams, userData)

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('empresa-fallback')
      expect(result).toBeDefined()
    })

    it('should throw error when no network can be resolved', async () => {
      const userData: UserData = {
        email: 'test@example.com'
      }

      await expect(promotionService.createPromotion(promotionParams, userData))
        .rejects.toThrow('Não foi possível determinar a rede do usuário para criar a promoção')

      expect(mockShotLojasService.getLojasPorUsuario).not.toHaveBeenCalled()
    })

    it('should throw error when network validation fails', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-invalida'
      }

      // Mock network validation failure
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue([])

      await expect(promotionService.createPromotion(promotionParams, userData))
        .rejects.toThrow('A rede "rede-invalida" não foi encontrada no sistema')

      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('rede-invalida')
    })

    it('should throw error when user data is not provided', async () => {
      await expect(promotionService.createPromotion(promotionParams))
        .rejects.toThrow('Dados do usuário não fornecidos para criar promoção')

      expect(mockShotLojasService.getLojasPorUsuario).not.toHaveBeenCalled()
    })
  })

  describe('Network consistency between operations', () => {
    it('should use the same network resolution logic for both getPromotions and createPromotion', async () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-consistente',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback'
      }

      const promotionParams = {
        title: 'Test Promotion',
        description: 'Test Description',
        image_url: 'test-image.jpg',
        is_active: true,
        store_id: 123
      }

      // Mock network validation
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1', 'loja2'])

      // Both operations should use the same network
      await promotionService.getPromotions(userData)
      await promotionService.createPromotion(promotionParams, userData)

      // Verify both calls used the same network (rede-consistente)
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledTimes(2)
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenNthCalledWith(1, 'rede-consistente')
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenNthCalledWith(2, 'rede-consistente')
    })
  })
})