import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    console.log('[USER-DATA API] Buscando dados para email:', email)

    // Buscar dados do usuário no banco com todas as colunas de permissões
    const { data: userData, error } = await supabaseServer
      .from('users')
      .select('*') // Seleciona todas as colunas, incluindo as permissões
      .eq('email', email.trim().toLowerCase())
      .single()

    if (error || !userData) {
      console.error('[USER-DATA API] Erro ao buscar usuário:', error)
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    console.log('[USER-DATA API] Dados encontrados:', userData)
    
    // Retornar todos os dados do usuário, incluindo as permissões
    return NextResponse.json(userData)
  } catch (error) {
    console.error('[USER-DATA API] Erro interno:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
