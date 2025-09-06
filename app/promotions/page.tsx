"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { promotionSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Upload, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import type { z } from "zod"
import { promotionService } from "@/lib/promotion-service"
import { createClient } from "@/lib/supabase-client"
import { shotLojasService } from "@/lib/shot-lojas"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRouteWithPermission } from "@/components/protected-route-with-permission"
import { resolveUserNetwork, handleNetworkResolutionFailure } from "@/lib/network-utils"

type PromotionForm = z.infer<typeof promotionSchema>

function PromotionsPageContent() {
  const { user } = useAuth();
  // Estado para armazenar a lista de promoções
  interface Promotion {
    id: string;
    title: string;
    description: string;
    image_url: string;
    is_active: boolean;
    store_id: number;
  }

  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Carrega promoções do Supabase ao montar
  const loadPromotions = async () => {
    try {
      if (!user) {
        console.warn('⚠️ Usuário não autenticado para carregar promoções')
        return
      }
      
      // Buscar dados atualizados do usuário do banco
      const userDataFromBank = await loadUserData();
      
      if (!userDataFromBank) {
        console.error('Não foi possível carregar dados do usuário do banco')
        return
      }
      
      const userData = {
        email: userDataFromBank.email,
        rede: userDataFromBank.rede || undefined,
        empresa: userDataFromBank.empresa,
        sub_rede: userDataFromBank.subrede || undefined,
        instancia: userDataFromBank.instancia || undefined
      }
      
      // Validar consistência da rede resolvida
      const resolvedNetwork = resolveUserNetwork(userData);
      console.log('🔍 [NETWORK-CONSISTENCY] Rede resolvida para promoções:', resolvedNetwork);
      console.log('[PROMOTIONS] Dados do usuário para buscar promoções:', userData);
      
      if (!resolvedNetwork) {
        handleNetworkResolutionFailure(userData, (message) => {
          console.warn('⚠️ [LOAD-PROMOTIONS]', message);
          setErrorMsg(`Erro ao carregar promoções: ${message}`);
        });
        return;
      }
      
      const data = await promotionService.getPromotions(userData)
      setPromotions(data)
    } catch (err) {
      console.error('Erro ao carregar promoções:', err)
      setErrorMsg('Erro ao carregar promoções')
      setTimeout(() => setErrorMsg(''), 4000)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, []);


  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{
    id: string;
    title: string;
    description: string;
    image_url: string;
    is_active: boolean;
    store_id: number;
  } | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);
  const [selectedDescriptionText, setSelectedDescriptionText] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Controle de scroll quando o modal estiver aberto
  useEffect(() => {
    if (isTextModalOpen) {
      // Bloqueia o scroll da página
      document.body.style.overflow = 'hidden';
    } else {
      // Restaura o scroll da página
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup quando o componente for desmontado
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isTextModalOpen]);
  
  // Estado para armazenar a lista de lojas
  const [stores, setStores] = useState<{id: string, name: string}[]>([]);
  // Estado para controlar se uma loja foi selecionada
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  // Estado para controlar se houve tentativa de envio do formulário
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);
  // Estado para armazenar dados do usuário do banco
  const [userBankData, setUserBankData] = useState<any>(null);
  
  // Carrega dados do usuário do banco
  const loadUserData = async () => {
    try {
      if (!user?.email) {
        console.error('Email do usuário não encontrado');
        return null;
      }

      console.log('Buscando dados do usuário no banco...');
      
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
      
      setUserBankData(userData);
      return userData;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  };

  // Carregar lojas usando a mesma lógica de resolução de rede das promoções
  const loadStores = async () => {
    try {
      // Primeiro carrega os dados do usuário
      const userData = await loadUserData();
      
      if (!userData) {
        console.warn('⚠️ Dados do usuário não encontrados');
        setErrorMsg('Erro ao carregar permissões do usuário.');
        return;
      }

      // Usar a mesma função de resolução de rede das promoções
      const resolvedNetwork = resolveUserNetwork(userData);
      
      if (!resolvedNetwork) {
        handleNetworkResolutionFailure(userData, (message) => {
          console.warn('⚠️ [LOAD-STORES]', message);
          setErrorMsg(`Erro ao carregar lojas: ${message}`);
        });
        setStores([]);
        return;
      }

      // Verificar se o usuário é Super Admin
      const isSuperAdmin = userData.nivel === 'Super Admin';
      
      if (isSuperAdmin) {
        // Super Admin vê todas as lojas da sua rede resolvida
        console.log(`✅ [Super Admin] Buscando todas as lojas da rede resolvida: ${resolvedNetwork}`);
        
        const todasLojas = await shotLojasService.getLojasPorUsuario(resolvedNetwork);
        const lojasFormatadas = todasLojas.map(loja => ({
          id: loja,
          name: loja
        }));
        
        setStores(lojasFormatadas);
        console.log(`✅ [Super Admin] ${lojasFormatadas.length} lojas carregadas para rede: ${resolvedNetwork}`);
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
          
          // Auto-selecionar a loja do usuário
          setSelectedStoreId(userLoja);
          setValue('store_id', Number.parseInt(userLoja));
          console.log('Loja definida para usuário normal:', lojasFormatadas);
        } else {
          console.error('Usuário não tem loja definida');
          setStores([]);
        }
      }
      
      // Validar consistência: verificar se a rede resolvida é a mesma usada nas promoções
      console.log('🔍 [NETWORK-CONSISTENCY] Rede resolvida para lojas:', resolvedNetwork);
      
      // Limpar mensagem de erro se houver
      if (errorMsg) {
        setErrorMsg('');
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao carregar lojas:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        userData: userData ? {
          rede: userData.rede,
          empresa: userData.empresa,
          sub_rede: userData.sub_rede
        } : 'Não disponível'
      });
      setErrorMsg('Erro ao carregar lojas disponíveis. Tente novamente.');
      setStores([]);
    }
  };
  
  // Carregar lojas quando o componente for montado
  useEffect(() => {
    const loadData = async () => {
      await loadStores();
    };
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: "",
      description: "",
      is_active: true,
    },
    mode: "onChange"
  })

  const isActiveValue = watch("is_active")

  const onSubmit = async (data: PromotionForm) => {
    // Marcar que houve tentativa de envio do formulário
    setFormSubmitAttempted(true);

    try {
      if (!user) {
        setErrorMsg("Erro de autenticação. Faça login novamente.");
        setTimeout(() => setErrorMsg(""), 4000)
        return;
      }

      // Buscar dados atualizados do usuário do banco
      const userDataFromBank = await loadUserData();
      
      if (!userDataFromBank) {
        setErrorMsg("Não foi possível carregar dados do usuário. Tente novamente.");
        setTimeout(() => setErrorMsg(""), 4000)
        return;
      }

      const userData = {
        email: userDataFromBank.email,
        rede: userDataFromBank.rede || undefined,
        empresa: userDataFromBank.empresa,
        sub_rede: userDataFromBank.subrede || undefined,
        instancia: userDataFromBank.instancia || undefined
      }

      // Validar consistência da rede antes de criar a promoção
      const resolvedNetwork = resolveUserNetwork(userData);
      console.log('🔍 [NETWORK-CONSISTENCY] Rede resolvida para criação de promoção:', resolvedNetwork);
      
      if (!resolvedNetwork) {
        handleNetworkResolutionFailure(userData, (message) => {
          console.error('❌ [CREATE-PROMOTION]', message);
          setErrorMsg(`Erro ao criar promoção: ${message}`);
        });
        setTimeout(() => setErrorMsg(""), 4000);
        return;
      }

      const created = await promotionService.createPromotion({
        title: data.title,
        description: data.description || "",
        image_url: imagePreview || "/placeholder.svg",
        is_active: data.is_active,
        store_id: data.store_id || 0,
      }, userData)
      
      setPromotions([...promotions, created])
      reset()
      setImagePreview("")
      setSelectedStoreId(null) // Reset da seleção de loja
      setSuccessMsg("Promoção criada com sucesso!");
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (error) {
      console.error('❌ Erro ao criar promoção:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('rede')) {
          setErrorMsg(`Erro de rede: ${error.message}`);
        } else if (error.message.includes('permissão')) {
          setErrorMsg(`Erro de permissão: ${error.message}`);
        } else {
          setErrorMsg(`Erro ao criar promoção: ${error.message}`);
        }
      } else {
        setErrorMsg("Erro desconhecido ao criar promoção");
      }
      
      setTimeout(() => setErrorMsg(""), 6000); // Longer timeout for detailed messages
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar o tipo do arquivo
    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (!validImageTypes.includes(fileType) && !validVideoTypes.includes(fileType)) {
      setErrorMsg('Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF) ou vídeos (MP4, WebM)');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    // Limitar o tamanho do arquivo para 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMsg('Arquivo muito grande. O tamanho máximo permitido é 10MB');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    try {
      // Cria um preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
          reader.readAsDataURL(file);
      
      const supabase = createClient();
      
      // Nome da pasta fixa para todas as promoções
      const folderName = 'promocoes-1';
      
      // No Supabase Storage, as pastas são virtuais e são criadas automaticamente
      // quando um arquivo é enviado com o caminho incluindo a pasta
      
      // Função para sanitizar o nome do arquivo, removendo caracteres especiais e acentos
      const sanitizeFileName = (name: string): string => {
        // Remove acentos e caracteres especiais
        return name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres não alfanuméricos por _
          .replace(/_{2,}/g, '_'); // Substitui múltiplos _ por um único
      };
      
      // Extrai a extensão do arquivo
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Gera um nome de arquivo único e sanitizado para evitar colisões e problemas de caracteres especiais
      const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
      const filePath = `${folderName}/${fileName}`;

      console.log(`📤 Tentando fazer upload para: ${folderName}/${fileName}`);
      
      // Primeira tentativa: usar a pasta promocoes-1
      let uploadData;
      let uploadError;
      let finalFilePath = filePath;
      
      try {
        const result = await supabase.storage
          .from('praiseshot')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        uploadData = result.data;
        uploadError = result.error;
        
        if (uploadError) {
          console.error('❌ Erro na primeira tentativa de upload:', {
            message: uploadError.message,
            name: uploadError.name,
            filePath,
            fileSize: file.size,
            fileType: file.type
          });
          
          // Segunda tentativa: usar a pasta promotions (compatibilidade)
          console.log('🔄 Tentando upload alternativo para pasta promotions...');
          
          const alternativeFolderName = 'promotions';
          const alternativeFilePath = `${alternativeFolderName}/${fileName}`;
          
          const alternativeResult = await supabase.storage
            .from('praiseshot')
            .upload(alternativeFilePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          uploadData = alternativeResult.data;
          uploadError = alternativeResult.error;
          
          if (!uploadError) {
            console.log('✅ Upload alternativo realizado com sucesso!');
            finalFilePath = alternativeFilePath;
          } else {
            console.error('❌ Erro na tentativa alternativa de upload:', {
              message: uploadError.message,
              name: uploadError.name,
              alternativeFilePath
            });
            throw uploadError;
          }
        } else {
          console.log('✅ Upload realizado com sucesso na primeira tentativa!');
        }
      } catch (error) {
        console.error('❌ Erro geral no processo de upload:', error);
        throw error;
      }
      
      console.log('✅ Upload concluído:', uploadData);

      // Obtém a URL pública do arquivo usando o caminho final (que pode ser o alternativo)
      const { data: { publicUrl } } = supabase.storage
        .from('praiseshot')
        .getPublicUrl(finalFilePath);

      console.log('🌐 URL pública gerada:', publicUrl);
      
      // Atualiza o preview com a URL pública
      setImagePreview(publicUrl);
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      setErrorMsg('Erro ao fazer upload do arquivo');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const togglePromotionStatus = async (id: string) => {
    const promo = promotions.find(p => p.id === id)
    if (!promo) return
    const newStatus = !promo.is_active
    try {
      await promotionService.updateStatus(id, newStatus)
      // Atualiza a lista de promoções
      setPromotions(promotions.map(p => p.id === id ? { ...p, is_active: newStatus } : p))
      
      // Atualiza também o selectedPromotion se for a mesma promoção
      if (selectedPromotion && selectedPromotion.id === id) {
        setSelectedPromotion({ ...selectedPromotion, is_active: newStatus })
      }
    } catch (err) {
      setErrorMsg('Erro ao atualizar status da promoção');
      setTimeout(() => setErrorMsg(""), 4000)
    }
  };

  const openPromotionDetails = (promotion: any) => {
    setSelectedPromotion(promotion);
  };

  const closePromotionDetails = () => {
    setSelectedPromotion(null);
  };

  // Controlar scroll do body quando modal está aberto
  useEffect(() => {
    if (selectedPromotion) {
      // Bloquear scroll da página quando modal está aberto
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll da página quando modal está fechado
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaurar scroll quando componente desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPromotion]);

  const confirmDelete = (id: string) => {
    setPromotionToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const deletePromotion = async () => {
    if (!promotionToDelete) return;
    
    try {
      await promotionService.deletePromotion(promotionToDelete)
      setPromotions(prev => prev.filter(p => p.id !== promotionToDelete))
    } catch (err) {
      setErrorMsg('Erro ao excluir promoção');
      setTimeout(() => setErrorMsg(""), 4000)
      return
    }
    
    // Fecha o modal se estiver aberto para a promoção que está sendo excluída
    if (selectedPromotion?.id === promotionToDelete) {
      closePromotionDetails();
    }
    
    // Fecha o modal de confirmação
    setShowDeleteConfirmation(false);
    setPromotionToDelete(null);
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <Alert>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}
      {errorMsg && (
        <Alert variant="destructive">
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {/* Modal de Detalhes da Promoção */}
      {selectedPromotion && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
             onClick={closePromotionDetails}>
          <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
               onClick={e => e.stopPropagation()}
               ref={modalRef}>
            <button 
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={closePromotionDetails}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedPromotion.title}</h2>
              
              <div className="aspect-video relative mb-6 rounded-lg overflow-hidden">
                {selectedPromotion.image_url.endsWith('.mp4') || selectedPromotion.image_url.endsWith('.webm') || selectedPromotion.image_url.endsWith('.mov') ? (
                  <div className="relative w-full h-full">
                    <video
                      src={selectedPromotion.image_url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      playsInline
                      id="promotion-detail-video"
                      ref={(videoEl) => {
                        if (videoEl) {
                          const handleFullscreenChange = () => {
                            // Pausar outros vídeos quando entrar em tela cheia
                            if (document.fullscreenElement === videoEl) {
                              document.querySelectorAll('video').forEach(v => {
                                if (v.id !== 'promotion-detail-video') {
                                  v.pause();
                                  v.muted = true;
                                }
                              });
                            }
                          };
                          
                          document.addEventListener('fullscreenchange', handleFullscreenChange);
                          document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
                          document.addEventListener('mozfullscreenchange', handleFullscreenChange);
                          document.addEventListener('MSFullscreenChange', handleFullscreenChange);
                          
                          return () => {
                            document.removeEventListener('fullscreenchange', handleFullscreenChange);
                            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
                            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
                            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
                          };
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Image
                    unoptimized
                    src={selectedPromotion.image_url || "/placeholder.svg"}
                    alt={selectedPromotion.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Descrição:</h3>
                  <p className="text-gray-600 mt-1">{selectedPromotion.description || "Nenhuma descrição fornecida."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Status:</h3>
                    <Badge 
                      variant={selectedPromotion.is_active ? "default" : "secondary"} 
                      className={`mt-1 ${
                        selectedPromotion.is_active 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {selectedPromotion.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700">Loja:</h3>
                    <p className="text-gray-600 mt-1">Loja {selectedPromotion.store_id}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <Button
                    variant={selectedPromotion.is_active ? "destructive" : "default"}
                    className={`w-full ${
                      selectedPromotion.is_active 
                        ? 'bg-red-500 text-white hover:bg-red-500 hover:text-white hover:shadow-lg transition-shadow duration-200' 
                        : 'bg-green-500 text-white hover:bg-green-500 hover:text-white hover:shadow-lg transition-shadow duration-200'
                    }`}
                    onClick={() => {
                      togglePromotionStatus(selectedPromotion.id);
                    }}
                  >
                    {selectedPromotion.is_active ? "Desativar Promoção" : "Ativar Promoção"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      confirmDelete(selectedPromotion.id);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir Promoção
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirmation(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
              <p className="text-center text-gray-600">
                Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setPromotionToDelete(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={deletePromotion}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para exibir texto completo da descrição */}
      {isTextModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsTextModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Descrição Completa</h3>
              <button 
                onClick={() => setIsTextModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <p className="text-gray-600 whitespace-pre-wrap">{selectedDescriptionText}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsTextModalOpen(false)}
                className="bg-white text-gray-700 border-gray-300 hover:bg-white hover:text-gray-900 hover:shadow-md transition-all duration-200"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Formulário de Criação */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Plus className="h-5 w-5" />
            Criar Nova Promoção
          </CardTitle>
          <CardDescription className="text-gray-500">Crie e gerencie promoções para suas lojas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">Título da Promoção</Label>
                <Input id="title" placeholder="Ex: Promoção de Verão" className="text-gray-700 placeholder:text-gray-400" {...register("title")} />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_id" className="text-gray-700">Loja</Label>
                {userBankData?.nivel === 'Super Admin' ? (
                  <Select 
                    onValueChange={(value) => {
                      setValue("store_id", Number.parseInt(value), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      setSelectedStoreId(value);
                      if (formSubmitAttempted) setFormSubmitAttempted(false);
                      if (errorMsg === "Você precisa selecionar uma loja para continuar") setErrorMsg("");
                    }}
                    value={selectedStoreId || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : userBankData?.loja ? (
                  <Select 
                    value={userBankData.loja}
                    onValueChange={setSelectedStoreId}
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
                {userBankData?.nivel !== 'Super Admin' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Sua loja foi selecionada automaticamente.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="description" className="text-gray-700">Descrição</Label>
                <span 
                  className={`text-xs font-bold ${(watch("description") || "").length >= 480 ? 'text-red-700' : (watch("description") || "").length >= 400 ? 'text-amber-500' : 'text-gray-500'}`}
                >
                  {(watch("description") || "").length}/500
                </span>
              </div>
              <Textarea 
                id="description" 
                placeholder="Descreva a promoção" 
                className="text-gray-700 placeholder:text-gray-400 resize-none transition-all duration-200 ease-in-out" 
                style={{ 
                  height: (watch("description") || "").length > 100 ? 'calc(100% + 20%)' : '', 
                  minHeight: '80px', 
                  maxHeight: '300px'
                }}
                maxLength={500}
                {...register("description")} 
                onChange={(e) => {
                  // Limitar a 500 caracteres
                  if (e.target.value.length <= 500) {
                    setValue("description", e.target.value);
                  }
                  
                  // Auto-expansão quando o texto for grande
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  const newHeight = Math.min(textarea.scrollHeight, 300);
                  if (newHeight > 80) {
                    textarea.style.height = `${newHeight}px`;
                  } else {
                    textarea.style.height = '80px';
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-gray-700">Imagem da Campanha</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1 hidden">
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*,video/*,.gif" 
                    onChange={handleImageUpload} 
                    className="cursor-pointer text-gray-700 placeholder:text-gray-400 file:text-gray-700 file:hover:bg-gray-100 file:transition-colors file:duration-200" 
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <Label className="text-sm text-gray-500">Preview:</Label>
                  <div className="mt-2 border rounded-lg p-2 inline-block">
                    {imagePreview.endsWith('.mp4') || imagePreview.endsWith('.webm') ? (
                      <video
                        src={imagePreview}
                        width={200}
                        height={120}
                        className="rounded object-cover"
                        controls
                      />
                    ) : (
                      <Image
                        unoptimized
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={120}
                        className="rounded object-cover"
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* O modal de visualização em tela cheia foi removido */}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={isActive} onCheckedChange={(checked) => setValue("is_active", checked)} />
              <Label htmlFor="is_active" className="text-gray-700">Promoção ativa</Label>
            </div>

            <button 
                type="submit"
                className="w-full py-3 text-sm font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Promoção
              </button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Promoções */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-semibold text-gray-700">Promoções Criadas</CardTitle>
          <CardDescription className="text-gray-500">Gerencie suas promoções existentes</CardDescription>
          {promotions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-20 h-20 mb-4 rounded-full bg-purple-50 flex items-center justify-center relative">
                <div className="relative">
                  <span className="text-5xl font-bold text-purple-600">%</span>
                  <span className="absolute -top-2 -right-2 text-red-500 text-2xl font-bold">
                    ×
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma promoção encontrada</h3>
              <p className="text-gray-500 max-w-md">Crie sua primeira promoção para começar a atrair mais clientes</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => (
                <Card key={promotion.id} className="overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow">
                <div className="aspect-video relative">
                  {promotion.image_url.endsWith('.mp4') || promotion.image_url.endsWith('.webm') || promotion.image_url.endsWith('.mov') ? (
                    <div className="relative w-full h-full">
                      <video
                        src={promotion.image_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        onLoadedMetadata={(e) => {
                          const video = e.target as HTMLVideoElement;
                          // Definir o tempo atual para 0.1 segundos para capturar o primeiro frame
                          video.currentTime = 0.1;
                          // Pausar o vídeo após carregar o frame
                          video.addEventListener('seeked', () => {
                            video.pause();
                          }, { once: true });
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      unoptimized
                      src={promotion.image_url || "/placeholder.svg"}
                      alt={promotion.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-800">{promotion.title}</h3>
                      <Badge 
                        variant={promotion.is_active ? "default" : "secondary"}
                        className={`${
                          promotion.is_active 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {promotion.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-1">{promotion.description}</p>
                      {promotion.description && promotion.description.length > 50 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDescriptionText(promotion.description);
                            setIsTextModalOpen(true);
                          }}
                          className="text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> Ver texto
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Loja {promotion.store_id}</p>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`${
                          promotion.is_active 
                            ? 'bg-white border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200' 
                            : 'bg-white border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-200'
                        }`}
                        onClick={() => togglePromotionStatus(promotion.id)}
                      >
                        {promotion.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white border-gray-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(promotion.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white border-gray-300 text-gray-500 hover:shadow-md hover:bg-gray-50 hover:text-gray-500 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPromotionDetails(promotion);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PromotionsPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_promocoes">
      <PromotionsPageContent />
    </ProtectedRouteWithPermission>
  )
}
