import { NextRequest, NextResponse } from 'next/server'
import { secureLog } from '@/lib/security-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Obter configurações diretamente das variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceKey) {
      secureLog('Variáveis de ambiente não configuradas:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!serviceKey 
      })
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500 }
      )
    }
    
    // Construir URL do Supabase
    const apiUrl = new URL(`${supabaseUrl}/rest/v1/bots`)
    
    // Copiar todos os parâmetros de consulta
    searchParams.forEach((value, key) => {
      apiUrl.searchParams.append(key, value)
    })
    
    secureLog('Fazendo requisição para bots:', { url: apiUrl.toString() })
    
    const response = await fetch(apiUrl.toString(), {
      method: request.method,
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Range-Unit': 'items',
        'Prefer': 'count=planned'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      secureLog('Erro na requisição para bots:', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText
      })
      return NextResponse.json(
        { error: 'Erro ao buscar dados dos bots', details: errorText },
        { status: response.status }
      )
    }
    
    // Para requisições HEAD, retornar apenas os headers
    if (request.method === 'HEAD') {
      const headers = new Headers()
      const contentRange = response.headers.get('content-range')
      if (contentRange) {
        headers.set('content-range', contentRange)
      }
      return new NextResponse(null, { headers })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    secureLog('Erro interno na API de bots:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request: NextRequest) {
  return GET(request)
}