import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica o token de autenticação do cabeçalho
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token de autenticação não fornecido" },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { data, error } = await supabaseServer
      .from("perguntas_pesquisas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Erro ao buscar pesquisa:", error);
      return NextResponse.json(
        { error: "Pesquisa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: "Método não implementado" },
    { status: 501 }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o ID é válido
    if (!params.id) {
      return NextResponse.json(
        { error: "ID da pesquisa não fornecido" },
        { status: 400 }
      );
    }

    // Excluir a pesquisa do banco de dados
    const { error } = await supabaseServer
      .from("perguntas_pesquisas")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Erro ao excluir pesquisa:", error);
      return NextResponse.json(
        { error: "Erro ao excluir pesquisa" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar requisição de exclusão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
