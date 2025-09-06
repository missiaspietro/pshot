"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema } from "@/lib/validations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, Edit, Trash2, AlertCircle, X, ChevronDown } from "lucide-react"
import type { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { shotLojasService } from "@/lib/shot-lojas"
import { ProtectedRouteWithPermission } from "@/components/protected-route-with-permission"

type UserForm = z.infer<typeof userSchema>

interface UserPermissions {
  dashboard: boolean;
  visitantes: boolean;
  historico: boolean;
  mensagens: boolean;
  eventos: boolean;
  treinamento: boolean;
  conexao: boolean;
  usuarios: boolean;
  promocoes?: boolean;
  relatorios?: boolean;
  aniversarios?: boolean;
  pesquisas?: boolean;
  bots?: boolean;
  [key: string]: boolean | undefined;
}

interface User {
  id: string;
  created_at: string;
  name: string;
  email: string;
  access_level: 'admin' | 'gerente' | 'vendedor';
  rede: string | null;
  loja: string | null; // Adicionada propriedade loja
  empresa: string;
  instancia: string;
  sub_rede: string | null;
  permissions: UserPermissions;
}

interface Store {
  id: string;
  name: string;
}

const initialUsers: User[] = []

function UsersPageContent() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [editModal, setEditModal] = useState<{open: boolean, user: User | null}>({open: false, user: null})
  const [stores, setStores] = useState<Store[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [userBankData, setUserBankData] = useState<any>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [permissionsModal, setPermissionsModal] = useState<{open: boolean, permissions: UserPermissions | null}>({open: false, permissions: null})
  const formRef = useRef<HTMLDivElement>(null);

  // Função para converter as permissões do banco para o formato do formulário
  const convertDatabasePermissionsToForm = (user: any): UserPermissions => {
    console.log('[CONVERT] Convertendo permissões do banco para o formulário:', user);
    
    // Mapeamento das colunas do banco para as propriedades do formulário
    const permissionsMap = {
      promocoes: ['telaShot_promocoes', 'tela_promocoes'],
      relatorios: ['telaShot_relatorios', 'tela_relatorios'],
      aniversarios: ['telaShot_aniversarios', 'tela_aniversarios'],
      pesquisas: ['telaShot_pesquisas', 'tela_pesquisas'],
      usuarios: ['telaShot_usuarios', 'tela_users', 'tela_usuarios'],
      bots: ['telaShot_bots', 'tela_bots'],
      dashboard: ['tela_dashboard'],
      visitantes: ['tela_visitantes'],
      historico: ['tela_historico'],
      mensagens: ['tela_mensagens'],
      eventos: ['tela_eventos'],
      treinamento: ['tela_treinamento'],
      conexao: ['tela_conexao']
    };
    
    // Cria um objeto de permissões com valores padrão
    const permissions: UserPermissions = createPermissions();
    
    // Para cada permissão, verifica se alguma das colunas correspondentes tem valor 'sim'
    Object.entries(permissionsMap).forEach(([permKey, dbColumns]) => {
      const hasPermission = dbColumns.some(column => user[column] === 'sim');
      console.log(`[CONVERT] Permissão ${permKey}: ${hasPermission} (colunas: ${dbColumns.join(', ')})`);
      permissions[permKey as keyof UserPermissions] = hasPermission;
    });
    
    console.log('[CONVERT] Permissões convertidas:', permissions);
    return permissions;
  };
  
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      senha: "",
      access_level: "vendedor",
      rede: "",
      permissions: {
        dashboard: false,
        visitantes: false,
        historico: false,
        mensagens: false,
        eventos: false,
        treinamento: false,
        conexao: false,
        usuarios: false
      }
    },
  });
  
  // Efeito para controlar o scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (editModal.open) {
      // Salva a posição atual do scroll
      const scrollY = window.scrollY;
      // Desabilita o scroll do body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Inicializa o formulário com os valores do usuário selecionado
      if (editModal.user) {
        console.log('[MODAL] Inicializando formulário com dados do usuário:', editModal.user);
        
        // Inicializa os campos básicos
        setValue('email', editModal.user.email || '');
        setValue('name', editModal.user.name || '');
        // Garantir que sempre temos uma loja definida no formulário
        const lojaInicial = editModal.user.loja || editModal.user.rede || '';
        setValue('rede', lojaInicial);
        setValue('access_level', editModal.user.access_level || 'vendedor');
        
        console.log('[MODAL] Loja inicial definida no formulário:', lojaInicial);
        
        // Converte e inicializa as permissões
        const permissions = convertDatabasePermissionsToForm(editModal.user);
        console.log('[MODAL] Permissões convertidas do usuário:', permissions);
        setValue('permissions', permissions);
        
        // Garantir que o modal também tenha as permissões corretas
        if (!editModal.user.permissions) {
          console.log('[MODAL] Definindo permissões no modal para garantir sincronização');
          setEditModal({
            ...editModal,
            user: {
              ...editModal.user,
              permissions: permissions
            }
          });
        }
      }
      
      return () => {
        // Restaura o scroll do body quando o modal for fechado
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(String(scrollY || '0')) * -1);
      };
    }
  }, [editModal.open, editModal.user, setValue]);

  // Efeito para atualizar o nível de acesso quando o radio button for alterado
  useEffect(() => {
    const handleRadioChange = () => {
      const radioSelecionado = document.querySelector('input[name="nivel_acesso"]:checked') as HTMLInputElement;
      const nivelAcesso = radioSelecionado?.value || 'vendedor';
      
      // Atualiza o valor no formulário
      setValue('access_level', nivelAcesso as 'admin' | 'gerente' | 'vendedor');
      
      // Atualiza a visualização na tabela (se houver usuário sendo editado)
      const previewCell = document.querySelector('[data-component-name="_c12"]');
      if (previewCell) {
        const badge = previewCell.querySelector('.inline-flex');
        const description = previewCell.querySelector('.text-xs');
        
        if (badge) {
          // Atualiza o badge com os textos corretos
          badge.textContent = 
            nivelAcesso === 'admin' ? 'Super Admin' :
            nivelAcesso === 'gerente' ? 'Administrador' : 'Padrão';
          
          // Atualiza as classes de cor
          if (nivelAcesso === 'admin') {
            // Super Admin - Roxo sólido com texto branco
            badge.className = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0 text-white bg-purple-600 hover:bg-purple-700';
          } else if (nivelAcesso === 'gerente') {
            // Administrador - Gradiente azul para roxo
            badge.className = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0 text-white bg-gradient-to-r from-blue-500 to-purple-500';
          } else {
            // Padrão - Azul sólido com texto branco
            badge.className = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0 text-white bg-blue-600 hover:bg-blue-700';
          }
        }
        
        if (description) {
          // Atualiza a descrição
          description.textContent = 
            nivelAcesso === 'admin' ? 'Acesso total ao sistema' :
            nivelAcesso === 'gerente' ? 'Acesso a relatórios e gerenciamento de vendedores' :
            'Acesso básico ao sistema';
        }
      }
    };
    
    // Adiciona os listeners
    const radioButtons = document.querySelectorAll('input[name="nivel_acesso"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', handleRadioChange);
    });
    
    // Dispara o evento uma vez para configurar o estado inicial
    handleRadioChange();
    
    // Limpa os listeners quando o componente for desmontado
    return () => {
      radioButtons.forEach(radio => {
        radio.removeEventListener('change', handleRadioChange);
      });
    };
  }, [setValue]);


  // Carrega os usuários do Supabase
  const loadUsers = async () => {
    if (!currentUser) return;
    
    try {
      // Verificar se o usuário já tem dados do banco carregados
      const userLevel = userBankData?.nivel || '';
      const userLoja = userBankData?.loja || '';
      
      console.log('Carregando usuários. Nível do usuário:', userLevel, 'Loja do usuário:', userLoja);
      
      let query = supabase
        .from('users')
        .select('*')
        .eq('empresa', currentUser.empresa || '');
      
      // Se não for Super Admin, filtrar apenas usuários da mesma loja
      if (userLevel !== 'Super Admin' && userLoja) {
        console.log('Filtrando usuários apenas da loja:', userLoja);
        query = query.eq('loja', userLoja);
      }
      
      const { data: usersData, error } = await query;
      
      if (error) throw error;
      
      console.log('[LOAD_USERS] Dados brutos dos usuários:', usersData);
      
      // Mapeia os dados do banco para o formato da interface User usando a função de conversão
      const formattedUsers = usersData.map((user: any) => {
        // Converte as permissões do banco para o formato do formulário
        const permissions = convertDatabasePermissionsToForm(user);
        console.log(`[LOAD_USERS] Permissões convertidas para ${user.email}:`, permissions);
        
        return {
          id: user.id,
          created_at: user.criado_em,
          name: user.nome,
          email: user.email,
          access_level: (user.nivel === 'Super Admin' ? 'admin' : 
                        user.nivel === 'Administrador' ? 'gerente' : 'vendedor') as 'admin' | 'gerente' | 'vendedor',
          rede: user.rede || null, // Mantendo a coluna rede do banco de dados
          loja: user.loja || null, // Usando a coluna loja do banco de dados
          empresa: user.empresa || '',
          instancia: user.instancia || '',
          sub_rede: user.sub_rede || user.subrede || null,
          permissions: permissions
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };
  
  // Carregar dados do usuário primeiro
  const loadUserData = async () => {
    try {
      if (!currentUser?.email) {
        console.error('Email do usuário não encontrado');
        return null;
      }

      console.log('Buscando dados do usuário no banco...');
      
      // Buscar dados atualizados do usuário no banco
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({ email: currentUser.email })
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      const userData = await response.json();
      console.log('Dados do usuário obtidos do banco:', userData);
      
      // Armazenar dados do usuário do banco
      setUserBankData(userData);
      
      return userData;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  };

  // Carrega as lojas da tabela shot_lojas baseado no nível do usuário
  const loadStores = async (userData?: any) => {
    try {
      setLoadingStores(true);
      
      if (!currentUser) {
        console.log('[USERS PAGE] Usuário atual não encontrado, abortando carregamento de lojas');
        setLoadingStores(false);
        return;
      }
      
      // Usar dados do banco se disponíveis, senão usar dados do contexto
      const userDataToUse = userData || userBankData;
      
      // Verificar se o usuário é Super Admin
      const isSuperAdmin = userDataToUse?.nivel === 'Super Admin';
      
      console.log('[USERS PAGE] Carregando lojas. Usuário é Super Admin:', isSuperAdmin);
      console.log('[USERS PAGE] Dados do usuário para verificação:', userDataToUse);
      console.log('[USERS PAGE] Current user context:', currentUser);
      
      if (isSuperAdmin) {
        // Super Admin vê todas as lojas da sua rede
        const rede = userDataToUse?.rede || currentUser?.rede || currentUser?.empresa || '';
        
        console.log('[USERS PAGE] Super Admin - buscando lojas da rede:', rede);
        console.log('[USERS PAGE] Fontes de rede: userDataToUse.rede =', userDataToUse?.rede, ', currentUser.rede =', currentUser?.rede, ', currentUser.empresa =', currentUser?.empresa);
        
        if (!rede) {
          console.warn('[USERS PAGE] Super Admin sem rede definida, tentando usar empresa como fallback');
          setStores([]);
          setLoadingStores(false);
          return;
        }
        
        // Usar o shotLojasService para buscar lojas da tabela shot_lojas
        console.log('[USERS PAGE] Chamando shotLojasService.getLojasPorUsuario com rede:', rede);
        const todasLojas = await shotLojasService.getLojasPorUsuario(rede);
        console.log('[USERS PAGE] Lojas retornadas pelo service:', todasLojas);
        
        const lojasFormatadas = todasLojas.map((loja, index) => ({
          id: `${rede}-${index}`, // ID único baseado na rede e índice
          name: loja
        }));
        
        setStores(lojasFormatadas);
        console.log(`[USERS PAGE] Super Admin - Lojas carregadas da tabela shot_lojas: ${lojasFormatadas.length} lojas`, lojasFormatadas);
      } else {
        // Usuários não-Super Admin veem apenas sua loja específica
        const userLoja = userDataToUse?.loja || '';
        
        console.log('[USERS PAGE] Usuário normal - loja do usuário:', userLoja);
        
        if (userLoja) {
          // Mostrar apenas a loja do usuário
          const lojasFormatadas = [{
            id: `user-${userLoja}`,
            name: userLoja
          }];
          
          setStores(lojasFormatadas);
          console.log(`[USERS PAGE] Usuário normal - Loja definida: ${userLoja}`);
        } else {
          console.error('[USERS PAGE] Usuário não tem loja definida');
          setStores([]);
        }
      }
      
      setLoadingStores(false);
    } catch (error) {
      console.error('[USERS PAGE] Erro ao carregar lojas:', error);
      setStores([]);
      setLoadingStores(false);
    }
  };

  // Função combinada que executa na ordem correta
  const loadUserDataAndStores = async () => {
    console.log('[USERS PAGE] Iniciando carregamento de dados do usuário e lojas...');
    
    try {
      // 1. Primeiro buscar dados do usuário
      console.log('[USERS PAGE] Passo 1: Buscando dados do usuário...');
      const userData = await loadUserData();
      
      // 2. Depois carregar lojas baseado nos dados do usuário
      if (userData) {
        console.log('[USERS PAGE] Passo 2: Dados do usuário obtidos, carregando lojas...');
        await loadStores(userData);
        
        // 3. Auto-selecionar loja para usuários não-Super Admin
        if (userData.nivel !== 'Super Admin' && userData.loja) {
          console.log('[USERS PAGE] Passo 3: Auto-selecionando loja para usuário não-Super Admin:', userData.loja);
          setValue('rede', userData.loja);
        } else if (userData.nivel === 'Super Admin') {
          console.log('[USERS PAGE] Passo 3: Usuário é Super Admin, não auto-selecionando loja');
        }
        
        // 4. Recarregar usuários com os filtros corretos baseados no nível do usuário
        console.log('[USERS PAGE] Passo 4: Recarregando usuários...');
        await loadUsers();
      } else {
        console.log('[USERS PAGE] Dados do usuário não obtidos, usando dados do contexto como fallback');
        // Se não conseguiu buscar dados do banco, usa dados do contexto
        await loadStores();
        await loadUsers();
      }
      
      console.log('[USERS PAGE] Carregamento de dados do usuário e lojas concluído com sucesso');
    } catch (error) {
      console.error('[USERS PAGE] Erro durante carregamento de dados:', error);
    }
  };
  
  // Carrega os dados iniciais quando o componente é montado
  useEffect(() => {
    if (currentUser) {
      console.log('[USERS PAGE] useEffect: Usuário atual detectado, iniciando carregamento...');
      // Primeiro carrega os dados do usuário e lojas, que já inclui o carregamento de usuários
      loadUserDataAndStores();
    } else {
      console.log('[USERS PAGE] useEffect: Usuário atual não encontrado');
    }
  }, [currentUser]);
  
  // Mapeia as chaves de permissão para nomes legíveis
  const getPermissionDisplayName = (key: keyof UserPermissions): string => {
    const permissionNames: Record<keyof UserPermissions, string> = {
      dashboard: 'Dashboard',
      visitantes: 'Visitantes',
      historico: 'Histórico',
      mensagens: 'Mensagens',
      eventos: 'Eventos',
      treinamento: 'Treinamento',
      conexao: 'Conexão',
      usuarios: 'Usuários',
      promocoes: 'Promoções',
      relatorios: 'Relatórios',
      aniversarios: 'Aniversários',
      pesquisas: 'Pesquisas',
      bots: 'Bots'
    };
    
    return permissionNames[key] || String(key);
  };
  
  // Verifica se o usuário logado tem permissão para uma determinada tela
  const userHasPermission = (permissionKey: string): boolean => {
    console.log(`[DEBUG] Verificando permissão: ${permissionKey}`);
    console.log(`[DEBUG] Dados do usuário:`, userBankData);
    
    // Super Admin tem todas as permissões
    if (userBankData?.nivel === 'Super Admin') {
      console.log(`[DEBUG] Usuário é Super Admin, permissão concedida automaticamente`);
      return true;
    }
    
    // Se não temos dados do usuário, permitir por padrão para evitar bloqueio incorreto
    if (!userBankData) {
      console.log(`[DEBUG] Dados do usuário não disponíveis, permitindo por padrão`);
      return true;
    }
    
    // Mapeia as chaves de permissão para os nomes das colunas no banco de dados
    const permissionColumnMap: Record<string, string> = {
      promocoes: 'telaShot_promocoes',
      relatorios: 'telaShot_relatorios',
      aniversarios: 'telaShot_aniversarios',
      pesquisas: 'telaShot_pesquisas',
      usuarios: 'telaShot_usuarios',
      bots: 'telaShot_bots'
    };
    
    // Verifica se o usuário tem a permissão específica
    const columnName = permissionColumnMap[permissionKey] || `tela_${permissionKey}`;
    console.log(`[DEBUG] Coluna no banco: ${columnName}`);
    console.log(`[DEBUG] Valor da permissão: ${userBankData?.[columnName]}`);
    
    // Tenta ambos os formatos de coluna (com e sem prefixo 'telaShot_')
    const alternativeColumnName = columnName.startsWith('telaShot_') 
      ? `tela_${permissionKey}` 
      : `telaShot_${permissionKey}`;
    console.log(`[DEBUG] Coluna alternativa: ${alternativeColumnName}`);
    console.log(`[DEBUG] Valor alternativo: ${userBankData?.[alternativeColumnName]}`);
    
    // Verifica ambos os formatos de coluna
    const hasPermission = 
      userBankData?.[columnName] === 'sim' || 
      userBankData?.[alternativeColumnName] === 'sim';
    
    // Caso especial para 'usuarios' - verificar também tela_users
    if (permissionKey === 'usuarios') {
      const hasUserPermission = userBankData?.['tela_users'] === 'sim';
      console.log(`[DEBUG] Permissão especial tela_users: ${hasUserPermission}`);
      if (hasUserPermission) return true;
    }
    
    console.log(`[DEBUG] Resultado final para ${permissionKey}: ${hasPermission}`);
    return hasPermission;
  };

  // Função auxiliar para criar um objeto de permissões com valores padrão
  const createPermissions = (overrides: Partial<UserPermissions> = {}): UserPermissions => ({
    dashboard: true,
    visitantes: false,
    historico: false,
    mensagens: false,
    eventos: false,
    treinamento: false,
    conexao: false,
    usuarios: false,
    promocoes: false,
    relatorios: false,
    aniversarios: false,
    pesquisas: false,
    bots: false,
    ...overrides
  });

  const saveUserToSupabase = async (data: UserForm & { access_level?: 'admin' | 'gerente' | 'vendedor', permissions?: UserPermissions }) => {
    if (!currentUser) {
      throw new Error("Usuário não autenticado");
    }

    // Mapeia o nível de acesso do formulário para o formato do banco
    const mapNivelAcesso = {
      'vendedor': 'Padrão',
      'gerente': 'Administrador',
      'admin': 'Super Admin'
    };

    const nivelAcesso = data.access_level || 'vendedor';
    const permissions = data.permissions || createPermissions();
    
    // Função auxiliar para converter boolean para 'sim'/'nao'
    const boolToSimNao = (value: boolean | undefined) => value ? 'sim' : 'nao';

    // Determinar a loja correta para o usuário
    console.log('[CREATE USER] Dados recebidos:', data);
    console.log('[CREATE USER] Valor do dropdown (data.rede):', data.rede);
    console.log('[CREATE USER] Nível do usuário logado:', userBankData?.nivel);
    console.log('[CREATE USER] Loja do usuário logado:', userBankData?.loja);
    
    let lojaToSave = data.rede || '';
    
    if (userBankData?.nivel !== 'Super Admin' && userBankData?.loja) {
      console.log('[CREATE USER] Usuário não é Super Admin, usando a loja do usuário logado:', userBankData.loja);
      lojaToSave = userBankData.loja;
    } else if (userBankData?.nivel === 'Super Admin') {
      console.log('[CREATE USER] Super Admin criando usuário para a loja selecionada:', data.rede);
      lojaToSave = data.rede || '';
    }
    
    console.log('[CREATE USER] Loja final que será salva:', lojaToSave);
    
    const userData = {
      nome: data.name,
      email: data.email,
      senha: data.senha, // Usa a senha do formulário
      whatsapp: null,
      empresa: currentUser.empresa || '',
      instancia: currentUser.instancia || '',
      qrcode: null,
      nivel: mapNivelAcesso[nivelAcesso] || 'Padrão',
      sistema: 'Praise Shot', // Corrigido para ter espaço entre as palavras
      ministerio: null,
      loja: lojaToSave, // Usa a loja determinada acima
      rede: currentUser.empresa || '', // Envia a empresa do usuário logado para a coluna 'rede'
      // Telas com valores fixos
      tela_dashboard: 'sim',
      tela_visitantes: 'nao',
      tela_historico: 'nao',
      tela_mensagens: 'nao',
      tela_eventos: 'nao',
      tela_treinamento: 'nao',
      // Telas que dependem das permissões
      tela_conexao: boolToSimNao(permissions.conexao),
      tela_users: boolToSimNao(permissions.usuarios),
      subrede: currentUser.sub_rede || null,
      // Telas Shot que dependem das permissões
      telaShot_promocoes: boolToSimNao(permissions.promocoes),
      telaShot_relatorios: boolToSimNao(permissions.relatorios),
      telaShot_aniversarios: boolToSimNao(permissions.aniversarios),
      telaShot_pesquisas: boolToSimNao(permissions.pesquisas),
      telaShot_usuarios: boolToSimNao(permissions.usuarios),
      telaShot_bots: boolToSimNao(permissions.bots)
    };

    const { data: newUser, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar usuário:', error);
      throw new Error(error.message);
    }
    return newUser;
  };

  // Função para salvar usuário editado no modal
  const handleSaveEditedUser = async () => {
    try {
      if (!editModal.user) return;
      
      // Obtém os valores do formulário
      const formData = getValues();
      
      // Mapeia o nível de acesso para o formato do banco de dados
      const mapNivelAcesso = {
        vendedor: 'Padrão',
        gerente: 'Administrador',
        admin: 'Super Admin'
      };
      
      // Determinar a loja a ser salva
      // Prioridade: 1) Valor do formulário, 2) Loja atual do modal, 3) Loja original do usuário
      const lojaToSave = formData.rede || editModal.user.loja || editModal.user.rede || '';
      
      console.log('[EDIT USER] Dados do formulário:', formData);
      console.log('[EDIT USER] Valor formData.rede:', formData.rede);
      console.log('[EDIT USER] Loja atual do modal:', editModal.user.loja);
      console.log('[EDIT USER] Rede original do usuário:', editModal.user.rede);
      console.log('[EDIT USER] Loja que será salva:', lojaToSave);
      
      // Verificação de segurança - se não há loja definida, manter a original
      let lojaFinal = lojaToSave;
      if (!lojaFinal) {
        console.warn('[EDIT USER] Nenhuma loja definida, mantendo loja original');
        // Buscar a loja original do usuário na lista de usuários
        const originalUser = users.find(u => u.id === editModal.user?.id);
        lojaFinal = originalUser?.loja || originalUser?.rede || '';
        console.log('[EDIT USER] Loja original encontrada:', lojaFinal);
      }
      
      // Determinar as permissões a serem salvas
      // Prioridade: 1) Permissões do formulário, 2) Permissões atuais do modal, 3) Permissões originais do usuário
      const permissoesFormulario = formData.permissions;
      const permissoesModal = editModal.user.permissions;
      
      // Buscar permissões originais do usuário na lista
      const originalUser = users.find(u => u.id === editModal.user?.id);
      const permissoesOriginais = originalUser?.permissions;
      
      console.log('[EDIT USER] Permissões do formulário:', permissoesFormulario);
      console.log('[EDIT USER] Permissões do modal:', permissoesModal);
      console.log('[EDIT USER] Permissões originais:', permissoesOriginais);
      
      // Usar as permissões do modal (que são atualizadas quando o usuário interage com os checkboxes)
      // Se não houver permissões no modal, usar as originais como fallback
      let permissoesFinal = permissoesModal;
      
      // Se as permissões do modal estão vazias ou indefinidas, usar as originais
      if (!permissoesFinal || Object.keys(permissoesFinal).length === 0) {
        console.log('[EDIT USER] Permissões do modal vazias, usando permissões originais');
        permissoesFinal = permissoesOriginais || createPermissions();
      }
      
      // Verificação adicional: se ainda não temos permissões válidas, criar permissões padrão
      if (!permissoesFinal) {
        console.log('[EDIT USER] Nenhuma permissão encontrada, criando permissões padrão');
        permissoesFinal = createPermissions();
      }
      
      console.log('[EDIT USER] Permissões finais que serão salvas:', permissoesFinal);
      
      // Função auxiliar para converter boolean para 'sim'/'nao'
      const boolToSimNao = (value: boolean | undefined) => value ? 'sim' : 'nao';
      
      // Prepara os dados para atualização
      const userData = {
        nome: formData.name,
        email: formData.email,
        ...(formData.senha && { senha: formData.senha }), // Só atualiza a senha se foi preenchida
        nivel: mapNivelAcesso[formData.access_level as keyof typeof mapNivelAcesso] || 'Padrão',
        // Usar a loja final determinada
        loja: lojaFinal,
        // Atualiza as permissões usando as permissões finais determinadas
        tela_dashboard: boolToSimNao(permissoesFinal.dashboard),
        tela_conexao: boolToSimNao(permissoesFinal.conexao),
        tela_users: boolToSimNao(permissoesFinal.usuarios),
        telaShot_promocoes: boolToSimNao(permissoesFinal.promocoes),
        telaShot_relatorios: boolToSimNao(permissoesFinal.relatorios),
        telaShot_aniversarios: boolToSimNao(permissoesFinal.aniversarios),
        telaShot_pesquisas: boolToSimNao(permissoesFinal.pesquisas),
        telaShot_usuarios: boolToSimNao(permissoesFinal.usuarios),
        telaShot_bots: boolToSimNao(permissoesFinal.bots),
      };
      
      // Atualiza o usuário no Supabase
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', editModal.user.id);
      
      if (error) throw error;
      
      // Atualiza o estado local
      setUsers(users.map(user => 
        user.id === editModal.user?.id 
          ? { 
              ...user, 
              name: formData.name,
              email: formData.email,
              rede: lojaFinal, // Usar a loja final determinada
              loja: lojaFinal, // Atualizar também o campo loja
              access_level: formData.access_level,
              permissions: {
                dashboard: permissoesFinal.dashboard ?? false,
                visitantes: permissoesFinal.visitantes ?? false,
                historico: permissoesFinal.historico ?? false,
                mensagens: permissoesFinal.mensagens ?? false,
                eventos: permissoesFinal.eventos ?? false,
                treinamento: permissoesFinal.treinamento ?? false,
                conexao: permissoesFinal.conexao ?? false,
                usuarios: permissoesFinal.usuarios ?? false,
                promocoes: permissoesFinal.promocoes,
                relatorios: permissoesFinal.relatorios,
                aniversarios: permissoesFinal.aniversarios,
                pesquisas: permissoesFinal.pesquisas,
                bots: permissoesFinal.bots
              }
            } 
          : user
      ));
      
      // Fecha o modal
      setEditModal({open: false, user: null});
      
      // Recarrega os usuários para garantir que tudo está sincronizado
      await loadUsers();
      
      // Feedback para o usuário
      toast({
        message: 'Usuário atualizado com sucesso!',
        variant: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        message: 'Ocorreu um erro ao tentar atualizar o usuário. Por favor, tente novamente.',
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const onSubmit = async (data: UserForm) => {
    try {
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }
      
      console.log('[SUBMIT] Dados do formulário recebidos:', data);
      console.log('[SUBMIT] Loja selecionada (data.rede):', data.rede);
      
      // Obtém o valor selecionado do radio button
      const radioSelecionado = document.querySelector('input[name="nivel_acesso"]:checked') as HTMLInputElement;
      const nivelAcesso = (radioSelecionado?.value as 'admin' | 'gerente' | 'vendedor') || 'vendedor';
      
      // Obtém as permissões dos checkboxes
      const permissions = {
        conexao: (document.getElementById('perm_conexao') as HTMLInputElement)?.checked || false,
        usuarios: (document.getElementById('perm_usuarios') as HTMLInputElement)?.checked || false,
        promocoes: (document.getElementById('perm_promocoes') as HTMLInputElement)?.checked || false,
        relatorios: (document.getElementById('perm_relatorios') as HTMLInputElement)?.checked || false,
        aniversarios: (document.getElementById('perm_aniversarios') as HTMLInputElement)?.checked || false,
        pesquisas: (document.getElementById('perm_pesquisas') as HTMLInputElement)?.checked || false,
        bots: (document.getElementById('perm_bots') as HTMLInputElement)?.checked || false
      };
      
      // Salva no Supabase
      const newUser = await saveUserToSupabase({
        ...data,
        access_level: nivelAcesso,
        permissions: createPermissions(permissions)
      });
      
      // Cria o objeto de usuário com todas as propriedades necessárias
      const newUserObj: User = {
        id: newUser.id.toString(),
        name: data.name,
        email: data.email,
        access_level: nivelAcesso,
        created_at: new Date().toISOString(),
        rede: data.rede || '',
        loja: data.rede || null,
        empresa: currentUser.empresa || '',
        instancia: currentUser.instancia || '',
        sub_rede: currentUser.sub_rede || null,
        permissions: createPermissions(permissions)
      };
      
      // Atualiza o estado local
      setUsers([...users, newUserObj]);
      
      // Reseta o formulário
      reset({
        name: "",
        email: "",
        senha: "",
        access_level: "vendedor",
        rede: "",
        permissions: {
          dashboard: true,
          visitantes: false,
          historico: false,
          mensagens: false,
          eventos: false,
          treinamento: false,
          conexao: false,
          usuarios: false
        }
      });
      
      // Resetar o radio button para o valor padrão
      const radioPadrao = document.getElementById('nivel_padrao') as HTMLInputElement;
      if (radioPadrao) radioPadrao.checked = true;
      
      toast({
        message: "Usuário cadastrado com sucesso!",
        variant: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      toast({
        message: `Erro ao cadastrar usuário: ${errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Remove o usuário do banco de dados
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);
      
      if (error) throw error;
      
      // Atualiza o estado local removendo o usuário
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      
      // Fecha o modal de confirmação
      setShowDeleteConfirmation(false);
      setUserToDelete(null);
      
      // Feedback para o usuário
      toast({
        message: 'Usuário removido com sucesso!',
        variant: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        message: 'Ocorreu um erro ao tentar remover o usuário. Por favor, tente novamente.',
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case "admin":
        return <Badge className="text-white bg-purple-500 hover:bg-purple-600 border-0">Super Admin</Badge>
      case "gerente":
        return (
          <div 
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white border-0"
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
              border: 'none'
            }}
          >
            Administrador
          </div>
        )
      case "vendedor":
        return <Badge className="text-white bg-blue-500 hover:bg-blue-600 border-0">Padrão</Badge>
      default:
        return <Badge variant="outline" className="border-gray-300 text-gray-700">{level}</Badge>
    }
  }

  const getAccessLevelDescription = (level: string) => {
    switch (level) {
      case "admin":
        return ""
      case "gerente":
        return ""
      case "vendedor":
        return ""
      default:
        return ""
    }
  }


  const formatPermissions = (permissions: any) => {
    if (!permissions) return [];
    
    return Object.entries(permissions)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Formulário de Cadastro */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <UserPlus className="h-5 w-5" />
            Cadastrar Novo Usuário
          </CardTitle>
          <CardDescription className="text-gray-500">Adicione novos usuários ao sistema com diferentes níveis de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-600">Nome Completo</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: João Silva" 
                  className="text-gray-600 placeholder:text-gray-400" 
                  {...register("name")} 
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="joao@empresa.com" 
                  className="text-gray-600 placeholder:text-gray-400" 
                  autoComplete="off"
                  {...register("email")} 
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-600">Senha</Label>
                <Input 
                  id="senha" 
                  type="password" 
                  placeholder="Digite a senha do usuário" 
                  className="text-gray-600 placeholder:text-gray-400" 
                  autoComplete="new-password"
                  {...register("senha")} 
                />
                {errors.senha && <p className="text-sm text-red-600">{errors.senha.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rede" className="text-gray-600">Loja</Label>
                <Select 
                  onValueChange={(value) => {
                    console.log('[CREATE FORM] Loja selecionada no dropdown:', value);
                    setValue("rede", value);
                    console.log('[CREATE FORM] Valor definido no formulário:', value);
                  }}
                  disabled={loadingStores || (userBankData && userBankData.nivel !== 'Super Admin')}
                  value={userBankData && userBankData.nivel !== 'Super Admin' ? userBankData?.loja || '' : undefined}
                >
                  <SelectTrigger className={`text-gray-600 ${
                    (loadingStores || (userBankData && userBankData.nivel !== 'Super Admin'))
                      ? 'opacity-60 cursor-not-allowed bg-gray-100' 
                      : ''
                  }`}>
                    <SelectValue 
                      placeholder={
                        loadingStores 
                          ? 'Carregando lojas...'
                          : userBankData && userBankData.nivel !== 'Super Admin' 
                            ? userBankData?.loja || 'Loja não definida'
                            : stores.length === 0 
                              ? 'Nenhuma loja encontrada'
                              : 'Selecione a loja'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rede && <p className="text-sm text-red-600">{errors.rede.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700">Permissões</h3>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <Label className="text-gray-600 font-medium">Permissões de Acesso às Telas:</Label>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm_promocoes" 
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      {...register("permissions.promocoes")}
                      disabled={!userHasPermission('promocoes')}
                    />
                    <Label 
                      htmlFor="perm_promocoes" 
                      className={`${!userHasPermission('promocoes') ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Promoções
                      {!userHasPermission('promocoes') && (
                        <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm_aniversarios" 
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      {...register("permissions.aniversarios")}
                      disabled={!userHasPermission('aniversarios')}
                    />
                    <Label 
                      htmlFor="perm_aniversarios" 
                      className={`${!userHasPermission('aniversarios') ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Aniversários
                      {!userHasPermission('aniversarios') && (
                        <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm_pesquisas" 
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      {...register("permissions.pesquisas")}
                      disabled={!userHasPermission('pesquisas')}
                    />
                    <Label 
                      htmlFor="perm_pesquisas" 
                      className={`${!userHasPermission('pesquisas') ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Pesquisas
                      {!userHasPermission('pesquisas') && (
                        <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm_relatorios" 
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      {...register("permissions.relatorios")}
                      disabled={!userHasPermission('relatorios')}
                    />
                    <Label 
                      htmlFor="perm_relatorios" 
                      className={`${!userHasPermission('relatorios') ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Relatórios
                      {!userHasPermission('relatorios') && (
                        <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm_bots" 
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      {...register("permissions.bots")}
                      disabled={!userHasPermission('bots')}
                    />
                    <Label 
                      htmlFor="perm_bots" 
                      className={`${!userHasPermission('bots') ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Bots
                      {!userHasPermission('bots') && (
                        <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                      )}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="perm_usuarios" 
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      {...register("permissions.usuarios")}
                      disabled={!userHasPermission('usuarios')}
                    />
                    <Label 
                      htmlFor="perm_usuarios" 
                      className={`${!userHasPermission('usuarios') ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Usuários
                      {!userHasPermission('usuarios') && (
                        <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                      )}
                    </Label>
                  </div>
                  
                  {/* Checkbox 'Conexão' removido conforme solicitado */}
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <p className="text-gray-600 mb-3 font-medium">Nível de Acesso:</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="nivel_padrao" 
                        name="nivel_acesso" 
                        value="vendedor"
                        className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                        onChange={() => setValue("access_level", "vendedor")}
                      />
                      <Label htmlFor="nivel_padrao" className="text-gray-600">Padrão</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="nivel_admin" 
                        name="nivel_acesso" 
                        value="gerente"
                        className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                        onChange={() => setValue("access_level", "gerente")}
                        defaultChecked
                      />
                      <Label htmlFor="nivel_admin" className="text-gray-600">Administrador</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="nivel_super" 
                        name="nivel_acesso" 
                        value="admin"
                        className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                        onChange={() => setValue("access_level", "admin")}
                        disabled={userBankData && userBankData.nivel !== 'Super Admin'}
                      />
                      <Label 
                        htmlFor="nivel_super" 
                        className={`${userBankData && userBankData.nivel !== 'Super Admin' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600'}`}
                      >
                        Super Admin {userBankData && userBankData.nivel !== 'Super Admin' && '(Restrito)'}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <span className="text-white font-medium">Salvar Usuário</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            Usuários Cadastrados
          </CardTitle>
          <CardDescription className="text-gray-500">{users.length} usuário(s) cadastrado(s) no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-[90%] mx-auto overflow-x-auto rounded-md border border-gray-200">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600">Nome</TableHead>
                  <TableHead className="text-gray-600">Email</TableHead>
                  <TableHead className="text-gray-600">Nível de Acesso</TableHead>
                  <TableHead className="text-gray-600">Permissões</TableHead>
                  <TableHead className="text-gray-600">Loja</TableHead>
                  <TableHead className="text-gray-600">Data de Cadastro</TableHead>
                  <TableHead className="text-gray-600">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-gray-600">{user.name}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getAccessLevelBadge(user.access_level)}
                          <p className="text-xs text-gray-500">{getAccessLevelDescription(user.access_level)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => setPermissionsModal({open: true, permissions: user.permissions})}
                        >
                          Ver mais
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.loja || 'Sem loja'}</TableCell>
                      <TableCell className="text-gray-600">{new Date(user.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Botão de edição - visível apenas se:
                              1. Para Super Admin: todos os usuários
                              2. Para Administrador: apenas usuários Padrão
                              3. Para Padrão: nenhum usuário */}
                          {((userBankData?.nivel === 'Super Admin') || 
                            (userBankData?.nivel === 'Administrador' && user.access_level === 'vendedor')) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-600 edit-button" 
                              data-component-name="_c"
                              onClick={() => setEditModal({open: true, user: user})}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Botão de exclusão - visível apenas se:
                              1. Para Super Admin: todos os usuários exceto ele mesmo
                              2. Para Administrador: apenas usuários Padrão
                              3. Para Padrão: nenhum usuário */}
                          {currentUser && currentUser.email !== user.email && 
                            ((userBankData?.nivel === 'Super Admin') || 
                             (userBankData?.nivel === 'Administrador' && user.access_level === 'vendedor')) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Trash2 className="h-4 w-4 hover:text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum usuário cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Usuários */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-component-name="_c5">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{users.length}</div>
            <p className="text-sm text-gray-500">Total de Usuários</p>
          </CardContent>
        </Card>
        <Card data-component-name="_c8" className="bg-blue-500 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{users.filter((u) => u.access_level === "vendedor").length}</div>
            <p className="text-sm text-blue-100">Padrão</p>
          </CardContent>
        </Card>
        <Card data-component-name="_c7" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{users.filter((u) => u.access_level === "gerente").length}</div>
            <p className="text-sm text-blue-100">Administrador</p>
          </CardContent>
        </Card>
        <Card data-component-name="_c6" className="bg-purple-500 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{users.filter((u) => u.access_level === "admin").length}</div>
            <p className="text-sm text-purple-100">Super Admin</p>
          </CardContent>
        </Card>
      </div>
      {/* Modal de edição */}
      {editModal.open && editModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Editar Usuário</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditModal({open: false, user: null})}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-gray-700">Nome</Label>
                <Input 
                  id="edit-name" 
                  defaultValue={editModal.user.name} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email" className="text-gray-700">Email</Label>
                <Input 
                  id="edit-email" 
                  defaultValue={editModal.user.email} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-senha" className="text-gray-700">Senha</Label>
                <Input 
                  id="edit-senha" 
                  type="password"
                  placeholder="Digite a nova senha (deixe vazio para manter a atual)"
                  className="mt-1 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label className="text-gray-700">Nível de Acesso</Label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="edit-nivel-padrao" 
                      name="edit-nivel-acesso" 
                      value="vendedor"
                      defaultChecked={editModal.user.access_level === "vendedor"}
                      className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                      onChange={() => setValue('access_level', 'vendedor')}
                    />
                    <Label htmlFor="edit-nivel-padrao" className="text-gray-600">Padrão</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="edit-nivel-admin" 
                      name="edit-nivel-acesso" 
                      value="gerente"
                      defaultChecked={editModal.user.access_level === "gerente"}
                      className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                      onChange={() => setValue('access_level', 'gerente')}
                    />
                    <Label htmlFor="edit-nivel-admin" className="text-gray-600">Administrador</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="edit-nivel-super" 
                      name="edit-nivel-acesso" 
                      value="admin"
                      defaultChecked={editModal.user.access_level === "admin"}
                      className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                      disabled={userBankData?.nivel !== 'Super Admin'}
                      onChange={() => setValue('access_level', 'admin')}
                    />
                    <Label 
                      htmlFor="edit-nivel-super" 
                      className={`${userBankData?.nivel !== 'Super Admin' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Super Admin
                      {userBankData?.nivel !== 'Super Admin' && (
                        <span className="ml-1 text-xs text-gray-400">(Restrito)</span>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Seção de Loja */}
              <div>
                <Label className="text-gray-700 mb-1 block">Loja</Label>
                <Select
                  value={editModal.user?.loja || editModal.user?.rede || ''}
                  onValueChange={(value) => {
                    console.log('[MODAL] Loja selecionada no dropdown:', value);
                    setEditModal({
                      ...editModal,
                      user: {
                        ...editModal.user!,
                        rede: value,
                        loja: value
                      }
                    });
                    setValue('rede', value);
                  }}
                  disabled={userBankData && userBankData.nivel !== 'Super Admin'}
                >
                  <SelectTrigger className={`w-full ${userBankData && userBankData.nivel !== 'Super Admin' ? 'bg-gray-100' : ''}`}>
                    <SelectValue 
                      placeholder={userBankData && userBankData.nivel !== 'Super Admin' 
                        ? userBankData?.loja || 'Loja não definida'
                        : 'Selecione uma loja'} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.name}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userBankData && userBankData.nivel !== 'Super Admin' && (
                  <p className="text-xs text-gray-500 mt-1">Você só pode criar usuários para sua própria loja</p>
                )}
              </div>
              
              {/* Seção de Permissões */}
              <div className="pt-2">
                <Label className="text-gray-700 mb-2 block">Permissões</Label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {Object.entries(editModal.user.permissions || createPermissions()).map(([key, value]) => {
                      // Verifica se a permissão existe no UserPermissions
                      const permissionKey = key as keyof UserPermissions;
                      const permissionName = getPermissionDisplayName(permissionKey);
                      
                      // Se não encontrar um nome para a permissão, não renderiza o checkbox
                      if (!permissionName) return null;
                      
                      // Verifica se o usuário tem permissão para modificar este checkbox
                      const hasPermission = userHasPermission(permissionKey as string);
                      
                      return (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-perm-${key}`}
                            checked={value}
                            onChange={(e) => {
                              if (!editModal.user) return;
                              const newPermissions = {...editModal.user.permissions};
                              newPermissions[permissionKey] = e.target.checked;
                              setEditModal({
                                ...editModal,
                                user: {
                                  ...editModal.user,
                                  permissions: newPermissions
                                }
                              });
                              
                              // Sincroniza com o React Hook Form
                              const formPermissions = {...getValues().permissions || {}} as Record<string, boolean>;
                              formPermissions[permissionKey] = e.target.checked;
                              setValue('permissions', formPermissions);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            disabled={!hasPermission}
                          />
                          <Label 
                            htmlFor={`edit-perm-${key}`} 
                            className={`${!hasPermission ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {permissionName}
                            {!hasPermission && (
                              <span className="ml-1 text-xs text-gray-400">(Sem permissão)</span>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditModal({...editModal, open: false})}
                  className="bg-white hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    // Sincroniza todos os valores do modal com o formulário antes de salvar
                    setValue('email', (document.getElementById('edit-email') as HTMLInputElement)?.value || '');
                    setValue('name', (document.getElementById('edit-name') as HTMLInputElement)?.value || '');
                    setValue('senha', (document.getElementById('edit-senha') as HTMLInputElement)?.value || '');
                    
                    // Obtém o valor do nível de acesso selecionado
                    const nivelAcesso = (document.querySelector('input[name="edit-nivel-acesso"]:checked') as HTMLInputElement)?.value || 'vendedor';
                    setValue('access_level', nivelAcesso as 'admin' | 'gerente' | 'vendedor');
                    
                    // Salva as alterações
                    handleSaveEditedUser();
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Diálogo de confirmação de exclusão */}
      {showDeleteConfirmation && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirmation(false);
              setUserToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-90 zoom-in-90"
            onKeyDown={(e) => {
              // Fechar com a tecla ESC
              if (e.key === 'Escape') {
                setShowDeleteConfirmation(false);
                setUserToDelete(null);
              }
            }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h2 
                  id="delete-dialog-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Excluir Usuário
                </h2>
              </div>
              
              <p 
                id="delete-dialog-description"
                className="text-gray-600 dark:text-gray-300 mb-6"
              >
                Tem certeza que deseja excluir este usuário? 
                <span className="block mt-1 text-sm">Esta ação não pode ser desfeita.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setUserToDelete(null);
                  }}
                  className="w-full sm:w-auto hover:bg-gray-100 hover:shadow-md transition-all duration-200 border-gray-300 hover:text-gray-900"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={deleteUser}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  ref={deleteButtonRef}
                >
                  Excluir Usuário
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Permissões */}
      <Dialog open={permissionsModal.open} onOpenChange={(open) => setPermissionsModal({...permissionsModal, open})}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <DialogTitle className="text-gray-700">Permissões de Acesso</DialogTitle>
            </div>
          </DialogHeader>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissionsModal.permissions ? (
                Object.entries(permissionsModal.permissions).map(([key, value]) => (
                  value === true && (
                    <div key={key} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-gray-600">{getPermissionDisplayName(key as keyof UserPermissions)}</span>
                    </div>
                  )
                ))
              ) : (
                <p className="text-gray-500">Nenhuma permissão definida</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsersPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_usuarios">
      <UsersPageContent />
      <style jsx global>{`
        .edit-button:hover {
          background-color: transparent !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
          color: #4b5563 !important; /* text-gray-600 equivalente */
        }
      `}</style>
    </ProtectedRouteWithPermission>
  )
}

