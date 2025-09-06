"use client";

import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, X, Upload, Check, AlertCircle, Trash, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { birthdayService, type BirthdayMessage } from '@/lib/birthday-service';
import { shotLojasService } from '@/lib/shot-lojas';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProtectedRouteWithPermission } from '@/components/protected-route-with-permission';
import { getDisplaySubnet, formatSubnetDisplay, getSubnetDisplayState, type UserData } from '@/lib/subnet-utils';
import { MediaPreview } from '@/components/ui/media-preview';
import { MediaModal } from '@/components/ui/media-modal';

type FileWithPreview = File & {
  preview?: string;
};

function BirthdaysPageContent() {
  const [selectedStore, setSelectedStore] = useState('');
  const [stores, setStores] = useState<{id: string, name: string}[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Carregar dados do usuário primeiro
  const loadUserData = async () => {
    try {
      if (!user?.email) {
        console.warn('Email do usuário ainda não carregado, aguardando...');
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
      const isSuperAdmin = userData.nivel === 'Super Admin';
      
      if (isSuperAdmin) {
        // Super Admin vê todas as lojas da sua rede
        // Usar dados do contexto se não estiverem nos dados do banco
        const rede = userData.rede || user?.rede || '';
        
        console.log('Usuário é Super Admin, buscando lojas da rede:', rede);
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
        console.log('Lojas carregadas para Super Admin:', lojasFormatadas);
      } else {
        // Usuários normais veem apenas sua loja específica
        const userLoja = userData.loja || '';
        console.log('Usuário não é Super Admin. Loja do usuário:', userLoja);
        
        if (userLoja) {
          // Mostrar apenas a loja do usuário
          const lojasFormatadas = [{
            id: userLoja,
            name: userLoja
          }];
          setStores(lojasFormatadas);
          
          // Garantir que a loja do usuário está selecionada
          if (selectedStore !== userLoja) {
            setSelectedStore(userLoja);
          }
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
    
    // Verificar se o usuário está carregado antes de prosseguir
    if (!user?.email) {
      console.log('Usuário ainda não carregado, pulando carregamento de dados');
      return;
    }
    
    // 1. Primeiro buscar dados do usuário
    const userData = await loadUserData();
    
    // 2. Depois carregar lojas baseado nos dados do usuário
    if (userData) {
      await loadLojas(userData);
    }
    
    console.log('Carregamento de dados do usuário e lojas concluído');
  };
  
  // Removido o useEffect duplicado que causava o problema de ordem de carregamento
  const modalRef = useRef<HTMLDivElement>(null);
  const maxLength = 500;
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<BirthdayMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const toggleFullscreen = () => {
    setShowModal(true);
  };

  const closeModal = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  // Estado para armazenar informações do usuário logado
  const [user, setUser] = useState<UserData | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [userLoadError, setUserLoadError] = useState<string | null>(null);
  
  // Estado para armazenar dados do usuário do banco
  const [userBankData, setUserBankData] = useState<any>(null);

  // Carregar usuário a partir do cookie de sessão
  useEffect(() => {
    const loadUserFromSession = async () => {
      try {
        setUserLoadError(null);
        
        // Verificar se há cookie de sessão
        const cookies = document.cookie;
        const sessionMatch = cookies.match(/ps_session=([^;]+)/);
        
        if (!sessionMatch) {
          console.log('Nenhuma sessão encontrada');
          setIsUserLoaded(true);
          return;
        }

        const sessionValue = sessionMatch[1];
        const email = sessionValue.split('_')[0]; // Extrair email da sessão
        
        console.log('Email da sessão:', email);

        // Buscar dados do usuário via API
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Incluir cookies para autenticação
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Dados do usuário carregados:', userData);
          setUser(userData);
          // O useEffect vai detectar a mudança do user e chamar loadUserDataAndLojas
        } else {
          const errorText = await response.text();
          console.error('Erro ao carregar dados do usuário:', errorText);
          setUserLoadError('Erro ao carregar dados do usuário');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setUserLoadError('Erro de conexão ao carregar usuário');
      } finally {
        setIsUserLoaded(true);
      }
    };

    loadUserFromSession();
  }, []);

  // Carregar dados do usuário e lojas quando o usuário for definido
  useEffect(() => {
    if (user?.email) {
      loadUserDataAndLojas();
    }
  }, [user?.email]);

  // Buscar mensagens ao carregar o componente (apenas quando o usuário estiver carregado)
  useEffect(() => {
    if (!isUserLoaded || !user || !userBankData) return;

    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const data = await birthdayService.getBirthdayMessages(user, userBankData);
        setMessages(data);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [isUserLoaded, userBankData]);

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = format(date, "dd/MM/yyyy 'às' HH:mm");
      return formattedDate;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função para abrir o modal de edição
  const handleEditClick = (message: BirthdayMessage) => {
    setEditingMessage({
      id: message.id!,
      mensagem: message.mensagem,
      loja: message.loja,
      status: message.status || 'ativo', // Valor padrão 'ativo' se status for null/undefined
      url_foto: message.url_foto || null,
      file: null,
      preview: message.url_foto || null
    });
    setShowEditModal(true);
  };

  // Função para lidar com a mudança de arquivo no formulário de edição
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingMessage) return;
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Verificar o tipo de arquivo
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      toast.error('Por favor, selecione um arquivo de imagem ou vídeo válido.');
      return;
    }

    // Criar um objeto URL para visualização
    const fileUrl = URL.createObjectURL(selectedFile);
    
    // Atualizar o estado com o novo arquivo e preview
    setEditingMessage({
      ...editingMessage,
      file: selectedFile,
      preview: fileUrl
    });
  };

  // Função para salvar as alterações da mensagem
  const handleSaveChanges = async () => {
    if (!editingMessage || !user) return;
    
    try {
      setLoading(true);
      let publicUrl = editingMessage.url_foto || null;
      
      // Se houver uma nova imagem, fazer upload
      if (editingMessage.file) {
        const supabase = createClient();
        const fileNameParts = editingMessage.file.name.split('.');
        const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() as string : 'jpg';
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `birthdays/${fileName}`;
        
        // Deletar a imagem antiga se existir
        if (editingMessage.url_foto) {
          const oldFileName = editingMessage.url_foto.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('praiseshot')
              .remove([`birthdays/${oldFileName}`]);
          }
        }
        
        // Fazer upload da nova imagem
        const { error: uploadError } = await supabase.storage
          .from('praiseshot')
          .upload(filePath, editingMessage.file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl: url } } = supabase.storage
          .from('praiseshot')
          .getPublicUrl(filePath);
          
        publicUrl = url;
      }
      
      // Garantir que os dados da sub_rede e rede sejam mantidos
      const updateData = {
        mensagem: editingMessage.mensagem,
        loja: editingMessage.loja,
        status: editingMessage.status,
        url_foto: publicUrl || null,
        // Não alteramos rede e subRede para manter a mensagem na mesma sub_rede
      };
      
      // Atualizar a mensagem
      await birthdayService.updateBirthdayMessage(editingMessage.id, updateData);
      
      // Atualizar a lista de mensagens
      setMessages(messages.map(msg => 
        msg.id === editingMessage.id 
          ? { 
              ...msg, 
              ...updateData,
              // Mantemos os dados originais de rede e subRede
              rede: msg.rede,
              subRede: msg.subRede,
              bot: msg.bot,
              criador: msg.criador
            } 
          : msg
      ));
      
      toast.success('Mensagem atualizada com sucesso!');
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Erro ao atualizar mensagem:', error);
      toast.error(error.message || 'Erro ao atualizar mensagem');
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar o status da mensagem
  const toggleMessageStatus = async (message: BirthdayMessage) => {
    if (!message.id) return;
    
    try {
      const newStatus = message.status === 'ATIVADO' ? 'DESATIVADO' : 'ATIVADO';
      await birthdayService.updateBirthdayMessage(message.id, { status: newStatus });
      
      // Atualiza a lista local
      const updatedMessages = messages.map(msg => 
        msg.id === message.id ? { ...msg, status: newStatus } : msg
      );
      setMessages(updatedMessages);
      
      toast.success(`Mensagem ${newStatus.toLowerCase()} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da mensagem');
    }
  };

  // Estados para o diálogo de confirmação de exclusão
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<{id: string, imageUrl?: string | null} | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{mensagem: string, loja: string} | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  
  // Controla o scroll da página quando os modais estiverem abertos
  const isAnyModalOpen = showModal || showEditModal || showMessageModal || showImageModal || showDeleteConfirmation || showMediaModal;
  
  // Efeito para evitar que a página role quando um modal estiver aberto
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isAnyModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isAnyModalOpen]);
  
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    mensagem: string;
    loja: string;
    status: string | null;
    url_foto: string | null;
    file: File | null;
    preview: string | null;
  } | null>(null);

  // Função para abrir o diálogo de confirmação de exclusão
  const handleDeleteClick = (id: string, imageUrl?: string | null) => {
    setMessageToDelete({id, imageUrl});
    setShowDeleteConfirmation(true);
  };

  // Função para deletar uma mensagem e sua imagem
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      await birthdayService.deleteBirthdayMessage(messageToDelete.id, messageToDelete.imageUrl);
      setMessages(messages.filter(msg => msg.id !== messageToDelete.id));
      toast.success('Mensagem excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast.error('Erro ao excluir mensagem');
    } finally {
      setShowDeleteConfirmation(false);
      setMessageToDelete(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Verificar se é vídeo ou imagem
      const isVideo = selectedFile.type.startsWith('video/');
      
      if (isVideo) {
        try {
          // Para vídeos, gerar thumbnail do primeiro frame
          const videoUrl = URL.createObjectURL(selectedFile);
          const { generateVideoThumbnail } = await import('@/lib/media-utils');
          const thumbnail = await generateVideoThumbnail(videoUrl);
          setPreview(thumbnail);
          
          // Limpar o URL do objeto após usar
          URL.revokeObjectURL(videoUrl);
        } catch (error) {
          console.error('Erro ao gerar thumbnail do vídeo:', error);
          // Fallback: usar o arquivo como preview (vai mostrar ícone de vídeo)
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        }
      } else {
        // Para imagens, usar FileReader normal
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 w-full flex justify-center">
      <div className="w-full max-w-full sm:max-w-6xl px-2 sm:px-4 space-y-6 sm:space-y-8">
        <style jsx global>{`
          #birthday-message::placeholder {
            color: #6B7280 !important;
            opacity: 1 !important;
          }
          
          /* Estilo para o botão de cancelar */
          .cancel-button:hover {
            background-color: transparent !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            color: inherit !important;
          }
        `}</style>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
          <div className="w-full sm:flex-1 sm:max-w-3xl space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loja</label>
            {userBankData?.nivel === 'Super Admin' ? (
              <Select 
                value={selectedStore} 
                onValueChange={setSelectedStore}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma loja" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : userBankData?.loja ? (
              <Select 
                value={userBankData.loja}
                onValueChange={setSelectedStore}
                disabled
              >
                <SelectTrigger className="w-full">
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
          <div className="w-full sm:w-auto flex-shrink-0 flex items-end">
            <div className="flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-gray-100 rounded-md text-xs sm:text-sm text-gray-600 whitespace-nowrap h-9 sm:h-10 mt-2 sm:mt-6 w-full sm:w-auto">
              Sub-rede: {formatSubnetDisplay(getSubnetDisplayState(!isUserLoaded, user, userLoadError))}
            </div>
          </div>
        </div>
        
        {showModal && (
          <div 
            ref={modalRef}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <div className="relative max-h-[90vh] max-w-[95vw] sm:max-w-4xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {file && file.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
                  style={{ maxWidth: '100%', maxHeight: '85vh' }}
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : (
                <img
                  src={preview || ''}
                  alt="Visualização em tela cheia"
                  className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
                />
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
           {/* Ativar/Desativar */}
           <div className="flex items-center gap-3">
             <Switch id="active-switch" checked={isActive} onCheckedChange={setIsActive} />
             <label htmlFor="active-switch" className="text-sm text-gray-700 select-none">
               {isActive ? 'Ativado' : 'Desativado'}
             </label>
           </div>

           {/* Campo de Mensagem de Aniversário */}
          <div className="space-y-2">
          <label htmlFor="birthday-message" className="block text-sm font-medium text-gray-700">
            Mensagem de Aniversário
          </label>
          <div className="relative">
            <Textarea
              id="birthday-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={maxLength}
              placeholder="Digite sua mensagem de aniversário aqui..."
              className="w-full h-[120px] text-base border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-500"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              {message.length}/{maxLength}
            </div>
          </div>

        </div>

        {/* Campo de Upload de Imagem Moderno */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Mídia
          </label>
          <div className="relative rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 p-0.5">
            <div className="overflow-hidden rounded-xl bg-white p-6">
                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Pré-visualização"
                      className="mx-auto h-48 w-full rounded-lg object-cover shadow-sm transition-all duration-300 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="scale-0 rounded-full bg-white/90 p-2 text-blue-500 shadow-lg transition-all duration-200 hover:bg-white group-hover:scale-100"
                        title="Expandir imagem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0-4h-4m4 0l-5 5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="scale-0 rounded-full bg-white/90 p-2 text-red-500 shadow-lg transition-all duration-200 hover:bg-white group-hover:scale-100"
                        title="Remover imagem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                      <svg
                        className="h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <defs>
                          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                        <path
                          stroke="url(#iconGradient)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                      </svg>
                    </div>
                    <div className="mt-4 flex flex-col items-center justify-center text-sm">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 px-4 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        <span>Selecionar mídia</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        ou arraste e solte aqui
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        PNG, JPG, GIF, MP4, WebM (máx. 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 transition-all duration-300 group-hover:opacity-100"></div>
            </div>
          </div>
        </div>

        {/* Botão de Cadastrar */}
        <div className="pt-6">
          <Button 
            className={`w-full py-4 sm:py-6 text-sm sm:text-base font-medium transition-all duration-200 ${
              selectedStore && message
                 ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
             disabled={!selectedStore || !message || loading}
             onClick={async () => {
               if (!selectedStore || !message || !user) return;
               try {
                 setLoading(true);
                 let url = null;
                 if (file) {
                   const supabase = createClient();
                   const fileExt = file.name.split('.').pop() || 'jpg';
                   const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                   const filePath = `birthdays/${fileName}`;
                   const { error: uploadError } = await supabase.storage.from('praiseshot').upload(filePath, file);
                   if (uploadError) throw uploadError;
                   const { data: { publicUrl } } = supabase.storage.from('praiseshot').getPublicUrl(filePath);
                   url = publicUrl;
                 }
                 
                 // Criar mensagem com os dados do usuário logado
                 const saved = await birthdayService.createBirthdayMessage({
                   mensagem: message,
                   loja: selectedStore,
                   status: isActive ? 'ATIVADO' : 'DESATIVADO',
                   url_foto: url
                 }, user);
                 
                 toast.success('Mensagem cadastrada com sucesso!');
                 
                 // Limpar formulário
                 setMessage('');
                 setSelectedStore('');
                 setFile(null);
                 setPreview(null);
                 setIsActive(true);
                 
                 // Recarregar mensagens filtradas pela sub_rede do usuário
                const fetchMessagesNow = async () => {
                  try {
                    setIsLoadingMessages(true);
                    const data = await birthdayService.getBirthdayMessages(user, userBankData);
                    setMessages(data);
                  } catch (error) {
                    console.error('Erro ao buscar mensagens:', error);
                  } finally {
                    setIsLoadingMessages(false);
                  }
                };
                 fetchMessagesNow();
               } catch (error) {
                 console.error('Erro ao cadastrar mensagem:', error);
                 toast.error('Erro ao cadastrar mensagem. Tente novamente.');
               } finally {
                 setLoading(false);
               }
             }}
          >
            <span className="flex items-center justify-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Cadastrar Mensagem de Aniversário
            </span>
          </Button>
        </div>

        {/* Seção de Mensagens Cadastradas */}
        <div className="mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Mensagens Cadastradas</h2>
            {user && (
              <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-full sm:w-auto text-center sm:text-left">
                Filtrando por: <span className="font-medium">{user.sub_rede || 'Todas'}</span>
              </div>
            )}
          </div>
          
          {!isUserLoaded ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !user ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Você precisa estar logado para visualizar as mensagens de aniversário.
                  </p>
                </div>
              </div>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.5 3.5v17m0 0H5m4.5 0h4.5m4.5-17v17m0 0h-4.5m4.5 0h4.5" />
                </svg>
              </div>
              <h3 className="text-gray-700 font-medium mb-1">Nenhuma mensagem encontrada</h3>
              <p className="text-gray-500 text-sm mb-4">
                Não há mensagens de aniversário cadastradas para a sub-rede <span className="font-medium">{user.sub_rede}</span>.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
              <div className="w-full overflow-x-auto px-2 sm:px-0">
                <table className="w-full min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50 hidden sm:table-header-group">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mídia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loja
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mensagem
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Criação
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50 flex flex-col sm:table-row border-b sm:border-none pb-4 sm:pb-0 mb-6 sm:mb-0 w-full rounded-lg sm:rounded-none">

                        <td className="px-3 py-3 whitespace-nowrap flex items-center sm:table-cell w-full sm:w-auto">
                          <div className="flex items-center justify-between w-full sm:justify-start">
                            <span className="sm:hidden font-medium text-gray-500 mr-2 w-20 flex-shrink-0">Mídia:</span>
                            <MediaPreview
                              url={message.url_foto}
                              alt="Preview da mensagem"
                              className="w-12 h-12 rounded-md"
                              onClick={() => {
                                setSelectedMedia(message.url_foto);
                                setShowMediaModal(true);
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 flex flex-col sm:table-cell border-t sm:border-0 pt-3 sm:pt-0">
                          <span className="sm:hidden font-medium text-gray-500 mb-1 block">Loja:</span>
                          <span className="text-sm font-medium text-gray-900">Loja {message.loja}</span>
                        </td>
                        <td 
                          className="px-4 sm:px-6 py-2 sm:py-4 flex flex-col sm:table-cell border-t sm:border-0 pt-2 sm:pt-0 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setSelectedMessage({
                              mensagem: message.mensagem,
                              loja: message.loja
                            });
                            setShowMessageModal(true);
                          }}
                        >
                          <span className="sm:hidden font-medium text-gray-500 mb-1 block">Mensagem:</span>
                          <div className="line-clamp-3 sm:line-clamp-2 text-sm text-gray-700 w-full text-left">
                            {message.mensagem}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 flex flex-col sm:table-cell border-t sm:border-0 pt-3 sm:pt-0">
                          <span className="sm:hidden font-medium text-gray-500 mb-1 block">Status:</span>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-16 justify-center ${
                            message.status === 'ATIVADO' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {message.status === 'ATIVADO' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 flex flex-col sm:table-cell border-t sm:border-0 pt-3 sm:pt-0">
                          <span className="sm:hidden font-medium text-gray-500 mb-1 block">Data:</span>
                          {message.created_at ? formatDate(message.created_at) : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 flex flex-col sm:table-cell border-t sm:border-0 pt-3 sm:pt-0">
                          <span className="sm:hidden font-medium text-gray-500 mb-2 block">Ações:</span>
                          <div className="flex items-center justify-between space-x-4 w-full sm:w-auto sm:justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(message);
                              }}
                              className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50"
                              title="Editar mensagem"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMessageStatus(message);
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${message.status === 'ATIVADO' ? 'bg-blue-600' : 'bg-gray-200'}`}
                                role="switch"
                                aria-checked={message.status === 'ATIVADO'}
                                title={message.status === 'ATIVADO' ? 'Desativar mensagem' : 'Ativar mensagem'}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`${message.status === 'ATIVADO' ? 'translate-x-6' : 'translate-x-1'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                />
                              </button>
                              <span className="ml-2 text-sm text-gray-600">
                                <span className="font-medium text-gray-700">
                                  {message.status === 'ATIVADO' ? 'Ativo' : 'Inativo'}
                                </span>
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(message.id!, message.url_foto || undefined);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Excluir mensagem"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>


      </div>
      {/* Modal de visualização da imagem */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Imagem em tela cheia" 
                className="max-h-[90vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de edição de mensagem */}
      {showEditModal && editingMessage && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl overflow-hidden animate-in fade-in-90 zoom-in-90"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Mensagem
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Campo da Loja */}
                <div>
                  <label htmlFor="edit-store" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loja
                  </label>
                  <input
                    type="text"
                    id="edit-store"
                    value={editingMessage.loja}
                    onChange={(e) => setEditingMessage({...editingMessage, loja: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Número da loja"
                  />
                </div>
                
                {/* Campo da Mensagem */}
                <div>
                  <label htmlFor="edit-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    id="edit-message"
                    rows={4}
                    value={editingMessage.mensagem}
                    onChange={(e) => setEditingMessage({...editingMessage, mensagem: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Digite a mensagem de aniversário"
                  />
                </div>
                
                {/* Upload de Imagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mídia
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="group relative flex justify-center items-center w-full h-32 px-4 transition border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {editingMessage.preview ? (
                        <div 
                          className="w-full h-full rounded-md bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={editingMessage.preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Clique para fazer upload de uma imagem
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleEditFileChange}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex items-center">
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${editingMessage.status === 'ATIVADO' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    role="switch"
                    aria-checked={editingMessage.status === 'ATIVADO'}
                    onClick={() => setEditingMessage({
                      ...editingMessage,
                      status: editingMessage.status === 'ATIVADO' ? 'DESATIVADO' : 'ATIVADO'
                    })}
                  >
                    <span
                      aria-hidden="true"
                      className={`${editingMessage.status === 'ATIVADO' ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                  <span className="ml-3 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {editingMessage.status === 'ATIVADO' ? 'Ativo' : 'Inativo'}
                    </span>
                  </span>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={loading || !editingMessage.loja || !editingMessage.mensagem}
                    className={`w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${(loading || !editingMessage.loja || !editingMessage.mensagem) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de visualização da mensagem */}
      {showMessageModal && selectedMessage && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMessageModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[95%] sm:max-w-md overflow-hidden animate-in fade-in-90 zoom-in-90"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mensagem da Loja {selectedMessage.loja}
                </h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                  {selectedMessage.mensagem}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmação de exclusão */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={(e) => {
               if (e.target === e.currentTarget) {
                 setShowDeleteConfirmation(false);
                 setMessageToDelete(null);
               }
             }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-90 zoom-in-90"
               onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <Trash className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Excluir Mensagem
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tem certeza que deseja excluir esta mensagem? 
                <span className="block mt-1 text-sm">Esta ação não pode ser desfeita.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setMessageToDelete(null);
                  }}
                  className="w-full sm:w-auto cancel-button"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteMessage}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Excluir Mensagem
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mídia */}
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        mediaUrl={selectedMedia}
        alt="Mídia da mensagem de aniversário"
      />
    </div>
  );
}

export default function BirthdaysPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_aniversarios">
      <BirthdaysPageContent />
    </ProtectedRouteWithPermission>
  )
}
