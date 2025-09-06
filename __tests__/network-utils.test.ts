/**
 * Unit tests for network resolution utilities
 */

import { 
  resolveUserNetwork, 
  getNetworkResolutionInfo, 
  validateNetworkExists,
  handleNetworkResolutionFailure,
  type UserData 
} from '../lib/network-utils'

describe('Network Resolution Utilities', () => {
  describe('resolveUserNetwork', () => {
    it('should prioritize rede over empresa and sub_rede', () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-principal',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback'
      }

      const result = resolveUserNetwork(userData)
      expect(result).toBe('rede-principal')
    })

    it('should use empresa as fallback when rede is not available', () => {
      const userData: UserData = {
        email: 'test@example.com',
        empresa: 'empresa-fallback',
        sub_rede: 'sub-rede-fallback'
      }

      const result = resolveUserNetwork(userData)
      expect(result).toBe('empresa-fallback')
    })

    it('should use sub_rede as last resort when rede and empresa are not available', () => {
      const userData: UserData = {
        email: 'test@example.com',
        sub_rede: 'sub-rede-fallback'
      }

      const result = resolveUserNetwork(userData)
      expect(result).toBe('sub-rede-fallback')
    })

    it('should return null when no network fields are available', () => {
      const userData: UserData = {
        email: 'test@example.com'
      }

      const result = resolveUserNetwork(userData)
      expect(result).toBeNull()
    })

    it('should return null when userData is undefined', () => {
      const result = resolveUserNetwork(undefined)
      expect(result).toBeNull()
    })

    it('should handle empty string values correctly', () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: '',
        empresa: 'empresa-fallback',
        sub_rede: ''
      }

      const result = resolveUserNetwork(userData)
      expect(result).toBe('empresa-fallback')
    })

    it('should handle null values correctly', () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: undefined,
        empresa: undefined,
        sub_rede: 'sub-rede-fallback'
      }

      const result = resolveUserNetwork(userData)
      expect(result).toBe('sub-rede-fallback')
    })
  })

  describe('getNetworkResolutionInfo', () => {
    it('should return correct resolution info when rede is available', () => {
      const userData: UserData = {
        email: 'test@example.com',
        rede: 'rede-principal',
        empresa: 'empresa-fallback'
      }

      const result = getNetworkResolutionInfo(userData)
      
      expect(result.resolvedNetwork).toBe('rede-principal')
      expect(result.source).toBe('rede')
      expect(result.available.rede).toBe(true)
      expect(result.available.empresa).toBe(true)
      expect(result.available.sub_rede).toBe(false)
    })

    it('should return correct resolution info when only empresa is available', () => {
      const userData: UserData = {
        email: 'test@example.com',
        empresa: 'empresa-fallback'
      }

      const result = getNetworkResolutionInfo(userData)
      
      expect(result.resolvedNetwork).toBe('empresa-fallback')
      expect(result.source).toBe('empresa')
      expect(result.available.rede).toBe(false)
      expect(result.available.empresa).toBe(true)
      expect(result.available.sub_rede).toBe(false)
    })

    it('should return null values when no userData is provided', () => {
      const result = getNetworkResolutionInfo(undefined)
      
      expect(result.resolvedNetwork).toBeNull()
      expect(result.source).toBeNull()
      expect(result.available.rede).toBe(false)
      expect(result.available.empresa).toBe(false)
      expect(result.available.sub_rede).toBe(false)
    })
  })

  describe('validateNetworkExists', () => {
    const mockShotLojasService = {
      getLojasPorUsuario: jest.fn()
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should return true when network has stores', async () => {
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue(['loja1', 'loja2'])

      const result = await validateNetworkExists('rede-valida', mockShotLojasService)
      
      expect(result).toBe(true)
      expect(mockShotLojasService.getLojasPorUsuario).toHaveBeenCalledWith('rede-valida')
    })

    it('should return false when network has no stores', async () => {
      mockShotLojasService.getLojasPorUsuario.mockResolvedValue([])

      const result = await validateNetworkExists('rede-sem-lojas', mockShotLojasService)
      
      expect(result).toBe(false)
    })

    it('should return false when network is null', async () => {
      const result = await validateNetworkExists(null, mockShotLojasService)
      
      expect(result).toBe(false)
      expect(mockShotLojasService.getLojasPorUsuario).not.toHaveBeenCalled()
    })

    it('should return false when service throws error', async () => {
      mockShotLojasService.getLojasPorUsuario.mockRejectedValue(new Error('Service error'))

      const result = await validateNetworkExists('rede-com-erro', mockShotLojasService)
      
      expect(result).toBe(false)
    })
  })

  describe('handleNetworkResolutionFailure', () => {
    it('should call error callback with appropriate message when no network fields exist', () => {
      const mockErrorCallback = jest.fn()
      const userData: UserData = {
        email: 'test@example.com'
      }

      const result = handleNetworkResolutionFailure(userData, mockErrorCallback)
      
      expect(result).toBeNull()
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'Usuário não possui nenhum campo de rede definido (rede, empresa, sub_rede)'
      )
    })

    it('should call error callback with generic message when some fields exist but resolution failed', () => {
      const mockErrorCallback = jest.fn()
      const userData: UserData = {
        email: 'test@example.com',
        rede: '', // Empty string should cause resolution to fail
        empresa: 'empresa-test'
      }

      const result = handleNetworkResolutionFailure(userData, mockErrorCallback)
      
      expect(result).toBeNull()
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'Não foi possível determinar a rede do usuário. Verifique suas permissões.'
      )
    })

    it('should work without error callback', () => {
      const userData: UserData = {
        email: 'test@example.com'
      }

      const result = handleNetworkResolutionFailure(userData)
      
      expect(result).toBeNull()
    })
  })
})