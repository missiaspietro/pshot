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
    const apiUrl = new URL(`${supabaseUrl}/rest/v1/shot_lojas`)
    
    // Copiar todos os parâmetros de consulta
    searchParams.forEach((value, key) => {
      apiUrl.searchParams.append(key, value)
    })
    
    secureLog('Fazendo requisição para shot_lojas:', { url: apiUrl.toString() })
    
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      secureLog('Erro na requisição para shot_lojas:', { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText
      })
      return NextResponse.json(
        { error: 'Erro ao buscar dados das lojas', details: errorText },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    secureLog('Erro interno na API de shot_lojas:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}