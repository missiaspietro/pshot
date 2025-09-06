import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database-service';

export async function GET() {
  try {
    const requiredTables = ['users', 'surveys', 'survey_responses', 'promotions', 'birthdays', 'robots'];
    const status: Record<string, boolean> = {};
    
    // Verifica cada tabela necessária
    for (const table of requiredTables) {
      status[table] = await DatabaseService.tableExists(table);
    }

    const allTablesExist = Object.values(status).every(exists => exists);
    
    return NextResponse.json({
      success: true,
      initialized: allTablesExist,
      tables: status,
    });
  } catch (error) {
    console.error('Erro ao verificar status do banco de dados:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao verificar status do banco de dados',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
