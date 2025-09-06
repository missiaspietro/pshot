import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('Iniciando busca dos dados do usuário...')
    
    // Obtém a sessão atual
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()
    
    if (sessionError) {
      console.error('Erro ao buscar sessão:', sessionError)
      return NextResponse.json(
        { error: 'Erro ao verificar autenticação' },
        { status: 500 }
      )
    }
    
    if (!session) {
      console.log('Nenhuma sessão ativa encontrada')
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    console.log('Sessão encontrada para o usuário:', session.user?.email)
    
    // Usa o cliente supabaseServer com a sessão atual
    const supabase = supabaseServer

    // Busca os dados do usuário na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Retorna os dados do usuário (sem a senha)
    const { senha, ...userWithoutPassword } = user
    
    return NextResponse.json({
      id: user.id,
      name: user.nome,
      email: user.email,
      empresa: user.empresa,
      whatsapp: user.whatsapp,
      access_level: user.nivel || 'user',
      permissions: {
        dashboard: user.tela_dashboard === 'sim',
        visitantes: user.tela_visitantes === 'sim',
        historico: user.tela_historico === 'sim',
        mensagens: user.tela_mensagens === 'sim',
        eventos: user.tela_eventos === 'sim',
        treinamento: user.tela_treinamento === 'sim',
        conexao: user.tela_conexao === 'sim',
        users: user.tela_users === 'sim',
      }
    })

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
