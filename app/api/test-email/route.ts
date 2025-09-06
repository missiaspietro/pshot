import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const normalizedEmail = email?.trim()?.toLowerCase()
    
    console.log('[TEST] Testando email:', normalizedEmail)
    
    // Testa a conexão com o Supabase
    const { data: testConnection, error: connectionError } = await supabaseServer
      .from('users')
      .select('count(*)')
      .limit(1)
    
    console.log('[TEST] Teste de conexão:', { testConnection, connectionError })
    
    // Busca o usuário específico
    const { data: userCheck, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()
    
    console.log('[TEST] Busca do usuário:', { userCheck, userError })
    
    // Busca todos os emails para comparação
    const { data: allEmails, error: emailsError } = await supabaseServer
      .from('users')
      .select('email, sistema')
      .limit(20)
    
    console.log('[TEST] Todos os emails:', { allEmails, emailsError })
    
    return NextResponse.json({
      searchEmail: normalizedEmail,
      userFound: !!userCheck,
      userData: userCheck,
      userError: userError,
      connectionTest: { testConnection, connectionError },
      allEmails: allEmails,
      emailsError: emailsError
    })
    
  } catch (error) {
    console.error('[TEST] Erro:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
}
