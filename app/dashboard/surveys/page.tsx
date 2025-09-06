"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, useFieldArray, SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/auth-context';
import { surveyService } from '@/lib/survey-service';
import { useToast } from '@/components/ui/use-toast';
import { shotLojasService } from "@/lib/shot-lojas"
import { SurveyQuestion } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, MessageSquare, Loader2, Pencil } from "lucide-react"
import { ProtectedRouteWithPermission } from "@/components/protected-route-with-permission"

// Zod schema alinhado aos campos do formulário
const optionSchema = z.string().min(1, "Opção não pode ser vazia")
const questionSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  options: z.array(optionSchema).min(2, "Pelo menos 2 opções").max(4, "Máximo 4 opções"),
  step: z.number().int().min(1, "Passo deve ser >= 1"),
})
const surveyFormSchema = z.object({
  description: z.string().optional(),
  store: z.string().optional(),
  questions: z.array(questionSchema).min(1, "Adicione ao menos 1 pergunta"),
})

type SurveyForm = z.infer<typeof surveyFormSchema>

function SurveysPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [surveys, setSurveys] = useState<SurveyQuestion[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [filterStore, setFilterStore] = useState<string>('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<SurveyQuestion | null>(null)
  const [isAllStores, setIsAllStores] = useState(false)
  
  // Estado para o modal de edição
  const [showEditModal, setShowEditModal] = useState(false)
  const [surveyToEdit, setSurveyToEdit] = useState<SurveyQuestion | null>(null)
  
  // Controlar o overflow do body quando o modal estiver aberto
  useEffect(() => {
    if (showEditModal || showDeleteDialog) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [showEditModal, showDeleteDialog])
  const [isEditing, setIsEditing] = useState(false)
  
  // Estado para armazenar a lista de lojas
  const [stores, setStores] = useState<{id: string, name: string}[]>([])
  
  // Estado para armazenar dados do usuário do banco
  const [userBankData, setUserBankData] = useState<any>(null);

  // Carregar dados do usuário primeiro
  const loadUserData = async () => {
    try {
      if (!user?.email) {
        console.error('Email do usuário não encontrado');
        return null;
      }

      console.log('Buscando dados do usuário no banco...');
      
      // Buscar dados atualizados do usuário no banco
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({ email: user.email })
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

  // Carregar lojas baseado nos dados do usuário
  const loadLojas = async (userData: any) => {
    try {
      if (!userData) {
        console.error('Dados do usuário não fornecidos para carregar lojas');
        return;
      }

      console.log('Carregando lojas para o usuário:', userData);

      // Verificar se o usuário é Super Admin
      console.log('[SURVEYS PAGE] Verificando nível do usuário:', userData.nivel);
      console.log('[SURVEYS PAGE] Comparação:', userData.nivel === 'Super Admin');
      const isSuperAdmin = userData.nivel === 'Super Admin';
      
      if (isSuperAdmin) {
        console.log('[SURVEYS PAGE] Entrando no bloco Super Admin');
        // Super Admin vê todas as lojas da sua rede
        // Usar campo rede da tabela users
        const rede = userData.rede || user?.rede || '';
        
        console.log('[SURVEYS PAGE] Usuário é Super Admin, buscando lojas da rede:', rede);
        console.log('Dados do banco:', userData);
        console.log('Dados do contexto:', { rede: user?.rede });
        
        if (!rede) {
          console.warn('Usuário Super Admin sem rede definida');
          setStores([]);
          return;
        }
        
        const todasLojas = await shotLojasService.getLojasPorUsuario(rede);
        const lojasFormatadas = todasLojas.map(loja => ({
          id: loja,
          name: loja
        }));
        setStores(lojasFormatadas);
        console.log('Lojas carregadas para Super Admin da tabela shot_lojas:', lojasFormatadas);
      } else {
        console.log('[SURVEYS PAGE] Entrando no bloco usuário normal');
        // Usuários normais veem apenas sua loja específica
        const userLoja = userData.loja || '';
        console.log('[SURVEYS PAGE] Usuário não é Super Admin. Loja do usuário:', userLoja);
        
        if (userLoja) {
          // Mostrar apenas a loja do usuário
          const lojasFormatadas = [{
            id: userLoja,
            name: userLoja
          }];
          setStores(lojasFormatadas);
          
          // Auto-selecionar a loja do usuário no dropdown de filtro
          setFilterStore(userLoja);
          console.log('Loja definida para usuário normal:', lojasFormatadas);
        } else {
          console.error('Usuário não tem loja definida');
          setStores([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      setStores([]);
    }
  };

  // Função combinada que executa na ordem correta
  const loadUserDataAndLojas = async () => {
    console.log('Iniciando carregamento de dados do usuário e lojas...');
    
    // 1. Primeiro buscar dados do usuário
    const userData = await loadUserData();
    
    // 2. Depois carregar lojas baseado nos dados do usuário
    if (userData) {
      await loadLojas(userData);
    }
    
    console.log('Carregamento de dados do usuário e lojas concluído');
  }
  
  // Obter a sub-rede do usuário (usando empresa como fallback)
  const userSubRede = user?.sub_rede || user?.empresa || '';

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteClick = (survey: SurveyQuestion) => {
    console.log('Abrindo diálogo para excluir pesquisa:', survey);
    console.log('ID da pesquisa (survey.id):', survey.id);
    console.log('Tipo do ID:', typeof survey.id);
    console.log('Todas as propriedades do objeto survey:', Object.keys(survey));
    console.log('Objeto survey completo:', JSON.stringify(survey, null, 2));
    
    setSurveyToDelete(survey);
    setShowDeleteDialog(true);
  };
  
  // Função para abrir o modal de edição
  const handleEditClick = (survey: SurveyQuestion) => {
    console.log('Abrindo modal para editar pesquisa:', survey);
    setSurveyToEdit(survey);
    setShowEditModal(true);
  };

  // Estado para controlar o carregamento durante a exclusão
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Função para atualizar uma pesquisa
  const handleUpdateSurvey = async () => {
    if (!surveyToEdit) {
      console.error('Pesquisa para edição não encontrada');
      setShowEditModal(false);
      return;
    }
    
    setIsEditing(true);
    
    try {
      // Obter o ID da pesquisa
      const surveyId = (surveyToEdit as any).Id || surveyToEdit.id;
      
      if (!surveyId) {
        console.error('ID da pesquisa não encontrado no objeto:', surveyToEdit);
        toast({
          message: 'Não foi possível identificar o ID da pesquisa para edição.',
          variant: 'destructive'
        });
        setShowEditModal(false);
        return;
      }
      
      // Preparar os dados para atualização
      const updateData = {
        id: surveyId,
        pergunta: surveyToEdit.pergunta,
        opcoes: surveyToEdit.opcoes,
        passo: surveyToEdit.passo || surveyToEdit.step,
        loja: surveyToEdit.loja,
        status: surveyToEdit.status || 'ATIVADA',
        bot: surveyToEdit.bot,
        sala: surveyToEdit.sala || ''
        // Removido o campo empresa que não existe no tipo SurveyQuestion
      };
      
      console.log('Atualizando pesquisa com dados:', updateData);
      
      // Chamar o serviço para atualizar a pesquisa
      const success = await surveyService.updateSurvey(updateData);
      
      if (success) {
        console.log('Pesquisa atualizada com sucesso');
        // Recarregar a lista de pesquisas
        await loadSurveys();
        // Fechar o modal
        setShowEditModal(false);
        setSurveyToEdit(null);
        toast({
          message: 'Pesquisa atualizada com sucesso!',
          variant: 'success'
        });
      } else {
        console.error('Falha ao atualizar pesquisa');
        toast({
          message: 'Não foi possível atualizar a pesquisa. Verifique os dados e tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar pesquisa:', error);
      toast({
        message: `Ocorreu um erro ao tentar atualizar a pesquisa: ${(error as any)?.message || 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setIsEditing(false);
    }
  };
  
  // Referência para o botão de exclusão para gerenciar o foco
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  
  // Efeito para gerenciar o foco e a rolagem quando o diálogo é aberto/fechado
  useEffect(() => {
    if (showDeleteDialog) {
      // Logs de depuração
      console.log('Dialog aberto. surveyToDelete:', surveyToDelete);
      if (surveyToDelete) {
        console.log('ID no diálogo (surveyToDelete.id):', (surveyToDelete as any).id);
        console.log('Id no diálogo (surveyToDelete.Id):', (surveyToDelete as any).Id);
        console.log('Todas as chaves do objeto:', Object.keys(surveyToDelete));
      }
      
      // Salvar o elemento que tinha o foco antes de abrir o diálogo
      const previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Bloquear a rolagem da página
      document.body.style.overflow = 'hidden';
      
      // Mover o foco para o botão de exclusão
      if (deleteButtonRef.current) {
        deleteButtonRef.current.focus();
      }
      
      // Função para restaurar o foco quando o diálogo for fechado
      return () => {
        document.body.style.overflow = '';
        previouslyFocusedElement?.focus();
        // Limpar o surveyToDelete apenas quando o diálogo for fechado
        setSurveyToDelete(null);
      };
    }
  }, [showDeleteDialog, surveyToDelete]);

  // Função para confirmar a exclusão
  const confirmDelete = async () => {
    // Verifica se surveyToDelete existe
    if (!surveyToDelete) {
      console.error('Pesquisa para exclusão não encontrada');
      setShowDeleteDialog(false);
      return;
    }

    // Usa o ID da pesquisa, verificando tanto 'id' quanto 'Id' (o Supabase pode retornar com 'I' maiúsculo)
    const surveyId = (surveyToDelete as any).Id || surveyToDelete.id;
    
    if (!surveyId) {
      console.error('ID da pesquisa não encontrado no objeto:', surveyToDelete);
      toast({
        message: 'Não foi possível identificar o ID da pesquisa para exclusão.',
        variant: 'destructive'
      });
      setShowDeleteDialog(false);
      return;
    }

    console.log('Iniciando exclusão da pesquisa com ID:', surveyId, 'Tipo:', typeof surveyId);
    setIsDeleting(true);
    
    try {
      console.log('Chamando surveyService.deleteSurvey com ID:', surveyId);
      const success = await surveyService.deleteSurvey(surveyId);
      
      if (success) {
        console.log('Pesquisa excluída com sucesso');
        // Atualiza a lista de pesquisas após a exclusão
        await loadSurveys();
      } else {
        console.error('Falha ao excluir pesquisa - serviço retornou falso');
        toast({
          message: 'Não foi possível excluir a pesquisa. A pesquisa pode não existir ou você não tem permissão.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir pesquisa:', error);
      toast({
        message: 'Ocorreu um erro ao tentar excluir a pesquisa. Por favor, tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Filtrar pesquisas com base na loja selecionada e na sub-rede do usuário
  const filteredSurveys = surveys.filter(survey => {
    const matchesStore = !filterStore || survey.loja === filterStore;
    const matchesSubRede = !userSubRede || survey.sub_rede === userSubRede;
    return matchesStore && matchesSubRede;
  })
  
  // Log para depuração
  console.log('Usuário atual no componente SurveysPage:', user)
  
  // Função para carregar pesquisas
  const loadSurveys = async () => {
    try {
      if (!user) {
        console.error('Usuário não autenticado')
        return
      }
      
      setIsLoading(true)
      const empresa = user.empresa || 'empresa_padrao'
      const subRede = user.empresa || 'empresa_padrao' // Usando a empresa como sub-rede também
      
      const data = await surveyService.getSurveys(empresa, subRede)
      setSurveys(data || [])
    } catch (error) {
      console.error('Erro ao carregar pesquisas:', error)
      setSurveys([])
    } finally {
      setIsLoading(false)
    }
  }
  
  // Efeito para selecionar automaticamente a loja do usuário quando os dados forem carregados
  useEffect(() => {
    if (userBankData?.loja && userBankData.nivel !== 'Super Admin') {
      console.log('Selecionando automaticamente a loja do usuário:', userBankData.loja);
      setSelectedStore(userBankData.loja);
      setValue('store', userBankData.loja, { shouldValidate: true });
    }
  }, [userBankData]);

  // Carregar pesquisas e lojas quando a página é carregada ou quando o usuário muda
  useEffect(() => {
    console.log('useEffect executado, usuário:', user)
    if (user) {
      console.log('Usuário autenticado, carregando dados...')
      loadSurveys()
      loadUserDataAndLojas()
    } else {
      console.log('Usuário não autenticado, redirecionando...')
      router.push('/login')
    }
  }, [user])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SurveyForm>({
    resolver: zodResolver(surveyFormSchema),
    mode: 'onChange',
    defaultValues: {
      description: "",
      store: "",
      questions: [
        { 
          question: "Como você avalia o atendimento? (Clique para editar a pergunta)", 
          options: ["Ótimo", "Bom", "Regular", "Ruim"],
          step: 1
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });
  
  // Estado para controlar se o formulário foi tocado
  const [formTouched, setFormTouched] = useState(false);
  
  // Marcar o formulário como tocado quando qualquer campo for alterado
  useEffect(() => {
    const subscription = watch(() => {
      setFormTouched(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Verificar se o formulário está válido
  const isFormValid = (data: SurveyForm) => {
    try {
      // Se "Criar para todas as lojas" estiver marcado, não validar o campo store
      if (isAllStores) {
        // Validar apenas os campos obrigatórios exceto store
        const hasQuestions = data.questions.length > 0;
        const hasQuestionText = hasQuestions && data.questions[0].question?.trim() !== '';
        const hasOptions = hasQuestions && data.questions[0].options.every(opt => opt.trim() !== '');
        const hasValidStep = hasQuestions && data.questions[0].step > 0;
        
        return hasQuestions && hasQuestionText && hasOptions && hasValidStep;
      }
      
      // Validação normal quando não está criando para todas as lojas
      surveyFormSchema.parse(data);
      
      // Verificações adicionais
      const hasQuestions = data.questions.length > 0;
      const hasQuestionText = hasQuestions && data.questions[0].question?.trim() !== '';
      const hasOptions = hasQuestions && data.questions[0].options.every(opt => opt.trim() !== '');
      const hasValidStep = hasQuestions && data.questions[0].step > 0;
      
      return hasQuestions && hasQuestionText && hasOptions && hasValidStep;
    } catch (error) {
      return false;
    }
  };
  
  // Função para verificar se o formulário está pronto para ser submetido
  const isSubmitDisabled = () => {
    if (!formTouched) return true;
    const formData = watch();
    
    // Se "Criar para todas as lojas" estiver marcado, usar validação especial
    if (isAllStores) {
      // Validar apenas pergunta e opções, não a loja
      const hasQuestions = formData.questions && formData.questions.length > 0;
      const hasQuestionText = hasQuestions && formData.questions[0].question?.trim() !== '';
      const hasOptions = hasQuestions && formData.questions[0].options && formData.questions[0].options.every(opt => opt.trim() !== '');
      const hasValidStep = hasQuestions && formData.questions[0].step > 0;
      
      return !(hasQuestions && hasQuestionText && hasOptions && hasValidStep);
    }
    
    return !isFormValid(formData);
  };

  const onSubmit = async (data: SurveyForm) => {
    console.log('=== INÍCIO DO onSubmit ===');
    console.log('Data recebida:', data);
    console.log('isAllStores:', isAllStores);
    console.log('Stores disponíveis:', stores);
    
    // Validação especial quando "Criar para todas as lojas" estiver marcado
    if (isAllStores) {
      console.log('Validando formulário para criação em todas as lojas');
      const hasQuestions = data.questions && data.questions.length > 0;
      const hasQuestionText = hasQuestions && data.questions[0].question?.trim() !== '';
      const hasOptions = hasQuestions && data.questions[0].options && data.questions[0].options.every(opt => opt.trim() !== '');
      const hasValidStep = hasQuestions && data.questions[0].step > 0;
      
      console.log('Validações:', { hasQuestions, hasQuestionText, hasOptions, hasValidStep });
      
      if (!(hasQuestions && hasQuestionText && hasOptions && hasValidStep)) {
        console.error('Formulário inválido para criação em todas as lojas. Preencha pergunta, opções e passo.');
        return;
      }
    } else {
      // Validação normal - verificar se loja foi selecionada
      if (!data.store || data.store.trim() === '') {
        console.error('Selecione uma loja para criar a pesquisa.');
        return;
      }
      
      if (!isFormValid(data)) {
        console.error('Formulário inválido. Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }
    
    console.log('Validação passou, continuando...');

    setIsSubmitting(true);
    try {
      console.log('Iniciando envio do formulário:', data);
      
      // Verificar autenticação e obter instância do usuário
      if (!user) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }
      
      if (!user.instancia) {
        console.error('Dados do usuário incompletos:', user);
        throw new Error('Instância do usuário não encontrada. Por favor, verifique suas permissões.');
      }
      
      // Validar loja apenas se não estiver criando para todas as lojas
      if (!isAllStores && !data.store) {
        throw new Error('Número da loja é obrigatório.');
      }
      
      const userInstance = user.instancia;

      if (isAllStores) {
        // Criar pesquisa para todas as lojas disponíveis
        console.log('Criando pesquisa para todas as lojas:', stores);
        
        const results = [];
        for (const store of stores) {
          const botName = `${userInstance}${store.id}`;
          
          const questionData = {
            pergunta: data.questions[0].question,
            opcoes: data.questions[0].options.join(';'),
            passo: data.questions[0].step,
            status: 'ATIVADA',
            loja: store.id,
            bot: botName,
            sala: '',
            empresa: user.empresa,
            rede: user.rede || '',
            sub_rede: user.sub_rede || ''
          };
          
          const result = await surveyService.createSurvey(questionData);
          results.push(result);
        }
        
        console.log(`Pesquisa criada para ${stores.length} lojas`);
      } else {
        // Criar pesquisa para loja específica
        const botName = `${userInstance}${data.store}`;

        const questionData = {
          pergunta: data.questions[0].question,
          opcoes: data.questions[0].options.join('|'),
          passo: data.questions[0].step,
          status: 'ATIVADA',
          loja: data.store || '',
          bot: botName,
          sala: '',
          empresa: user.empresa || '',
          rede: user.rede || '',
          sub_rede: user.sub_rede || ''
        };
        
        // Enviar a pesquisa para a API
        const result = await surveyService.createSurvey(questionData);
        console.log('Pesquisa criada com sucesso:', result);
      }
      
      // Limpa o formulário
      reset({
        description: "",
        store: "",
        questions: [
          {
            question:
              "Como você avalia o atendimento? (Clique para editar a pergunta)",
            options: ["Ótimo", "Bom", "Regular", "Ruim"],
            step: 1,
          },
        ],
      })
      
      // Recarregar as pesquisas para mostrar a nova pesquisa no topo
      await loadSurveys()
      
      // Mostrar mensagem de sucesso
      console.log("Pesquisa criada com sucesso!")
      
      // Recarregar as pesquisas para garantir que a lista esteja atualizada
      await loadSurveys()
      
      // Mostrar mensagem de sucesso para o usuário
      const successMessage = isAllStores 
        ? `Pesquisa criada com sucesso para ${stores.length} lojas!`
        : "Pesquisa criada com sucesso!";
        
      toast({
        message: successMessage,
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error)
      toast({
        message: `Erro ao salvar: ${(error as any)?.message || JSON.stringify(error)}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addOption = (questionIndex: number) => {
    const currentOptions = fields[questionIndex].options
    if (currentOptions.length < 4) {
      append({ 
        question: fields[questionIndex].question, 
        options: [...currentOptions, ""], 
        step: fields[questionIndex].step 
      }, { focusIndex: questionIndex })
    }
  }

  return (
    <div className="space-y-6 text-gray-700 [&_*]:!text-gray-700 w-full">
      {/* Conteúdo principal */}
      <style jsx global>{`
        .text-muted-foreground {
          color: hsl(0, 0%, 45%) !important;
        }
        input::placeholder,
        textarea::placeholder {
          color: hsl(0, 0%, 50%) !important;
          opacity: 1 !important;
        }
      `}</style>
      {/* Formulário de Criação */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-700 !text-gray-700" data-component-name="_c4">
              <MessageSquare className="h-5 w-5" />
              Criar Nova Pesquisa
            </CardTitle>
            <div className="flex flex-col items-end">
              {user?.instancia && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Instância: {user.instancia}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {selectedStore ? `Loja: ${selectedStore}` : 'Loja: -'}
                </span>
              </div>
            </div>
          </div>
          <CardDescription>Crie pesquisas personalizadas para seus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="grid gap-4 md:grid-cols-1 w-full">

              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="store">Loja</Label>
                  {userBankData?.nivel === 'Super Admin' ? (
                    <Controller
                      name="store"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedStore(value);
                          }} 
                          defaultValue=""
                          disabled={isAllStores}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-[#7f10e6] focus:ring-2 focus:ring-[#7f10e6]/20">
                            <SelectValue placeholder="Selecione uma loja" />
                          </SelectTrigger>
                          <SelectContent className="bg-white text-gray-700 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {stores.length > 0 ? (
                              stores.map((store) => (
                                <SelectItem key={store.id} value={store.name}>
                                  {store.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                Nenhuma loja encontrada
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : userBankData?.loja ? (
                    <Select 
                      value={userBankData.loja}
                      onValueChange={() => {}}
                      disabled
                    >
                      <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700">
                        <SelectValue>{userBankData.loja}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={userBankData.loja}>
                          {userBankData.loja}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      Carregando loja...
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="all-stores"
                    checked={isAllStores}
                    onChange={(e) => {
                      setIsAllStores(e.target.checked);
                      if (e.target.checked) {
                        // Corrigindo o erro de setValue
                        setSelectedStore('');
                        // Usar o setValue do register em vez do control
                        reset({ ...watch(), store: '' });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#7f10e6] focus:ring-[#7f10e6]"
                  />
                  <Label htmlFor="all-stores" className="ml-2 text-sm text-gray-700">
                    Criar para todas as lojas
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Pergunta</Label>
              </div>

              {fields.length > 0 && (
                <Card className="p-4 w-full">
                  <div className="space-y-4 w-full">
                    <div className="flex justify-between items-center w-full">
                      <h3 className="text-lg font-semibold text-gray-700">Pergunta</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Passo:</span>
                        <Input 
                          type="number" 
                          placeholder="Ex.: 1"
                          min={1}
                          {...register(`questions.0.step`, { 
                            valueAsNumber: true,
                            required: true,
                            min: 1
                          })}
                          className="w-20 h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        placeholder="Digite sua pergunta aqui..."
                        className="border-gray-300 focus-visible:ring-gray-500 w-full"
                        {...register(`questions.0.question`)}
                      />
                    </div>

                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm whitespace-nowrap">Alternativas (4 fixas)</Label>
                      </div>
                      {fields[0]?.options.map((_, optionIndex) => (
                        <Input
                          key={optionIndex}
                          defaultValue={fields[0].options[optionIndex]}
                          {...register(`questions.0.options.${optionIndex}`)}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Button 
              type="submit"
              variant="outline"
              size="default"
              disabled={isSubmitting || isSubmitDisabled()}
              onClick={(e) => {
                console.log('=== BOTÃO CLICADO ===');
                console.log('isSubmitting:', isSubmitting);
                console.log('isSubmitDisabled():', isSubmitDisabled());
                console.log('isAllStores:', isAllStores);
                console.log('formTouched:', formTouched);
                
                if (!isSubmitDisabled() && !isSubmitting) {
                  console.log('Chamando handleSubmit manualmente...');
                  console.log('Dados do formulário:', watch());
                  console.log('Erros do formulário:', errors);
                  
                  handleSubmit(
                    (data) => {
                      console.log('handleSubmit SUCCESS - chamando onSubmit com:', data);
                      onSubmit(data);
                    },
                    (errors) => {
                      console.log('handleSubmit ERROR - erros de validação:', errors);
                    }
                  )(e);
                }
              }}
              className={`w-full relative overflow-hidden group border-2 border-[#7f10e6] bg-transparent text-[#7f10e6] hover:bg-[#7f10e6] hover:text-[#ffffff] transition-all duration-300 hover:shadow-lg hover:shadow-[#7f10e6]/20 text-base py-6 ${
                isSubmitDisabled() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                  Criando Pesquisa...
                </>
              ) : (
                !formTouched ? 'Preencha o formulário' : (isSubmitDisabled() ? 'Preencha todos os campos' : 'Criar Pesquisa')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Pesquisas */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-gray-700 !text-gray-700">Pesquisas Criadas</CardTitle>
              <CardDescription className="text-gray-700">Gerencie suas pesquisas existentes</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1">
                <Select 
                  value={filterStore}
                  onValueChange={(value) => setFilterStore(value === 'all' ? '' : value)}
                  disabled={userBankData && userBankData.nivel !== 'Super Admin'}
                >
                  <SelectTrigger className={`w-full ${userBankData && userBankData.nivel !== 'Super Admin' ? 'opacity-75 cursor-not-allowed bg-gray-100' : ''}`}>
                    <SelectValue placeholder="Filtrar por loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {userBankData?.nivel === 'Super Admin' && (
                      <SelectItem value="all">Todas as lojas</SelectItem>
                    )}
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {userSubRede && (
                <div className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                  Sub-rede: {userSubRede}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#7f10e6]" />
                <span className="ml-2 text-[#7f10e6]">Carregando pesquisas...</span>
              </div>
            ) : surveys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma pesquisa encontrada{filterStore ? ` para a loja selecionada` : ''}.</p>
                <p className="text-sm mt-2">
                  {filterStore 
                    ? 'Tente remover o filtro ou crie uma nova pesquisa para esta loja.' 
                    : 'Crie sua primeira pesquisa usando o formulário acima.'}
                </p>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Não há pesquisas criadas <span className="text-[#7f10e6]">:(</span></p>
                <p className="text-sm text-gray-400 mt-2">Selecione outra loja ou crie uma nova pesquisa.</p>
              </div>
            ) : (
              filteredSurveys.map((survey) => (
                <div key={`survey-${survey.id || Math.random().toString(36).substring(7)}`} className="border rounded-lg p-4 w-full" data-component-name="SurveysPage">
                  <div className="flex items-center justify-between w-full" data-component-name="SurveysPage">
                    <div className="flex-1" data-component-name="SurveysPage">
                      <h3 className="font-medium text-[#7f10e6]">
                        {(() => {
                          // Extrair a pergunta do campo combinado
                          const perguntaCompleta = survey.pergunta || survey.question || '';
                          const partes = typeof perguntaCompleta === 'string' ? perguntaCompleta.split(';') : [];
                          return partes.length > 0 ? partes[0] : perguntaCompleta;
                        })()}
                      </h3>
                      <p className="text-sm text-[#7f10e6]/80">Loja: {survey.loja}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-[#7f10e6]/60">
                          {(() => {
                            // Contar opções a partir do campo combinado
                            const perguntaCompleta = survey.pergunta || survey.question || '';
                            const partes = typeof perguntaCompleta === 'string' ? perguntaCompleta.split(';') : [];
                            // Subtrair 1 porque a primeira parte é a pergunta
                            const numOpcoes = partes.length > 1 ? partes.length - 1 : 0;
                            return numOpcoes;
                          })()} opções
                        </p>
                        <span className="text-xs bg-[#7f10e6]/10 text-[#7f10e6] px-2 py-0.5 rounded-full">
                          Passo: {survey.passo || survey.step || 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center" data-component-name="SurveysPage">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(survey);
                        }}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 mr-1"
                        title="Editar pesquisa"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(survey);
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Excluir pesquisa"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação de exclusão */}
      {showDeleteDialog && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteDialog(false);
              setSurveyToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-90 zoom-in-90"
            onKeyDown={(e) => {
              // Fechar com a tecla ESC
              if (e.key === 'Escape') {
                setShowDeleteDialog(false);
                setSurveyToDelete(null);
              }
            }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                >
                  <Trash2 className="h-5 w-5" />
                </div>
                <h2 
                  id="delete-dialog-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Excluir Pesquisa
                </h2>
              </div>
              
              <p 
                id="delete-dialog-description"
                className="text-gray-600 dark:text-gray-300 mb-6"
              >
                Tem certeza que deseja excluir a pesquisa "{surveyToDelete?.pergunta || surveyToDelete?.question || 'sem título'}"? 
                <span className="block mt-1 text-sm">Esta ação não pode ser desfeita.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSurveyToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="w-full sm:w-auto cancel-button hover:shadow-md transition-shadow"
                  aria-label="Cancelar e fechar diálogo"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 text-white"
                  aria-label="Confirmar exclusão da pesquisa"
                  ref={deleteButtonRef}
                  style={{ color: 'white' }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir Pesquisa'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Estilo global para quando o modal estiver aberto */}
      <style jsx global>{`
        body.modal-open {
          overflow: hidden;
        }
        
        #edit-modal-title,
        #edit-modal-title span {
          color: white !important;
        }
        
        .modal-header-text {
          color: white !important;
        }

        /* Estilo para o botão de cancelar */
        .cancel-button:hover {
          background-color: transparent !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          color: inherit !important;
        }

        /* Garantir que o botão de exclusão tenha texto branco */
        [aria-label="Confirmar exclusão da pesquisa"] {
          color: white !important;
        }
      `}</style>
      
      {/* Modal de edição */}
      {showEditModal && surveyToEdit && (
        <>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditModal(false);
                setSurveyToEdit(null);
              }
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in-90 zoom-in-90 max-h-[90vh] flex flex-col"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowEditModal(false);
                  setSurveyToEdit(null);
                }
              }}
            >
              <div className="p-0 flex flex-col">
                {/* Cabeçalho do modal */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white [&_*]:!text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-white/20 text-white">
                        <Pencil className="h-5 w-5" style={{ color: 'white !important' }} />
                      </div>
                      <h2 
                        id="edit-modal-title"
                        className="text-xl font-semibold modal-header-text"
                        style={{ color: '#ffffff !important' }}
                      >
                        <span className="modal-header-text" style={{ color: '#ffffff !important' }}>Editar Pesquisa</span>
                      </h2>
                    </div>
                    <button 
                      onClick={() => {
                        setShowEditModal(false);
                        setSurveyToEdit(null);
                      }}
                      className="rounded-full p-1 hover:bg-white/20 transition-colors"
                      aria-label="Fechar modal"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Conteúdo do formulário */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSurvey();
                  }} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-store" className="text-gray-700 font-medium">Loja</Label>
                        <Select 
                          value={surveyToEdit.loja || ''}
                          onValueChange={(value) => {
                            setSurveyToEdit({
                              ...surveyToEdit,
                              loja: value
                            });
                          }}
                        >
                          <SelectTrigger className="w-full border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                            <SelectValue placeholder="Selecione uma loja" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                    </div>
                    
                      <div className="space-y-2">
                        <Label htmlFor="edit-question" className="text-gray-700 font-medium">Pergunta</Label>
                        <textarea
                          id="edit-question"
                          value={(() => {
                            const perguntaCompleta = surveyToEdit.pergunta || surveyToEdit.question || '';
                            return perguntaCompleta;
                          })()}
                          onChange={(e) => {
                            const newQuestion = e.target.value;
                            setSurveyToEdit({
                              ...surveyToEdit,
                              pergunta: newQuestion
                            });
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 whitespace-pre-wrap overflow-y-auto"
                          style={{ 
                            whiteSpace: 'pre-wrap',
                            height: '120px',
                            resize: 'none',
                            maxHeight: '200px'
                          }}
                        />
                    </div>
                    
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-gray-700 font-medium">Opções</Label>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="edit-step" className="text-sm text-gray-600">Passo:</Label>
                            <Input 
                              id="edit-step"
                              type="number" 
                              min={1}
                              value={surveyToEdit.passo || surveyToEdit.step || 1}
                              onChange={(e) => {
                                const newStep = parseInt(e.target.value) || 1;
                                setSurveyToEdit({
                                  ...surveyToEdit,
                                  passo: newStep
                                });
                              }}
                              className="w-20 h-8 text-sm border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                        </div>
                      
                        {/* Opções da pesquisa */}
                        {(() => {
                          // Extrair opções do campo combinado ou do campo opcoes
                          let options: string[] = [];
                          
                          if (surveyToEdit.opcoes && typeof surveyToEdit.opcoes === 'string') {
                            options = surveyToEdit.opcoes.split(';');
                          } else if (surveyToEdit.options && Array.isArray(surveyToEdit.options)) {
                            options = surveyToEdit.options;
                          } else {
                            // Fallback para opções padrão
                            options = ["Ótimo", "Bom", "Regular", "Ruim"];
                          }
                          
                          return options.map((option, index) => (
                            <Input
                              key={`option-${index}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                
                                // Atualizar o estado com as novas opções
                                setSurveyToEdit({
                                  ...surveyToEdit,
                                  opcoes: newOptions.join(';')
                                });
                              }}
                              className="border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 mb-2"
                            />
                          ));
                        })()}
                      </div>
                    </div>
                  
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEditModal(false);
                          setSurveyToEdit(null);
                        }}
                        disabled={isEditing}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isEditing}
                        className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        {isEditing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span className="modal-header-text" style={{ color: 'white !important' }}>Salvando...</span>
                          </>
                        ) : (
                          <span className="modal-header-text" style={{ color: 'white !important' }}>Salvar Alterações</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function SurveysPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_pesquisas">
      <SurveysPageContent />
    </ProtectedRouteWithPermission>
  )
}

