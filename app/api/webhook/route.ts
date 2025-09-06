import { NextRequest, NextResponse } from 'next/server'
import { secureLog } from '@/lib/security-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Webhook API chamada');
    
    // Obter configurações diretamente das variáveis de ambiente
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL
    
    console.log('🔗 Webhook URL configurada:', webhookUrl ? 'SIM' : 'NÃO');
    
    if (!webhookUrl) {
      console.error('❌ URL do webhook não configurada');
      secureLog('URL do webhook não configurada')
      return NextResponse.json(
        { error: 'Configuração do webhook incompleta', message: 'NEXT_PUBLIC_WEBHOOK_URL não definida' },
        { status: 500 }
      )
    }
    
    const body = await request.json()
    console.log('📋 Body da requisição:', body);
    
    secureLog('Enviando requisição para webhook')
    console.log('📤 Enviando para:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    console.log('📥 Status da resposta do webhook:', response.status);
    console.log('📥 Status text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta do webhook:', errorText);
      secureLog('Erro na requisição para webhook:', { status: response.status, error: errorText })
      return NextResponse.json(
        { error: 'Erro ao enviar webhook', message: errorText, status: response.status },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('✅ Resposta do webhook:', data);
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('💥 Erro interno na API de webhook:', error);
    secureLog('Erro interno na API de webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}