import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-service';

export async function POST() {
  try {
    // Verificar se as tabelas principais existem
    const requiredTables = ['users', 'surveys', 'survey_responses', 'promotions', 'birthdays'];
    const results: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      results[table] = await DatabaseService.tableExists(table);
    }

    const allTablesExist = Object.values(results).every(exists => exists);

    return NextResponse.json({
      success: true,
      message: allTablesExist ? 'Database initialized successfully' : 'Some tables are missing',
      initialized: allTablesExist,
      tables: results
    });
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
