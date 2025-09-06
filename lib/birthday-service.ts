import { createClient } from './supabase-client'

// Interface para o tipo de mensagem de aniversário
export interface BirthdayMessage {
  id?: string;
  created_at?: string;
  mensagem: string;
  url_foto: string | null;
  loja: string;
  rede?: string;
  subRede?: string;
  bot?: string;
  criador?: string;
  status?: string | null;
}

// Interface para dados do usuário
export interface UserData {
  id: string;
  email: string;
  nome: string;
  empresa: string;
  rede: string;
  sub_rede: string;
  sistema: string;
}

export const birthdayService = {
  // Buscar mensagens de aniversário filtradas pela rede do usuário
  async getBirthdayMessages(user: UserData | null, userBankData?: any) {
    try {
      const supabase = createClient()
      
      console.log('Buscando mensagens de aniversário da rede do usuário...')
      
      // Se não houver usuário logado, retornar array vazio
      if (!user) {
        console.warn('Usuário não autenticado, retornando array vazio')
        return []
      }
      
      // Verificar se o usuário é Super Admin
      const isSuperAdmin = userBankData?.nivel === 'Super Admin'
      
      // Usar rede em vez de sub_rede
      const redeUsuario = userBankData?.rede || user.rede || user.empresa
      
      let query = supabase
        .from('msg_aniversarios')
        .select('*', { count: 'exact' })
        .eq('rede', redeUsuario)
      
      // Se não for Super Admin, filtrar também pela loja do usuário
      if (!isSuperAdmin && userBankData?.loja) {
        query = query.eq('loja', userBankData.loja)
        console.log('Usuário não é Super Admin, filtrando pela loja:', userBankData.loja)
      } else if (isSuperAdmin) {
        console.log('Usuário é Super Admin, mostrando todas as mensagens da rede:', redeUsuario)
      }
      
      const { data, error, count } = await query.order('created_at', { ascending: false })

      console.log('Resultado da busca:', { 
        data, 
        error, 
        count, 
        rede: redeUsuario, 
        loja: userBankData?.loja,
        isSuperAdmin 
      })

      if (error) {
        console.error('Erro ao buscar mensagens de aniversário:', error)
        throw new Error('Erro ao buscar mensagens de aniversário: ' + error.message)
      }

      const filterText = isSuperAdmin 
        ? `rede ${redeUsuario}` 
        : `rede ${redeUsuario} e loja ${userBankData?.loja}`
      console.log(`Encontradas ${data?.length || 0} mensagens de aniversário para ${filterText}`)
      return data || []
    } catch (error) {
      console.error('Erro ao buscar mensagens de aniversário:', error)
      throw error
    }
  },

  // Criar nova mensagem de aniversário
  async createBirthdayMessage(messageData: Pick<BirthdayMessage, 'mensagem' | 'url_foto' | 'loja' | 'status'>, user: UserData | null) {
    try {
      const supabase = createClient()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const newMessage = {
        ...messageData,
        rede: user.rede || user.empresa,
        subRede: user.sub_rede,
        bot: `${user.empresa}${messageData.loja}`, // Empresa + número da loja
        criador: user.email,
        status: (messageData.status ?? 'ATIVADO').toUpperCase()
      }

      const { data, error } = await supabase
        .from('msg_aniversarios')
        .insert([newMessage])
        .select()

      if (error) {
        throw new Error('Erro ao criar mensagem de aniversário: ' + error.message)
      }

      return data?.[0]
    } catch (error) {
      console.error('Erro ao criar mensagem de aniversário:', error)
      throw error
    }
  },

  // Atualizar mensagem de aniversário existente
  async updateBirthdayMessage(id: string, updates: Partial<BirthdayMessage>) {
    try {
      const supabase = createClient()
      
      // Garantir que url_foto seja null quando estiver vazia
      const cleanUpdates = {
        ...updates,
        url_foto: updates.url_foto || null
      };
      
      const { data, error } = await supabase
        .from('msg_aniversarios')
        .update(cleanUpdates)
        .eq('id', id)
        .select()

      if (error) {
        throw new Error('Erro ao atualizar mensagem de aniversário: ' + error.message)
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Erro ao atualizar mensagem de aniversário:', error)
      throw error
    }
  },

  // Deletar mensagem de aniversário e a imagem associada
  async deleteBirthdayMessage(id: string, imageUrl?: string | null) {
    try {
      const supabase = createClient()
      
      // Primeiro deleta o registro do banco de dados
      const { error: deleteError } = await supabase
        .from('msg_aniversarios')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw new Error('Erro ao deletar mensagem de aniversário: ' + deleteError.message)
      }

      // Se houver uma URL de imagem, tenta deletar do bucket
      if (imageUrl) {
        try {
          // Extrai o nome do arquivo da URL
          const fileName = imageUrl.split('/').pop()
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('praiseshot')
              .remove([`birthdays/${fileName}`])
            
            if (storageError) {
              console.warn('A mensagem foi excluída, mas houve um erro ao remover a imagem:', storageError.message)
            }
          }
        } catch (storageError) {
          console.warn('Erro ao tentar excluir a imagem do storage:', storageError)
          // Não lança o erro para não interromper o fluxo principal
        }
      }

      return true
    } catch (error) {
      console.error('Erro ao deletar mensagem de aniversário:', error)
      throw error
    }
  },

  // Buscar mensagens de aniversário por loja
  async getBirthdayMessagesByStore(loja: string) {
    try {
      const supabase = createClient()
      
      console.log(`Buscando mensagens de aniversário para a loja: ${loja}`)
      
      const { data, error, count } = await supabase
        .from('msg_aniversarios')
        .select('*', { count: 'exact' })
        .eq('loja', loja)
        .order('created_at', { ascending: false })

      console.log(`Resultado da busca para a loja ${loja}:`, { data, error, count })

      if (error) {
        console.error('Erro ao buscar mensagens de aniversário:', error)
        throw new Error('Erro ao buscar mensagens de aniversário: ' + error.message)
      }

      console.log(`Encontradas ${data?.length || 0} mensagens para a loja ${loja}`)
      return data || []
    } catch (error) {
      console.error('Erro ao buscar mensagens de aniversário por loja:', error)
      throw error
    }
  }
}
