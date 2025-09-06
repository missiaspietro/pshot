// Serviço para gerenciar promoções no Supabase
import { createClient } from './supabase-client'
import { Promotion } from './types'
import { resolveUserNetwork, validateNetworkExists, handleNetworkResolutionFailure, type UserData } from './network-utils'
import { shotLojasService } from './shot-lojas'

// Gera uma sequência numérica aleatória semelhante ao exemplo fornecido
const generateRandomIdPromo = (length = 30) => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString()
  }
  return result
}

export const promotionService = {
  // Busca promoções do usuário logado (recebe dados do usuário como parâmetro)
  async getPromotions(userData?: UserData) {
    const supabase = createClient()
    
    if (!userData?.email) {
      console.warn('⚠️ Dados do usuário não fornecidos para buscar promoções')
      return []
    }

    console.log('👤 Buscando promoções para o usuário:', userData.email)

    // Usar a função utilitária para resolver a rede com prioridade correta
    const userRede = resolveUserNetwork(userData)
    console.log('🔍 Rede resolvida do usuário:', userRede)

    if (!userRede) {
      handleNetworkResolutionFailure(userData, (message) => {
        console.warn('⚠️ [PROMOTIONS-GET]', message)
      })
      return []
    }

    // Validar se a rede existe na tabela shot_lojas
    const isNetworkValid = await validateNetworkExists(userRede, shotLojasService)
    if (!isNetworkValid) {
      console.warn('⚠️ [PROMOTIONS-GET] Rede não encontrada na tabela shot_lojas:', userRede)
      return []
    }

    // FILTRAR DIRETAMENTE PELA REDE DO USUÁRIO NO BANCO DE DADOS
    let query = supabase.from('promocoes').select('*').eq('Rede', userRede)
    console.log('✅ Filtro aplicado: Rede =', userRede)

    const { data, error } = await query.order('Data_Criacao', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar promoções:', error)
      throw error
    }

    console.log('📊 Resultado da busca:')
    console.log('   Total de promoções encontradas:', data?.length || 0)
    console.log('   Filtro aplicado: Rede =', userRede)
    
    if (data && data.length > 0) {
      console.log('   Primeira promoção (exemplo):', {
        Id: data[0].Id,
        Titulo: data[0].Titulo,
        Rede: data[0].Rede,
        Sub_Rede: data[0].Sub_Rede
      })
    }

    // Mapeia os campos do banco para o formato usado no front-end
    return (data || []).map((row: any): Promotion => ({
      id: row.Id,
      title: row.Titulo,
      description: row.Msg,
      image_url: row.Foto,
      is_active: row.Status === 'ATIVADA' || row.Status === 'ATIVA',
      store_id: Number(row.Loja) || 0,
      created_by: row.Criador || '',
      created_at: row.Data_Criacao || new Date().toISOString(),
      updated_at: row.Data_Atualizacao || new Date().toISOString(),
    }))
  },

  // Cria uma nova promoção (recebe dados do usuário como parâmetro)
  async createPromotion(params: {
    title: string
    description: string
    image_url: string
    is_active: boolean
    store_id: number | string
  }, userData?: UserData) {
    const supabase = createClient()
    
    if (!userData?.email) {
      throw new Error('Dados do usuário não fornecidos para criar promoção')
    }
    
    // Usar a função utilitária para resolver a rede com prioridade correta
    const resolvedNetwork = resolveUserNetwork(userData)
    
    if (!resolvedNetwork) {
      const fallbackNetwork = handleNetworkResolutionFailure(userData)
      if (!fallbackNetwork) {
        throw new Error('Não foi possível determinar a rede do usuário para criar a promoção')
      }
    }

    // Validar se a rede existe na tabela shot_lojas
    const isNetworkValid = await validateNetworkExists(resolvedNetwork, shotLojasService)
    if (!isNetworkValid) {
      throw new Error(`A rede "${resolvedNetwork}" não foi encontrada no sistema. Verifique suas permissões.`)
    }
    
    const insertPayload = {
      Rede: resolvedNetwork, // Usar rede resolvida corretamente
      Loja: params.store_id?.toString(),
      Sub_Rede: userData.sub_rede || null, // Manter sub_rede como campo separado
      Titulo: params.title,
      Msg: params.description,
      Status: params.is_active ? 'ATIVADA' : 'DESATIVADA',
      Criador: userData.email,
      Bot: `${userData.instancia || ''}${params.store_id}`.replace(/__+/g, '_'),
      Foto: params.image_url,
      id_promo: generateRandomIdPromo(),
    }

    console.log('📝 [PROMOTION-SERVICE] Criando promoção com payload:', {
      Rede: insertPayload.Rede,
      Sub_Rede: insertPayload.Sub_Rede,
      Loja: insertPayload.Loja,
      Titulo: insertPayload.Titulo
    })

    const { data, error } = await supabase
      .from('promocoes')
      .insert([insertPayload])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar promoção:', error)
      throw error
    }

    return {
      id: data.Id,
      title: data.Titulo,
      description: data.Msg,
      image_url: data.Foto,
      is_active: data.Status === 'ATIVADA' || data.Status === 'ATIVA',
      store_id: Number(data.Loja) || 0,
      created_by: data.Criador || '',
      created_at: data.Data_Criacao || new Date().toISOString(),
      updated_at: data.Data_Atualizacao || new Date().toISOString(),
    } as Promotion
  },

  // Atualiza o status (ativa/desativa)
  async updateStatus(id: string, isActive: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('promocoes')
      .update({ Status: isActive ? 'ATIVADA' : 'DESATIVADA' })
      .eq('Id', id)
    if (error) {
      console.error('Erro ao atualizar status da promoção:', error)
      throw error
    }
  },

  // Exclui promoção (e a imagem associada no Storage)
  async deletePromotion(id: string) {
    const supabase = createClient()

    try {
      // Primeiro, buscamos a promoção para obter a URL da imagem
      const { data: promo, error: fetchError } = await supabase
        .from('promocoes')
        .select('*')
        .eq('Id', id)
        .single()

      console.log('Dados da promoção encontrada:', promo);

      if (fetchError) {
        console.error('Erro ao buscar promoção para exclusão:', fetchError)
        throw fetchError
      }

      // Remove a imagem do bucket (se existir)
      if (promo?.Foto) {
        try {
          let filePath = promo.Foto;
          console.log('URL original da imagem:', filePath);
          
          // Extrai o nome do arquivo da URL
          let fileName = '';
          
          // Tenta extrair o nome do arquivo de diferentes formatos de URL
          // Formato 1: https://[supabase-url]/storage/v1/object/public/praiseshot/promotions/filename.ext
          const fullUrlMatch = filePath.match(/storage\/v1\/object\/public\/praiseshot\/(.+)/);
          if (fullUrlMatch && fullUrlMatch[1]) {
            fileName = fullUrlMatch[1];
          } 
          // Formato 2: /storage/v1/object/public/praiseshot/promotions/filename.ext
          else if (filePath.startsWith('/storage/')) {
            const parts = filePath.split('object/public/praiseshot/');
            if (parts.length > 1) {
              fileName = parts[1];
            }
          }
          // Formato 3: https://[supabase-url]/storage/v1/object/sign/praiseshot/...
          else if (filePath.includes('object/sign/')) {
            const parts = filePath.split('praiseshot/');
            if (parts.length > 1) {
              fileName = parts[1].split('?token=')[0]; // Remove o token da URL
            }
          }
          // Se já estiver no formato correto: promocoes-1/filename.ext ou promotions/filename.ext (compatibilidade)
          else if (filePath.startsWith('promocoes-1/')) {
            fileName = filePath;
          }
          else if (filePath.startsWith('promotions/')) {
            // Para compatibilidade com arquivos antigos
            fileName = filePath;
          }
          
          console.log('Caminho do arquivo extraído:', fileName);
          
          // Remove a imagem do storage
          if (fileName) {
            console.log('Tentando remover arquivo:', fileName);
            
            // Primeiro, tenta remover usando o caminho completo
            const { data, error: storageError } = await supabase.storage
              .from('praiseshot')
              .remove([fileName]);
              
            if (storageError) {
              console.error('Erro ao remover imagem do Storage (tentativa 1):', storageError);
              
              // Se falhar, tenta remover apenas o nome do arquivo
              const fileNameOnly = fileName.split('/').pop();
              if (fileNameOnly) {
                console.log('Tentando remover apenas o nome do arquivo:', fileNameOnly);
                const { data: data2, error: storageError2 } = await supabase.storage
                  .from('praiseshot')
                  .remove([`promocoes-1/${fileNameOnly}`]);
                  
                if (storageError2) {
                  console.error('Erro ao remover imagem do Storage (tentativa 2):', storageError2);
                } else {
                  console.log('Imagem removida com sucesso (tentativa 2):', fileNameOnly);
                }
              }
            } else {
              console.log('Resultado da remoção:', data);
              console.log('Imagem removida com sucesso do storage:', fileName);
            }
          } else {
            console.warn('Não foi possível extrair o caminho do arquivo da URL:', filePath);
          }
        } catch (err) {
          console.error('Erro ao tentar remover imagem do Storage:', err);
        }
      } else {
        console.log('Nenhuma imagem encontrada para remover');
      }

      // Por fim, remove o registro da promoção
      console.log('Removendo registro da promoção do banco de dados...');
      const { error: deleteError } = await supabase
        .from('promocoes')
        .delete()
        .eq('Id', id);

      if (deleteError) {
        console.error('Erro ao excluir promoção:', deleteError);
        throw deleteError;
      }
      
      console.log('Promoção excluída com sucesso');
      return { success: true };
      
    } catch (error) {
      console.error('Erro ao excluir promoção:', error);
      throw error;
    }
  },
}
