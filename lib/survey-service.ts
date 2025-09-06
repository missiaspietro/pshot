import { SurveyQuestion } from './types'
import { createClient } from './supabase-client'

// Função auxiliar para obter o usuário do localStorage
const getUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ps_user')
    const user = saved ? JSON.parse(saved) : null
    console.log('Usuário do localStorage:', user)
    return user
  }
  return null
}

export const surveyService = {
  // Buscar todas as pesquisas do usuário logado
  async getSurveys(userRede: string, userSubRede: string) {
    try {
      const supabase = createClient()
      
      // Obter usuário do localStorage
      const localUser = getUserFromLocalStorage()
      
      // Usar valores padrão ou do localStorage
      const empresa = localUser?.empresa || 'empresa_padrao'
      const subRede = localUser?.sub_rede
      
      // Buscar pesquisas sem ordenação
      const { data, error } = await supabase
        .from('perguntas_pesquisas')
        .select('*')
      
      if (error) {
        throw new Error('Erro ao buscar pesquisas: ' + error.message)
      }
      
      // Ordenar manualmente pelo ID se existir, assumindo que IDs maiores são mais recentes
      const sortedData = data ? [...data].sort((a, b) => {
        // Se ambos têm ID, ordenar por ID decrescente
        if (a.id && b.id) return b.id - a.id;
        // Se apenas um tem ID, priorizar o que tem ID
        if (a.id) return -1;
        if (b.id) return 1;
        // Se nenhum tem ID, manter a ordem original
        return 0;
      }) : [];
      
      return sortedData;
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      throw error;
    }
  },

  // Criar nova pergunta de pesquisa
  async createSurvey(questionData: Omit<SurveyQuestion, 'id' | 'rede' | 'sub_rede' | 'question' | 'options' | 'step'> & { 
    pergunta: string;
    opcoes: string; // String com as opções separadas por ponto e vírgula
    passo: number; // Aceitando 'passo' em português
    status: string;
    loja: string;
    bot: string;
    sala: string;
    empresa?: string; // Campo opcional para a empresa do usuário
    rede?: string; // Campo opcional para a rede do usuário
    sub_rede?: string; // Campo opcional para a sub_rede do usuário
  }) {
    try {
      const supabase = createClient()
      
            // Obter usuário do localStorage para usar empresa e sub_rede
      const localUser = getUserFromLocalStorage()
      
      // Usar valores do usuário logado, parâmetros da função ou valores padrão como fallback
      const empresa = questionData.empresa || localUser?.empresa || 'empresa_padrao'
      const rede = questionData.rede || localUser?.rede || empresa // Usar rede enviada, ou do localStorage, ou empresa como fallback
      const subRede = questionData.sub_rede || localUser?.sub_rede || '' // Usar sub_rede enviada, ou do localStorage, ou vazio como fallback
      
      // Usar o valor de bot recebido da chamada (já contém instância + loja)
      const botName = questionData.bot
      console.log('Nome do bot:', botName)
      
      // Formatar a pergunta com opções
      const perguntaCompleta = `${questionData.pergunta} (${questionData.opcoes})`
      
      const { data, error } = await supabase
        .from('perguntas_pesquisas')
        .insert([
          {
            pergunta: perguntaCompleta,
            passo: questionData.passo,
            status: questionData.status || 'ATIVADA',
            loja: questionData.loja,
            bot: botName,
            sala: questionData.sala || '',
            rede: rede,
            sub_rede: subRede
          }
        ])
        .select()
      
      if (error) {
        throw new Error('Erro ao criar pesquisa: ' + error.message)
      }
      
      return data?.[0]
    } catch (error) {
      console.error('Erro ao criar pesquisa:', error);
      throw error;
    }
  },

  // Atualizar pergunta existente
  async updateSurvey(data: { id: string | number } & Partial<SurveyQuestion>) {
    try {
      console.log('Atualizando pesquisa com ID:', data.id);
      const supabase = createClient();
      
      // Preparar os dados para atualização
      const updateData: any = {
        pergunta: data.pergunta,
        passo: data.passo || data.step,
        loja: data.loja,
        status: data.status || 'ATIVADA',
        bot: data.bot,
        sala: data.sala || ''
      };
      
      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      console.log('Dados para atualização:', updateData);
      
      const { data: updatedData, error } = await supabase
        .from('perguntas_pesquisas')
        .update(updateData)
        .eq('Id', data.id)
        .select();
      
      if (error) {
        console.error('Erro ao atualizar pesquisa no Supabase:', error);
        return false;
      }
      
      console.log('Pesquisa atualizada com sucesso:', updatedData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pesquisa:', error);
      return false;
    }
  },

  // Deletar pergunta
  async deleteSurvey(id: any) {
    const startTime = performance.now();
    const operationId = Math.random().toString(36).substring(2, 8);
    
    try {
      console.log(`🔄 [${operationId}] Iniciando processo de exclusão`);
      console.log(`📋 [${operationId}] Dados recebidos:`, { id, type: typeof id });
      
      // Verifica se o ID é válido
      if (id === undefined || id === null || id === '') {
        console.error(`❌ [${operationId}] ID inválido para exclusão:`, id);
        return false;
      }
      
      // Converte para string e remove espaços em branco
      const idStr = String(id).trim();
      console.log(`🔢 [${operationId}] ID após formatação: "${idStr}"`);
      
      if (!idStr) {
        console.error(`❌ [${operationId}] ID vazio após conversão`);
        return false;
      }
      
      const supabase = createClient();
      console.log(`🔌 [${operationId}] Cliente Supabase inicializado`);
      
      // Verifica se a pesquisa existe
      console.log(`🔍 [${operationId}] Verificando existência da pesquisa no banco de dados...`);
      
      const { data: existingSurvey, error: fetchError, count } = await supabase
        .from('perguntas_pesquisas')
        .select('Id, pergunta, loja, rede, sub_rede, status', { count: 'exact' })
        .eq('Id', idStr);
      
      console.log(`📊 [${operationId}] Resultado da busca:`, { 
        encontrouRegistros: !!existingSurvey?.length,
        totalRegistros: count,
        dados: existingSurvey,
        erro: fetchError
      });
      
      if (fetchError || !existingSurvey || existingSurvey.length === 0) {
        console.error(`❌ [${operationId}] Pesquisa não encontrada`, { 
          idFornecido: idStr, 
          erro: fetchError 
        });
        return false;
      }
      
      const pesquisa = existingSurvey[0];
      const dbId = pesquisa.Id;
      
      console.log(`📝 [${operationId}] Dados da pesquisa encontrada:`, {
        id: dbId,
        pergunta: pesquisa.pergunta,
        loja: pesquisa.loja,
        rede: pesquisa.rede,
        sub_rede: pesquisa.sub_rede,
        status: pesquisa.status
      });
      
      if (!dbId) {
        console.error(`❌ [${operationId}] ID da pesquisa não encontrado no banco de dados`);
        return false;
      }
      
      console.log(`✅ [${operationId}] Pesquisa validada, iniciando exclusão...`);
      
      // Exclui a pesquisa usando o ID correto
      console.log(`🗑️ [${operationId}] Enviando comando de exclusão para o Supabase...`);
      
      const { error: deleteError, count: deletedCount } = await supabase
        .from('perguntas_pesquisas')
        .delete({ count: 'exact' })
        .eq('Id', dbId);
      
      console.log(`📤 [${operationId}] Resposta do Supabase:`, { 
        erro: deleteError, 
        registrosAfetados: deletedCount 
      });
      
      if (deleteError) {
        console.error(`❌ [${operationId}] Erro ao excluir pesquisa:`, {
          mensagem: deleteError.message,
          codigo: deleteError.code,
          detalhes: deleteError.details,
          hint: deleteError.hint
        });
        return false;
      }
      
      const endTime = performance.now();
      console.log(`✅ [${operationId}] Exclusão concluída com sucesso em ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`📋 [${operationId}] Resumo:`, {
        operacao: 'exclusao_pesquisa',
        status: 'sucesso',
        idPesquisa: dbId,
        duracao: `${(endTime - startTime).toFixed(2)}ms`,
        registrosAfetados: deletedCount,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      const errorTime = performance.now();
      console.error(`❌ [${operationId || 'ERROR'}] Falha na exclusão após ${(errorTime - startTime).toFixed(2)}ms:`, {
        erro: error instanceof Error ? {
          nome: error.name,
          mensagem: error.message,
          stack: error.stack
        } : error,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }
}
