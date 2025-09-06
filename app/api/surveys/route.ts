import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: Request) {
  console.log("[GET /api/surveys] - Iniciando requisição");
  try {
    // Obtém o token de autenticação do cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=')
      acc[name] = value
      return acc
    }, {})

    const token = cookies['sb-access-token']

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação não encontrado" },
        { status: 401 }
      )
    }

    // Configura o cliente Supabase com o token
    const supabase = supabaseServer
    
    // Obtém o usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Obtém os dados adicionais do usuário
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (profileError || !userData) {
      return NextResponse.json(
        { error: "Dados do usuário não encontrados" },
        { status: 404 }
      )
    }

    // Busca as pesquisas filtradas pela empresa do usuário
    const { data: surveys, error } = await supabaseServer
      .from("perguntas_pesquisas")
      .select("*")
      .eq("rede", userData.empresa)
      .eq("sub_rede", userData.sub_rede || userData.empresa)
      .order("passo", { ascending: true });

    if (error) {
      console.error("Erro ao buscar pesquisas:", error);
      return NextResponse.json(
        { error: "Erro ao buscar pesquisas" },
        { status: 500 }
      );
    }

    console.log(`[GET /api/surveys] - ${surveys?.length || 0} pesquisas encontradas`);
    return NextResponse.json(surveys || []);
  } catch (error) {
    console.error("[API /surveys] - Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("[POST /api/surveys] - Iniciando criação de pesquisa");
  try {
    // Obtém o token de autenticação do cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=')
      acc[name] = value
      return acc
    }, {})

    const token = cookies['sb-access-token']

    if (!token) {
      return NextResponse.json(
        { error: "Token de autenticação não encontrado" },
        { status: 401 }
      )
    }

    // Configura o cliente Supabase com o token
    const supabase = supabaseServer
    
    // Obtém o usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Obtém os dados adicionais do usuário
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (profileError || !userData) {
      return NextResponse.json(
        { error: "Dados do usuário não encontrados" },
        { status: 404 }
      )
    }

    // Obtém os dados da requisição
    const body = await request.json();
    
    // Insere a nova pesquisa
    const { data, error } = await supabaseServer
      .from("perguntas_pesquisas")
      .insert([
        {
          pergunta: body.pergunta,
          opcoes: body.opcoes,
          passo: body.passo,
          status: body.status || "ATIVADA",
          loja: body.loja,
          bot: body.bot || "bot_pesquisa",
          sala: body.sala || "",
          rede: userData.empresa,
          sub_rede: userData.sub_rede || userData.empresa
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao criar pesquisa:", error);
      return NextResponse.json(
        { error: "Erro ao criar pesquisa" },
        { status: 500 }
      );
    }

    console.log("[POST /api/surveys] - Pesquisa criada com sucesso:", data);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[API /surveys] - Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
