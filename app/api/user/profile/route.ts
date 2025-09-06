import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📥 API de perfil do usuário chamada')
    
    // Verificar se há cookie de sessão
    const cookies = request.headers.get('cookie') || ''
    const sessionMatch = cookies.match(/ps_session=([^;]+)/)
    
    if (!sessionMatch) {
      console.error('❌ Nenhuma sessão encontrada')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const sessionValue = sessionMatch[1]
    const email = sessionValue.split('_')[0] // Extrair email da sessão
    
    console.log('👤 Email da sessão:', email)

    // Buscar dados completos do usuário na tabela users
    console.log('🔍 Buscando dados do usuário na tabela users...')
    console.log('📧 Email para busca:', email)
    console.log('🏢 Sistema para busca: Praise Shot')
    
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, nome, empresa, rede, subrede, sistema')
      .eq('email', email)
      .eq('sistema', 'Praise Shot')
      .single()
      
    console.log('📊 Resultado da consulta:', { userData, userError })

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado com sistema "Praise Shot"')
      console.log('🔍 Tentando buscar sem filtro de sistema...')
      
      // Tentar buscar sem filtro de sistema
      const { data: userDataAlt, error: userErrorAlt } = await supabase
        .from('users')
        .select('id, email, nome, empresa, rede, subrede, sistema')
        .eq('email', email)
        .single()
        
      console.log('📊 Resultado alternativo:', { userDataAlt, userErrorAlt })
      
      if (userErrorAlt || !userDataAlt) {
        console.error('❌ Usuário não encontrado na tabela users:', userErrorAlt?.message)
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
      
      // Usar dados alternativos se encontrados
      userData = userDataAlt
    }

    console.log('✅ Usuário encontrado:', {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      empresa: userData.empresa,
      rede: userData.rede,
      subrede: userData.subrede
    })

    // Retornar dados do usuário
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      empresa: userData.empresa,
      rede: userData.rede,
      sub_rede: userData.subrede, // Mapear subrede para sub_rede para manter compatibilidade
      sistema: userData.sistema
    })

  } catch (error) {
    console.error('💥 Erro na API de perfil do usuário:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    return NextResponse.json(
      { 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}