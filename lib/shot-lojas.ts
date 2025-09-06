import { createClient } from './supabase-client';

interface Bot {
    id: string;
    nome: string;
    url_base?: string;
    token?: string;
    status?: string;
    rede?: string;
    sub_rede?: string;
    loja: string;
    qrcode?: string;
    numero?: string;
    perfil?: string;
    texto_niver0dias?: string;
    Parceiro?: string;
    looping?: number;
    atualizada?: boolean;
    texto_niver1dias?: string;
    texto_niver15dias?: string;
}

export const shotLojasService = {
    // Buscar bots filtrados pela empresa (rede) do usuário
    async getBotsPorEmpresa(empresa: string): Promise<Bot[]> {
        try {
            const supabase = createClient();

            console.log('Buscando bots para empresa:', empresa);

            let query = supabase
                .from('bots')
                .select('*');

            // Filtrar por empresa (usando campo rede da tabela bots)
            if (empresa) {
                query = query.eq('rede', empresa);
            }

            // Executar a query com ordenação
            const { data, error } = await query.order('nome', { ascending: true });

            if (error) {
                console.error('Erro ao buscar bots:', error);
                throw new Error('Erro ao buscar bots: ' + error.message);
            }

            console.log('Bots encontrados para empresa:', empresa, data);

            return data || [];
        } catch (error) {
            console.error('Erro ao buscar bots:', error);
            throw error;
        }
    },

    // Buscar lojas da tabela shot_lojas filtradas pela rede do usuário
    async getLojasPorUsuario(rede: string): Promise<string[]> {
        try {
            const supabase = createClient();

            console.log('[SHOT-LOJAS SERVICE] Iniciando busca de lojas da tabela shot_lojas para rede:', rede);

            // Iniciar a query com filtros obrigatórios
            let query = supabase
                .from('shot_lojas')
                .select('nome_loja, rede')
                .not('nome_loja', 'is', null); // Garantir que o nome_loja não seja nulo

            // Filtrar por rede (usando campo rede da tabela shot_lojas)
            if (rede) {
                query = query.eq('rede', rede);
            }

            // Executar a query com ordenação
            const { data, error } = await query.order('nome_loja', { ascending: true });

            if (error) {
                console.error('Erro ao buscar lojas da tabela shot_lojas:', error);
                throw new Error('Erro ao buscar lojas: ' + error.message);
            }

            console.log('[SHOT-LOJAS SERVICE] Dados filtrados da tabela shot_lojas:', data);
            console.log('[SHOT-LOJAS SERVICE] Filtros aplicados - rede:', rede);

            // Extrair valores únicos de lojas e ordenar
            const lojasMapeadas = data.map((item: { nome_loja: string }) => {
                return item.nome_loja?.trim();
            });

            const lojasFiltradas = lojasMapeadas.filter(Boolean);
            const lojasUnicas = Array.from(new Set(lojasFiltradas)).sort();

            console.log('[SHOT-LOJAS SERVICE] Lojas únicas encontradas na tabela shot_lojas:', lojasUnicas);

            return lojasUnicas as string[];
        } catch (error) {
            console.error('Erro ao buscar lojas da tabela shot_lojas:', error);
            throw error;
        }
    },

    // Método atualizado para buscar da tabela shot_lojas
    async getLojas(rede?: string): Promise<string[]> {
        try {
            const supabase = createClient();

            console.log('Buscando lojas da tabela shot_lojas para rede:', rede);

            let query = supabase
                .from('shot_lojas')
                .select('nome_loja, rede')
                .not('nome_loja', 'is', null);

            // Filtrar por rede se fornecida
            if (rede) {
                query = query.eq('rede', rede);
            }

            const { data, error } = await query.order('nome_loja', { ascending: true });

            if (error) {
                console.error('Erro ao buscar lojas da tabela shot_lojas:', error);
                throw new Error('Erro ao buscar lojas: ' + error.message);
            }

            console.log('Dados da tabela shot_lojas:', data);

            const lojasMapeadas = data.map((item: { nome_loja: string }) => item.nome_loja?.trim());
            const lojasFiltradas = lojasMapeadas.filter(Boolean);
            const lojasUnicas = Array.from(new Set(lojasFiltradas)).sort();

            console.log('Lojas únicas encontradas:', lojasUnicas);

            return lojasUnicas as string[];
        } catch (error) {
            console.error('Erro ao buscar lojas da tabela shot_lojas:', error);
            throw error;
        }
    },

    // Buscar bots por loja (opcional, pode ser útil no futuro)
    async getBotsPorLoja(loja: string): Promise<Bot[]> {
        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('bots')
                .select('*')
                .eq('loja', loja);

            if (error) {
                throw new Error('Erro ao buscar bots: ' + error.message);
            }

            return data || [];
        } catch (error) {
            console.error('Erro ao buscar bots:', error);
            throw error;
        }
    }
};