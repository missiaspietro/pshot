import { getDisplaySubnet, getSubnetDisplayState, formatSubnetDisplay, UserData } from '@/lib/subnet-utils';

describe('subnet-utils', () => {
  const mockUser: UserData = {
    id: '1',
    email: 'test@example.com',
    nome: 'Test User',
    empresa: 'Test Company',
    rede: 'Test Network',
    sub_rede: 'Test Subnet',
    sistema: 'Praise Shot'
  };

  describe('getDisplaySubnet', () => {
    it('should return sub_rede when available', () => {
      expect(getDisplaySubnet(mockUser)).toBe('Test Subnet');
    });

    it('should fallback to empresa when sub_rede is empty', () => {
      const userWithoutSubnet = { ...mockUser, sub_rede: '' };
      expect(getDisplaySubnet(userWithoutSubnet)).toBe('Test Company');
    });

    it('should fallback to empresa when sub_rede is null', () => {
      const userWithoutSubnet = { ...mockUser, sub_rede: null as any };
      expect(getDisplaySubnet(userWithoutSubnet)).toBe('Test Company');
    });

    it('should return "Não definida" when both sub_rede and empresa are empty', () => {
      const userWithoutData = { ...mockUser, sub_rede: '', empresa: '' };
      expect(getDisplaySubnet(userWithoutData)).toBe('Não definida');
    });

    it('should return "Não definida" when user is null', () => {
      expect(getDisplaySubnet(null)).toBe('Não definida');
    });
  });

  describe('getSubnetDisplayState', () => {
    it('should return error state when error is provided', () => {
      const result = getSubnetDisplayState(false, mockUser, 'Network error');
      expect(result).toEqual({ type: 'error', message: 'Network error' });
    });

    it('should return loading state when isLoading is true', () => {
      const result = getSubnetDisplayState(true, null, null);
      expect(result).toEqual({ type: 'loading' });
    });

    it('should return not-authenticated state when user is null and not loading', () => {
      const result = getSubnetDisplayState(false, null, null);
      expect(result).toEqual({ type: 'not-authenticated' });
    });

    it('should return success state with subnet when user is available', () => {
      const result = getSubnetDisplayState(false, mockUser, null);
      expect(result).toEqual({ type: 'success', subnet: 'Test Subnet' });
    });
  });

  describe('formatSubnetDisplay', () => {
    it('should format loading state', () => {
      expect(formatSubnetDisplay({ type: 'loading' })).toBe('Carregando...');
    });

    it('should format error state', () => {
      expect(formatSubnetDisplay({ type: 'error', message: 'Test error' })).toBe('Erro ao carregar');
    });

    it('should format not-authenticated state', () => {
      expect(formatSubnetDisplay({ type: 'not-authenticated' })).toBe('Não autenticado');
    });

    it('should format success state', () => {
      expect(formatSubnetDisplay({ type: 'success', subnet: 'Test Subnet' })).toBe('Test Subnet');
    });

    it('should handle unknown state gracefully', () => {
      expect(formatSubnetDisplay({} as any)).toBe('Não definida');
    });
  });
});