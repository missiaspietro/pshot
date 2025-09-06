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

// Interface para opções de busca de bots
interface BotServiceOptions {
  empresa: string;
  loja?: string;
  isSuperAdmin: boolean;
}

// Interface para usuário (simplificada para o que precisamos)
interface User {
  access_level: string;
  empresa?: string;
  loja?: string;
}


// Utilitários para controle de acesso
export const accessControlUtils = {
  // Verificar se usuário é Super Admin
  isSuperAdmin(user: User | null): boolean {
    if (!user) {
      console.log('🔍 [ACCESS-CONTROL] Usuário null - não é Super Admin');
      return false;
    }
    
    const accessLevel = user.access_level;
    // Verificar se é super admin (case insensitive) - aceita tanto "Super Admin" quanto "super_admin"
    const normalizedLevel = accessLevel?.toLowerCase().replace(/\s+/g, '_');
    const isSuperAdmin = normalizedLevel === 'super_admin';
    
    console.log('🔍 [ACCESS-CONTROL] Verificando Super Admin:', {
      access_level: accessLevel,
      normalizedLevel: normalizedLevel,
      isSuperAdmin: isSuperAdmin,
      comparison: `"${normalizedLevel}" === "super_admin" = ${normalizedLevel === 'super_admin'}`
    });
    
    return isSuperAdmin;
  },

  // Validar se usuário tem loja definida
  hasStoreAssigned(user: User | null): boolean {
    if (!user) return false;
    return Boolean(user.loja && user.loja.trim() !== '');
  },

  // Determinar tipo de acesso do usuário
  getUserAccessType(user: User | null): 'super_admin' | 'store_user' | 'no_access' {
    if (!user) return 'no_access';
    
    if (this.isSuperAdmin(user)) {
      return 'super_admin';
    }
    
    if (this.hasStoreAssigned(user)) {
      return 'store_user';
    }
    return 'no_access';
  },

  // Validar se usuário pode acessar robôs
  canAccessRobots(user: User | null): boolean {
    const accessType = this.getUserAccessType(user);
    return accessType === 'super_admin' || accessType === 'store_user';
  },

  // Obter mensagem apropriada para usuários sem acesso
  getNoAccessMessage(user: User | null): string {
    if (!user) {
      return 'Usuário não autenticado. Faça login para continuar.';
    }
    
    if (!this.hasStoreAssigned(user)) {
      return 'Nenhum robô encontrado. Entre em contato com o administrador para configurar sua loja.';
    }
    
    return 'Acesso negado. Entre em contato com o administrador.';
  }
};

export const botService = {
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

  // Novo método: Buscar bots filtrados por empresa e loja
  async getBotsPorEmpresaELoja(empresa: string, loja: string): Promise<Bot[]> {
    try {
      const supabase = createClient();

      console.log('Buscando bots para empresa:', empresa, 'e loja:', loja);

      let query = supabase
        .from('bots')
        .select('*');

      // Filtrar por empresa e loja
      if (empresa) {
        query = query.eq('rede', empresa);
      }
      if (loja) {
        query = query.eq('loja', loja);
      }

      // Executar a query com ordenação
      const { data, error } = await query.order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao buscar bots por empresa e loja:', error);
        throw new Error('Erro ao buscar bots: ' + error.message);
      }

      console.log('Bots encontrados para empresa:', empresa, 'e loja:', loja, data);

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar bots por empresa e loja:', error);
      throw error;
    }
  },

  // Método utilitário: Determinar se usuário é Super Admin
  isSuperAdmin(user: User | null): boolean {
    return accessControlUtils.isSuperAdmin(user);
  },

  // Método utilitário: Buscar bots baseado no nível de acesso do usuário
  async getBotsByUserAccess(user: User | null): Promise<Bot[]> {
    try {
      if (!user) {
        console.log('Usuário não fornecido, retornando lista vazia');
        return [];
      }

      const empresa = user.empresa || '';
      const loja = user.loja;
      const accessType = accessControlUtils.getUserAccessType(user);

      console.log('🔍 [BOT-SERVICE] Tipo de acesso:', accessType, '| Empresa:', empresa, '| Loja:', loja);

      switch (accessType) {
        case 'super_admin':
          console.log('🔑 Super Admin - buscando todos os bots da empresa');
          // Super Admin vê todos os bots da empresa (todas as lojas)
          return await this.getBotsPorEmpresa(empresa);
          
        case 'store_user':
          console.log('🏪 Usuário regular - buscando bots da loja');
          // Usuário regular vê apenas bots da sua loja
          return await this.getBotsPorEmpresaELoja(empresa, loja!);
          
        case 'no_access':
        default:
          console.log('❌ Usuário sem acesso aos robôs');
          return [];
      }
    } catch (error) {
      console.error('Erro ao buscar bots por acesso do usuário:', error);
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