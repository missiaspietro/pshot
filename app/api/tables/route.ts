import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST() {
  try {
    // Criação da tabela de usuários
    const { error: usersError } = await supabaseServer.rpc('create_users_table');
    if (usersError) throw usersError;

    // Criação da tabela de pesquisas
    const { error: surveysError } = await supabaseServer.rpc('create_surveys_table');
    if (surveysError) throw surveysError;

    // Criação da tabela de respostas de pesquisas
    const { error: responsesError } = await supabaseServer.rpc('create_survey_responses_table');
    if (responsesError) throw responsesError;

    // Criação da tabela de promoções
    const { error: promotionsError } = await supabaseServer.rpc('create_promotions_table');
    if (promotionsError) throw promotionsError;

    // Criação da tabela de aniversariantes
    const { error: birthdaysError } = await supabaseServer.rpc('create_birthdays_table');
    if (birthdaysError) throw birthdaysError;

    // Criação da tabela de robôs
    const { error: robotsError } = await supabaseServer.rpc('create_robots_table');
    if (robotsError) throw robotsError;

    // Criação dos índices
    const { error: indexesError } = await supabaseServer.rpc('create_indexes');
    if (indexesError) throw indexesError;

    return NextResponse.json({ 
      success: true, 
      message: "Todas as tabelas foram criadas com sucesso!" 
    });

  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar tabelas' },
      { status: 500 }
    );
  }
}
