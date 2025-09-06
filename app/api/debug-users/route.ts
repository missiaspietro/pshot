import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    console.log('[DEBUG] Consultando todos os usuários na tabela users...')
    
    // Busca todos os usuários para verificar a estrutura
    const { data: allUsers, error } = await supabaseServer
      .from('users')
      .select('email, sistema, nome')
      .limit(10)

    console.log('[DEBUG] Resultado da consulta:', { allUsers, error })

    if (error) {
      console.error('[DEBUG] Erro na consulta:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      users: allUsers,
      count: allUsers?.length || 0,
      message: 'Consulta realizada com sucesso'
    })
  } catch (error) {
    console.error('[DEBUG] Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error 
    }, { status: 500 })
  }
}
