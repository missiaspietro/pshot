/**
 * @jest-environment jsdom
 */

import { getPesquisasEnviadasCount, getPromocoesCount, getDashboardCounters } from '@/lib/dashboard-counters-service';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard Counters Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPesquisasEnviadasCount', () => {
    it('should return count from content-range header', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-9/25')
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getPesquisasEnviadasCount('TestCompany');

      expect(result).toBe(25);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pesquisas_enviadas'),
        expect.objectContaining({
          method: 'HEAD',
          headers: expect.objectContaining({
            'Prefer': 'count=planned'
          })
        })
      );
    });

    it('should return 0 when empresa is empty', async () => {
      const result = await getPesquisasEnviadasCount('');
      expect(result).toBe(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return 0 when empresa is null/undefined', async () => {
      const result1 = await getPesquisasEnviadasCount(null as any);
      const result2 = await getPesquisasEnviadasCount(undefined as any);
      
      expect(result1).toBe(0);
      expect(result2).toBe(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return 0 when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getPesquisasEnviadasCount('TestCompany');

      expect(result).toBe(0);
    });

    it('should return 0 when content-range header is missing', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getPesquisasEnviadasCount('TestCompany');

      expect(result).toBe(0);
    });

    it('should return 0 when fetch throws an error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getPesquisasEnviadasCount('TestCompany');

      expect(result).toBe(0);
    });

    it('should filter by rede parameter', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-4/5')
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await getPesquisasEnviadasCount('MyCompany');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('rede=eq.MyCompany'),
        expect.any(Object)
      );
    });
  });

  describe('getPromocoesCount', () => {
    it('should return count from content-range header', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-14/15')
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getPromocoesCount('TestCompany');

      expect(result).toBe(15);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('promocoes'),
        expect.objectContaining({
          method: 'HEAD',
          headers: expect.objectContaining({
            'Prefer': 'count=planned'
          })
        })
      );
    });

    it('should return 0 when empresa is empty', async () => {
      const result = await getPromocoesCount('');
      expect(result).toBe(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return 0 when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getPromocoesCount('TestCompany');

      expect(result).toBe(0);
    });

    it('should return 0 when content-range header is missing', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getPromocoesCount('TestCompany');

      expect(result).toBe(0);
    });

    it('should return 0 when fetch throws an error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getPromocoesCount('TestCompany');

      expect(result).toBe(0);
    });

    it('should filter by Rede parameter (capital R)', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-9/10')
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await getPromocoesCount('MyCompany');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('Rede=eq.MyCompany'),
        expect.any(Object)
      );
    });
  });

  describe('getDashboardCounters', () => {
    it('should return both counters in parallel', async () => {
      const mockResponse1 = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-24/25')
        }
      };

      const mockResponse2 = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-9/10')
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse1) // pesquisas
        .mockResolvedValueOnce(mockResponse2); // promocoes

      const result = await getDashboardCounters('TestCompany');

      expect(result).toEqual({
        pesquisas: 25,
        promocoes: 10
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return zeros when empresa is empty', async () => {
      const result = await getDashboardCounters('');

      expect(result).toEqual({
        pesquisas: 0,
        promocoes: 0
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return zeros when there are errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getDashboardCounters('TestCompany');

      expect(result).toEqual({
        pesquisas: 0,
        promocoes: 0
      });
    });

    it('should handle partial failures gracefully', async () => {
      const mockResponse1 = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-24/25')
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse1) // pesquisas success
        .mockRejectedValueOnce(new Error('Promocoes error')); // promocoes error

      const result = await getDashboardCounters('TestCompany');

      expect(result).toEqual({
        pesquisas: 25,
        promocoes: 0
      });
    });
  });

  describe('Content-Range parsing', () => {
    it('should parse different content-range formats', async () => {
      const testCases = [
        { header: '0-9/10', expected: 10 },
        { header: '*/25', expected: 25 },
        { header: '0-0/1', expected: 1 },
        { header: '0-99/100', expected: 100 },
        { header: 'invalid', expected: 0 },
        { header: '0-9/', expected: 0 },
        { header: '/10', expected: 10 }
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          ok: true,
          headers: {
            get: jest.fn().mockReturnValue(testCase.header)
          }
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await getPesquisasEnviadasCount('TestCompany');
        expect(result).toBe(testCase.expected);
      }
    });
  });
});