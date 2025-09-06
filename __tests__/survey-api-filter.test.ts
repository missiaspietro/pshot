import { POST } from '@/app/api/reports/survey/route'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 1,
                email: 'test@example.com',
                nome: 'Test User',
                empresa: 'Test Company',
                rede: 'Test Network'
              },
              error: null
            }))
          }))
        }))
      }))
    }))
  }))
}))

describe('Survey API with Response Filter', () => {
  const mockRequestData = {
    selectedFields: ['nome', 'telefone', 'resposta'],
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
      headers: {
        get: (name: string) => {
          if (name === 'cookie') {
            return 'ps_session=test@example.com_session'
          }
          return null
        }
      }
    } as NextRequest
  }

  test('filters by response value 1 (ótimas)', async () => {
    const requestBody = {
      ...mockRequestData,
      responseFilter: '1'
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.responseFilter).toBe('1')
    expect(data.filtered).toBe(true)
  })

  test('filters by response value 2 (boas)', async () => {
    const requestBody = {
      ...mockRequestData,
      responseFilter: '2'
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.responseFilter).toBe('2')
    expect(data.filtered).toBe(true)
  })

  test('filters by response value 3 (regulares)', async () => {
    const requestBody = {
      ...mockRequestData,
      responseFilter: '3'
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.responseFilter).toBe('3')
    expect(data.filtered).toBe(true)
  })

  test('filters by response value 4 (péssimas)', async () => {
    const requestBody = {
      ...mockRequestData,
      responseFilter: '4'
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.responseFilter).toBe('4')
    expect(data.filtered).toBe(true)
  })

  test('returns all when filter is empty', async () => {
    const requestBody = {
      ...mockRequestData,
      responseFilter: ''
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.responseFilter).toBe('')
    expect(data.filtered).toBe(false)
  })

  test('returns all when filter is not provided', async () => {
    const request = createMockRequest(mockRequestData)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.filtered).toBe(false)
  })

  test('handles invalid filter values', async () => {
    const requestBody = {
      ...mockRequestData,
      responseFilter: '5' // Invalid value
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    // Invalid filter should be ignored
    expect(data.filtered).toBe(false)
  })

  test('validates required fields', async () => {
    const requestBody = {
      responseFilter: '1'
      // Missing selectedFields
    }

    const request = createMockRequest(requestBody)
    const response = await POST(request)
    
    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('obrigatórios')
  })

  test('handles authentication errors', async () => {
    const request = {
      json: async () => mockRequestData,
      headers: {
        get: () => null // No session cookie
      }
    } as NextRequest

    const response = await POST(request)
    
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data.error).toContain('autenticado')
  })
})