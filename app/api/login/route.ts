import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    // Força limpeza de cache
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
    
    const { email, password } = await request.json()
    
    // Normaliza o email (remove espaços e converte para lowercase)
    const normalizedEmail = email?.trim()?.toLowerCase()
    
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    console.log('[LOGIN API] Tentativa de login para:', { email: normalizedEmail, password: '***' })

    // Primeiro, verifica se o usuário existe (com cache desabilitado)
    console.log('[LOGIN API] Consultando banco de dados para email:', normalizedEmail)
    const { data: userCheck, error: userCheckError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

    console.log('[LOGIN API] Resultado da consulta:', { 
      userFound: !!userCheck, 
      error: userCheckError,
      userEmail: userCheck?.email,
      userSistema: userCheck?.sistema
    })

    if (userCheckError || !userCheck) {
      console.log('[LOGIN API] Usuário não encontrado para email:', normalizedEmail)
      return NextResponse.json(
        { error: "Senha e/ou e-mail incorretos." },
        { status: 401 }
      )
    }

    console.log('[LOGIN API] Usuário encontrado:', {
      email: userCheck.email,
      sistema: userCheck.sistema,
      senhaCorreta: userCheck.senha === password
    })

    // Verifica se a senha está correta
    if (userCheck.senha !== password) {
      console.log('[LOGIN API] Senha incorreta')
      console.error('[LOGIN API] Tentativa de login com senha incorreta para:', normalizedEmail)
      return NextResponse.json(
        { error: "Senha e/ou e-mail incorretos." },
        { status: 401 }
      )
    }

    // Verifica se o sistema é 'Praise Shot' ou 'PraiseShot'
    if (userCheck.sistema !== 'Praise Shot' && userCheck.sistema !== 'PraiseShot') {
      console.log('[LOGIN API] Sistema incorreto:', userCheck.sistema)
      return NextResponse.json(
        { error: "Acesso não autorizado ao sistema PraiseShot" },
        { status: 401 }
      )
    }

    // GARANTIR QUE O LOGIN SEMPRE FUNCIONE QUANDO AS CREDENCIAIS ESTÃO CORRETAS
    // Se chegou até aqui, TODAS as validações passaram:
    // 1. Usuário existe no banco
    // 2. Senha está correta
    // 3. Sistema é 'Praise Shot'
    // PORTANTO, O LOGIN DEVE SER APROVADO SEM FALHAS
    const user = userCheck
    console.log('[LOGIN API] ✅ TODAS AS VALIDAÇÕES PASSARAM - Login APROVADO para usuário:', user.email)
    console.log('[LOGIN API] ✅ Credenciais válidas, sistema correto, login garantido')

    // Cria o objeto de resposta com todos os campos necessários
    const userResponse = {
      id: user.id,
      name: user.nome || '',
      email: user.email || '',
      access_level: user.nivel || 'user',
      empresa: user.empresa || '',
      rede: user.rede || null,
      loja: user.loja || null,
      whatsapp: user.whatsapp || '',
      instancia: user.instancia || null,
      sub_rede: user.subrede || null,
      permissions: {
        dashboard: user.tela_dashboard === 'sim',
        visitantes: user.tela_visitantes === 'sim',
        historico: user.tela_historico === 'sim',
        mensagens: user.tela_mensagens === 'sim',
        eventos: user.tela_eventos === 'sim',
        treinamento: user.tela_treinamento === 'sim',
        conexao: user.tela_conexao === 'sim',
        users: user.tela_users === 'sim',
      },
      // Permissões específicas do sistema PraiseShot
      telaShotPermissions: {
        telaShot_promocoes: user.telaShot_promocoes === 'sim',
        telaShot_relatorios: user.telaShot_relatorios === 'sim',
        telaShot_aniversarios: user.telaShot_aniversarios === 'sim',
        telaShot_pesquisas: user.telaShot_pesquisas === 'sim',
        telaShot_usuarios: user.telaShot_usuarios === 'sim',
        telaShot_bots: user.telaShot_bots === 'sim',
      }
    }
    
    console.log('[LOGIN API] Dados do usuário formatados:', userResponse)
    
    // GARANTIR RESPOSTA DE SUCESSO - Login deve sempre funcionar quando credenciais estão corretas
    console.log('[LOGIN API] ✅ Retornando dados do usuário - LOGIN GARANTIDO')
    
    // Força resposta de sucesso com status 200
    const response = new NextResponse(JSON.stringify(userResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Login-Success': 'true' // Header adicional para garantir sucesso
      }
    })
    
    console.log('[LOGIN API] ✅ Resposta de sucesso enviada - Status 200')
    return response
  } catch (error) {
    console.error('[LOGIN API] ❌ ERRO CRÍTICO no login:', error)
    console.error('[LOGIN API] ❌ Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    // Log detalhado do erro para debug
    console.error('[LOGIN API] ❌ Detalhes do erro:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      type: typeof error,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
