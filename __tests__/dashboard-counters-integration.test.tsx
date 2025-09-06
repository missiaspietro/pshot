/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { useAuth } from '@/contexts/auth-context';

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn()
}));

// Mock the dashboard counters service
jest.mock('@/lib/dashboard-counters-service', () => ({
  getPesquisasEnviadasCount: jest.fn(),
  getPromocoesCount: jest.fn(),
  getDashboardCounters: jest.fn()
}));

// Mock other services to avoid side effects
jest.mock('@/lib/birthday-report-service', () => ({
  getBirthdayReportByStore: jest.fn().mockResolvedValue([]),
  getDetailedBirthdayReportByStore: jest.fn().mockResolvedValue([])
}));

jest.mock('@/lib/cashback-service', () => ({
  getCashbackData: jest.fn().mockResolvedValue([])
}));

jest.mock('@/lib/respostas-pesquisas-service', () => ({
  getRespostasPesquisasByStore: jest.fn().mockResolvedValue([]),
  getRespostasPesquisasStats: jest.fn().mockResolvedValue({ totalRespostas: 0 })
}));

jest.mock('@/lib/dashboard-optimizations', () => ({
  clearAllCache: jest.fn()
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Dashboard Counters Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful responses for other API calls
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('clientes_decorfabril')) {
        return Promise.resolve({
          ok: true,
          headers: {
            get: jest.fn().mockReturnValue('0-99/100')
          }
        });
      }
      if (url.includes('bots')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { status: 'conectado', rede: 'TestCompany' },
            { status: 'desconectado', rede: 'TestCompany' }
          ])
        });
      }
      return Promise.resolve({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('0-0/0')
        }
      });
    });
  });

  it('should display correct pesquisas count when user is authenticated', async () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: { empresa: 'TestCompany', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    // Mock counter service responses
    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    getPesquisasEnviadasCount.mockResolvedValue(25);
    getPromocoesCount.mockResolvedValue(10);

    render(<DashboardPage />);

    // Wait for the counters to load
    await waitFor(() => {
      expect(getPesquisasEnviadasCount).toHaveBeenCalledWith('TestCompany');
      expect(getPromocoesCount).toHaveBeenCalledWith('TestCompany');
    });

    // Check if the card title is correct
    expect(screen.getByText('Pesquisas')).toBeInTheDocument();
    
    // Wait for the values to be displayed
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should display zero counts when user has no empresa', async () => {
    // Mock user without empresa
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    getPesquisasEnviadasCount.mockResolvedValue(0);
    getPromocoesCount.mockResolvedValue(0);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(getPesquisasEnviadasCount).toHaveBeenCalledWith('');
      expect(getPromocoesCount).toHaveBeenCalledWith('');
    });

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('should display zero counts when user is not authenticated', async () => {
    // Mock unauthenticated user
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');

    render(<DashboardPage />);

    // Services should not be called when user is not authenticated
    expect(getPesquisasEnviadasCount).not.toHaveBeenCalled();
    expect(getPromocoesCount).not.toHaveBeenCalled();
  });

  it('should handle loading states correctly', async () => {
    // Mock loading user
    mockUseAuth.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      loading: true
    });

    render(<DashboardPage />);

    // Should not make API calls while loading
    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    expect(getPesquisasEnviadasCount).not.toHaveBeenCalled();
    expect(getPromocoesCount).not.toHaveBeenCalled();
  });

  it('should handle service errors gracefully', async () => {
    mockUseAuth.mockReturnValue({
      user: { empresa: 'TestCompany', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    // Mock service errors
    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    getPesquisasEnviadasCount.mockRejectedValue(new Error('Service error'));
    getPromocoesCount.mockRejectedValue(new Error('Service error'));

    render(<DashboardPage />);

    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Pesquisas')).toBeInTheDocument();
    });
  });

  it('should update counters when user changes', async () => {
    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    
    // Initial user
    mockUseAuth.mockReturnValue({
      user: { empresa: 'Company1', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    getPesquisasEnviadasCount.mockResolvedValue(15);
    getPromocoesCount.mockResolvedValue(5);

    const { rerender } = render(<DashboardPage />);

    await waitFor(() => {
      expect(getPesquisasEnviadasCount).toHaveBeenCalledWith('Company1');
      expect(getPromocoesCount).toHaveBeenCalledWith('Company1');
    });

    // Change user
    mockUseAuth.mockReturnValue({
      user: { empresa: 'Company2', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    getPesquisasEnviadasCount.mockResolvedValue(30);
    getPromocoesCount.mockResolvedValue(20);

    rerender(<DashboardPage />);

    await waitFor(() => {
      expect(getPesquisasEnviadasCount).toHaveBeenCalledWith('Company2');
      expect(getPromocoesCount).toHaveBeenCalledWith('Company2');
    });
  });

  it('should display correct card titles', async () => {
    mockUseAuth.mockReturnValue({
      user: { empresa: 'TestCompany', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    getPesquisasEnviadasCount.mockResolvedValue(0);
    getPromocoesCount.mockResolvedValue(0);

    render(<DashboardPage />);

    // Check that the card title was changed from "Relatório de Pesquisas" to "Pesquisas"
    expect(screen.getByText('Pesquisas')).toBeInTheDocument();
    expect(screen.queryByText('Relatório de Pesquisas')).not.toBeInTheDocument();
    
    // Check that Promoções card is still there
    expect(screen.getByText('Promoções')).toBeInTheDocument();
  });

  it('should call counters in parallel for better performance', async () => {
    mockUseAuth.mockReturnValue({
      user: { empresa: 'TestCompany', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    });

    const { getPesquisasEnviadasCount, getPromocoesCount } = require('@/lib/dashboard-counters-service');
    
    // Add delays to simulate network calls
    getPesquisasEnviadasCount.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(25), 100))
    );
    getPromocoesCount.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(10), 100))
    );

    const startTime = Date.now();
    
    render(<DashboardPage />);

    await waitFor(() => {
      expect(getPesquisasEnviadasCount).toHaveBeenCalled();
      expect(getPromocoesCount).toHaveBeenCalled();
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete in roughly 100ms (parallel) rather than 200ms (sequential)
    expect(duration).toBeLessThan(150);
  });
});