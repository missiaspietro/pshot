"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BotIcon as Robot, QrCode, Wifi, WifiOff } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { ProtectedRouteWithPermission } from "@/components/protected-route-with-permission"

interface Bot {
  id: string
  nome: string
  url_base?: string
  token?: string
  status?: string
  rede?: string
  sub_rede?: string
  loja?: string
  qrcode?: string
  numero?: string
  perfil?: string
  texto_niver0dias?: string
  Parceiro?: string
  looping?: number
  atualizada?: boolean
  texto_niver1dias?: string
  texto_niver15dias?: string
}

function RobotsPageContent() {
  const { user } = useAuth()
  const [bots, setBots] = useState<Bot[]>([])
  const [filteredBots, setFilteredBots] = useState<Bot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [robotStatus, setRobotStatus] = useState<Record<string, 'connected' | 'disconnected'>>({});
  const [qrCodeData, setQrCodeData] = useState<Record<string, {loading: boolean; qrcode?: string; isConnected?: boolean}>>({})
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [openModals, setOpenModals] = useState<Set<string>>(new Set())
  const [notifiedExpiredQR, setNotifiedExpiredQR] = useState<Set<string>>(new Set())
  
  // Estado para armazenar dados do usuário do banco
  const [userBankData, setUserBankData] = useState<any>(null);
  // Estado para controle de acesso
  const [accessMessage, setAccessMessage] = useState<string>('');

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
      console.log('🔍 [USER-DATA] Dados do usuário obtidos do banco:', userData);
      console.log('🔍 [USER-DATA] Campo nivel:', userData.nivel);
      console.log('🔍 [USER-DATA] Campo access_level:', userData.access_level);
      console.log('🔍 [USER-DATA] Campo empresa:', userData.empresa);
      console.log('🔍 [USER-DATA] Campo loja:', userData.loja);
      
      // Armazenar dados do usuário do banco
      setUserBankData(userData);
      
      return userData;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchBots = async () => {
      try {
        console.log('Usuário atual:', user);
        
        // Primeiro carregar dados do usuário
        const userData = await loadUserData();
        
        if (!userData) {
          console.error('Não foi possível carregar dados do usuário');
          setAccessMessage('Erro ao carregar dados do usuário. Tente fazer login novamente.');
          return;
        }
        
        // Importar o botService e accessControlUtils dinamicamente
        const { botService, accessControlUtils } = await import('@/lib/bot-service');
        
        // Criar objeto de usuário para verificação de acesso
        const userForAccess = {
          access_level: userData.nivel || userData.access_level || user?.access_level || 'user',
          empresa: userData.empresa || user?.empresa || '',
          loja: userData.loja || user?.loja || ''
        };
        
        console.log('🔍 [ROBOTS-PAGE] Dados do usuário para controle de acesso:', userForAccess);
        console.log('🔍 [ROBOTS-PAGE] É Super Admin?', accessControlUtils.isSuperAdmin(userForAccess));
        
        // Verificar se usuário pode acessar robôs
        if (!accessControlUtils.canAccessRobots(userForAccess)) {
          const message = accessControlUtils.getNoAccessMessage(userForAccess);
          setAccessMessage(message);
          setBots([]);
          setFilteredBots([]);
          return;
        }
        
        // Buscar bots baseado no nível de acesso do usuário
        const botsData = await botService.getBotsByUserAccess(userForAccess);
        
        console.log('📊 [ROBOTS-PAGE] Bots encontrados:', botsData.length, 'bots');
        console.log('📊 [ROBOTS-PAGE] Detalhes dos bots:', botsData.map(bot => ({ nome: bot.nome, loja: bot.loja, rede: bot.rede })));
        
        setBots(botsData);
        setFilteredBots(botsData);
        
        // Limpar mensagem de acesso se houver bots
        if (botsData.length > 0) {
          setAccessMessage('');
        } else {
          // Definir mensagem apropriada quando não há bots
          const accessType = accessControlUtils.getUserAccessType(userForAccess);
          if (accessType === 'super_admin') {
            setAccessMessage('Nenhum robô encontrado para a sua empresa. Entre em contato com o administrador.');
          } else if (accessType === 'store_user') {
            setAccessMessage(`Nenhum robô encontrado para a loja "${userForAccess.loja}". Entre em contato com o administrador.`);
          }
        }
        
        // Inicializa o status dos robôs baseado no status atual da tabela
        const initialStatus: Record<string, 'connected' | 'disconnected'> = {};
        botsData.forEach((bot) => {
          initialStatus[bot.nome] = bot.status === 'open' ? 'connected' : 'disconnected';
        });
        setRobotStatus(initialStatus);
        
      } catch (error) {
        console.error('Erro ao buscar bots:', error);
        toast.error('Erro ao carregar os bots');
        setAccessMessage('Erro ao carregar os robôs. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [user?.email]);





  // Função para verificar o status de todos os bots de uma vez usando a API segura
  const checkAllBotsStatus = async () => {
    if (!user || filteredBots.length === 0) return;
    
    try {
      setIsUpdatingStatus(true);
      
      // Importar accessControlUtils para verificar acesso
      const { accessControlUtils } = await import('@/lib/bot-service');
      
      // Criar objeto de usuário para verificação de acesso
      const userForAccess = {
        access_level: userBankData?.nivel || userBankData?.access_level || user?.access_level || 'user',
        empresa: userBankData?.empresa || user?.empresa || '',
        loja: userBankData?.loja || user?.loja || ''
      };
      
      // Buscar todos os bots da empresa do usuário
      const empresa = userForAccess.empresa;
      const loja = userForAccess.loja;
      const isSuperAdmin = accessControlUtils.isSuperAdmin(userForAccess);
      
      console.log('🔍 [ROBOTS-PAGE] Verificando status - Super Admin:', isSuperAdmin, 'Empresa:', empresa, 'Loja:', loja);
      
      const url = new URL('/api/bots', window.location.origin);
      url.searchParams.append('rede', `eq.${empresa}`);
      
      // IMPORTANTE: Se não é Super Admin, filtrar também por loja
      if (!isSuperAdmin && loja) {
        console.log('🏪 Aplicando filtro de loja:', loja);
        url.searchParams.append('loja', `eq.${loja}`);
      } else if (isSuperAdmin) {
        console.log('🔑 Super Admin - vendo toda a empresa');
      }
      
      url.searchParams.append('select', 'id,nome,status,qrcode,loja');
      
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status);
        return;
      }
      
      let botsData = await response.json();
      
      console.log('📊 Dados recebidos da API:', botsData.length, 'bots');
      
      // Filtro adicional no frontend para garantir segurança
      // IMPORTANTE: Só aplicar filtro se NÃO for Super Admin
      if (!isSuperAdmin && loja) {
        botsData = botsData.filter((bot: any) => bot.loja === loja);
        console.log('🔒 Filtro aplicado - bots da loja:', botsData.length);
      } else if (isSuperAdmin) {
        console.log('🔑 Super Admin - todos os bots da empresa:', botsData.length);
      }
      
      console.log('Dados dos bots retornados da API:', botsData);
      
      // Debug específico para QR Codes
      botsData.forEach((bot: { id: string; nome: string; qrcode?: string }) => {
        if (bot.qrcode) {
          console.log(`Bot ${bot.nome} (${bot.id}) tem QR Code:`, bot.qrcode.substring(0, 50) + '...');
          console.log(`QR Code completo para ${bot.nome}:`, bot.qrcode);
        } else {
          console.log(`Bot ${bot.nome} (${bot.id}) não tem QR Code`);
        }
      });
      
      // Atualiza os estados para todos os bots
      setRobotStatus(prev => {
        const newStatus = { ...prev };
        let hasChanges = false;
        
        botsData.forEach((bot: { id: string; nome: string; status: string }) => {
          const newBotStatus = bot.status === 'open' ? 'connected' : 'disconnected';
          if (newStatus[bot.nome] !== newBotStatus) {
            newStatus[bot.nome] = newBotStatus;
            hasChanges = true;
          }
        });
        
        return hasChanges ? newStatus : prev;
      });
      
      // Atualiza os dados do QR Code sempre que houver dados
      setQrCodeData(prev => {
        const newQrData = { ...prev };
        
        botsData.forEach((bot: { id: string; nome: string; status: string; qrcode?: string }) => {
          const isConnected = bot.status === 'open';
          
          // Limpa o QR Code se necessário
          let qrCodeClean = bot.qrcode;
          if (qrCodeClean && qrCodeClean.startsWith('data:image/png;base64,')) {
            qrCodeClean = qrCodeClean.replace('data:image/png;base64,', '');
          }
          
          // Se não há QR Code no banco, remove do estado local também
          if (!bot.qrcode && prev[bot.nome]?.qrcode && openModals.has(bot.nome)) {
            console.log(`QR Code removido do banco para bot ${bot.nome}, limpando estado local`);
            // Mostra toast apenas uma vez por bot
            if (!notifiedExpiredQR.has(bot.nome)) {
              setNotifiedExpiredQR(prev => new Set([...prev, bot.nome]));
              setTimeout(() => {
                toast.info(`QR Code do ${bot.nome} expirou. Gere um novo para continuar.`);
              }, 100);
            }
          }
          
          // Sempre atualiza o estado para cada bot
          newQrData[bot.nome] = {
            qrcode: qrCodeClean, // Usa apenas o QR Code do banco, não mantém o anterior
            isConnected: isConnected,
            loading: false
          };
          
          if (bot.qrcode) {
            console.log(`QR Code FORÇADO para bot ${bot.nome}:`, bot.qrcode.substring(0, 100) + '...');
            console.log(`Estado atualizado para ${bot.nome}:`, newQrData[bot.nome]);
          }
        });
        
        console.log('Estado completo do QR Code após atualização:', newQrData);
        return newQrData; // Sempre retorna o novo estado para forçar re-render
      });
      
    } catch (error) {
      console.error('Erro ao verificar status dos bots:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Efeito para atualização periódica dos status (otimizado)
  useEffect(() => {
    if (filteredBots.length === 0) return;

    // Executa imediatamente
    checkAllBotsStatus();
    
    // Configura atualização a cada 2 segundos
    const intervalId = setInterval(() => {
      checkAllBotsStatus();
    }, 2000);

    // Limpa o intervalo quando o componente é desmontado ou os bots mudam
    return () => clearInterval(intervalId);
  }, [filteredBots]);

  // Funções para controlar modais abertos
  const handleModalOpen = (botNome: string) => {
    setOpenModals(prev => new Set([...prev, botNome]));
  };

  const handleModalClose = (botNome: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(botNome);
      return newSet;
    });
    // Limpa a notificação quando o modal é fechado
    setNotifiedExpiredQR(prev => {
      const newSet = new Set(prev);
      newSet.delete(botNome);
      return newSet;
    });
  };

  const handleGenerateQRCode = async (botNome: string) => {
    console.log('🚀 Iniciando geração de QR Code para:', botNome);
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      toast.error("Usuário não autenticado");
      return;
    }

    const bot = filteredBots.find(b => b.nome === botNome);
    if (!bot) {
      console.error('❌ Bot não encontrado:', botNome);
      toast.error("Bot não encontrado");
      return;
    }
    
    console.log('📋 Dados do bot:', bot);
    
    try {
      // Se o status for 'open', não permite gerar novo QR Code, mas mostra o pop-up com check
      if (bot.status === 'open') {
        // Atualiza o estado para mostrar que está conectado
        setQrCodeData(prev => ({
          ...prev,
          [botNome]: { ...prev[botNome], isConnected: true }
        }));
        
        // Atualiza o status do robô para conectado
        setRobotStatus(prev => ({
          ...prev,
          [botNome]: 'connected'
        }));
        
        // Mostra mensagem de aviso
        toast.success("Este robô já está conectado!");
        return;
      }
      
      // Inicia o estado de carregamento
      setQrCodeData(prev => ({
        ...prev,
        [botNome]: { ...prev[botNome], loading: true, qrcode: undefined, isConnected: false }
      }));

      const requestBody = {
        nome: bot.nome,
        token: bot.token || bot.nome,
        rededeLoja: bot.rede || "",
        subRede: bot.sub_rede || "",
        loja: bot.loja || "",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      };

      console.log('📤 Enviando requisição:', requestBody);
      console.log('🔗 URL da API:', '/api/webhook');

      // Envia a requisição para gerar o QR Code
      const response = await fetch('/api/webhook', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Status da resposta:', response.status);
      console.log('📥 Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao gerar QR Code: ${response.status}`);
      }
      
      // Aguarda um pouco para dar tempo do QR Code ser gerado
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Função para buscar QR Code com retry
      const buscarQRCode = async (tentativas = 5) => {
        for (let i = 0; i < tentativas; i++) {
          console.log(`Tentativa ${i + 1} de buscar QR Code para ${bot.nome}`);
          
          const qrUrl = new URL('/api/bots', window.location.origin);
          qrUrl.searchParams.append('nome', `eq.${bot.nome}`);
          qrUrl.searchParams.append('select', 'qrcode,status');
          
          const qrResponse = await fetch(qrUrl.toString(), {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (qrResponse.ok) {
            const qrData = await qrResponse.json();
            const botData = qrData[0];
            
            console.log(`Dados do bot na tentativa ${i + 1}:`, botData);
            
            if (botData?.qrcode) {
              console.log(`QR Code encontrado na tentativa ${i + 1}:`, botData.qrcode.substring(0, 100) + '...');
              
              // Remove prefixos desnecessários se existirem
              let qrCodeClean = botData.qrcode;
              if (qrCodeClean.startsWith('data:image/png;base64,')) {
                qrCodeClean = qrCodeClean.replace('data:image/png;base64,', '');
              }
              
              // Força a atualização do estado
              setQrCodeData(prev => {
                const newData = {
                  ...prev,
                  [botNome]: {
                    qrcode: qrCodeClean,
                    isConnected: botData.status === 'open',
                    loading: false
                  }
                };
                console.log('Estado QR Code atualizado:', newData[botNome]);
                return newData;
              });
              
              // Limpa a notificação de QR Code expirado quando um novo é gerado
              setNotifiedExpiredQR(prev => {
                const newSet = new Set(prev);
                newSet.delete(botNome);
                return newSet;
              });
              
              toast.success("QR Code gerado com sucesso!");
              return true;
            }
          }
          
          // Aguarda 1 segundo antes da próxima tentativa
          if (i < tentativas - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log('QR Code não encontrado após todas as tentativas');
        toast.error("QR Code não foi gerado. Tente novamente.");
        return false;
      };
      
      await buscarQRCode();
      
    } catch (error: any) {
      console.error('Erro ao gerar QR Code:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao processar a requisição';
      toast.error(errorMessage);
    } finally {
      // Remove o estado de carregamento em todos os casos
      setQrCodeData(prev => ({
        ...prev,
        [botNome]: { 
          ...prev[botNome],
          loading: false
        }
      }));
    }
  }


  const getStatusBadge = (status: 'connected' | 'disconnected') => {
    return status === "connected" ? (
      <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100 border-transparent">
        <Wifi className="h-3 w-3" />
        Conectado
      </Badge>
    ) : (
      <Badge className="flex items-center gap-1 bg-red-100 text-red-800 hover:bg-red-100 border-transparent">
        <WifiOff className="h-3 w-3" />
        Desconectado
      </Badge>
    )
  }

  // Calcular estatísticas baseadas apenas nos robôs visíveis para o usuário
  const totalBots = filteredBots.length;
  const connectedCount = filteredBots.filter(bot => robotStatus[bot.nome] === 'connected').length;
  const disconnectedCount = totalBots - connectedCount;

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{totalBots}</div>
            <p className="text-sm text-gray-500">
              Total de Robôs
              {(userBankData?.nivel || user?.access_level)?.toLowerCase().replace(/\s+/g, '_') !== 'super_admin' && (userBankData?.loja || user?.loja) && (
                <span className="block text-xs text-gray-400">
                  Loja: {userBankData?.loja || user?.loja}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <p className="text-sm text-gray-500">Conectados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{disconnectedCount}</div>
            <p className="text-sm text-gray-500">Desconectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Robôs */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Robot className="h-5 w-5 text-gray-900" />
            Robôs de WhatsApp
            {(userBankData?.nivel || user?.access_level)?.toLowerCase().replace(/\s+/g, '_') === 'super_admin' && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Super Admin
              </Badge>
            )}
            {isUpdatingStatus && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                Atualizando...
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {(userBankData?.nivel || user?.access_level)?.toLowerCase().replace(/\s+/g, '_') === 'super_admin' 
              ? 'Gerencie a conexão dos robôs de WhatsApp da sua empresa'
              : `Gerencie a conexão dos robôs de WhatsApp da loja ${userBankData?.loja || user?.loja || 'sua loja'}`
            }
            <span className="text-xs text-gray-400 block mt-1">
              Status atualizado automaticamente a cada 2 segundos
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando robôs...</p>
              </div>
            ) : filteredBots.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                  <Robot className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">
                  {accessMessage || 'Nenhum robô encontrado.'}
                </p>
                {!accessMessage && (
                  <p className="text-xs text-gray-400">
                    Entre em contato com o administrador se você deveria ter acesso a robôs.
                  </p>
                )}
              </div>
            ) : (
              filteredBots.map((bot) => (
                <Card key={bot.nome} className="group relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Robot className="h-5 w-5 text-gray-700" />
                          <div>
                            <h3 className="font-medium text-gray-600">{bot.nome || 'Sem nome'}</h3>
                            <p className="text-sm text-gray-400">{bot.loja || 'Sem loja'}</p>
                            <p className="text-xs text-gray-300">{bot.rede || 'Sem rede'}</p>
                          </div>
                        </div>
                        {getStatusBadge(robotStatus[bot.nome] || 'disconnected')}
                      </div>

                      <div className="flex gap-2">
                        <Dialog onOpenChange={(open) => {
                          if (open) {
                            handleModalOpen(bot.nome);
                          } else {
                            handleModalClose(bot.nome);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant={bot.status === 'open' ? "outline" : "outline"}
                              size="sm" 
                              className={`flex-1 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors duration-200 ${bot.status === 'open' 
                                ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-500 hover:text-white' 
                                : 'text-black bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:border-transparent'}`}
                              onClick={() => handleGenerateQRCode(bot.nome)}
                              disabled={isLoading}
                            >
                              {bot.status === 'open' ? (
                                <>
                                  <div className="flex items-center justify-center bg-green-100 rounded-full p-0.5 mr-2">
                                    <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  Ver Status
                                </>
                              ) : (
                                <>
                                  <QrCode className="h-4 w-4 mr-2" />
                                  {isLoading ? 'Gerando...' : 'Gerar QR Code'}
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-gray-800">
                                QR Code - {bot.nome}
                                {isUpdatingStatus && openModals.has(bot.nome) && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                                    Atualizando...
                                  </div>
                                )}
                              </DialogTitle>
                              <DialogDescription className="text-gray-500">
                                Escaneie o QR Code para conectar o robô ao WhatsApp
                                <span className="text-xs text-gray-400 block mt-1">
                                  Atualização automática a cada 2 segundos
                                </span>
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-6 min-h-[300px] transition-all duration-300">
                              {qrCodeData[bot.nome]?.isConnected ? (
                                <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                                  <div className="w-36 h-36 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg">
                                    <svg className="w-20 h-20 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <p className="text-xl text-green-600 font-medium">Conectado com sucesso!</p>
                                  <p className="text-sm text-gray-500">O robô está online e funcionando</p>
                                </div>
                              ) : qrCodeData[bot.nome]?.loading ? (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                                  <p className="text-sm text-gray-500">Gerando QR Code, aguarde...</p>
                                </div>
                              ) : qrCodeData[bot.nome]?.qrcode ? (
                                <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-500">
                                  <div className="relative">
                                    <img 
                                      src={`data:image/png;base64,${qrCodeData[bot.nome].qrcode}`} 
                                      alt="QR Code" 
                                      className="max-w-[200px] h-auto border border-gray-200 rounded-lg shadow-sm transition-all duration-300"
                                      onError={(e) => {
                                        console.error('Erro ao carregar QR Code:', qrCodeData[bot.nome].qrcode);
                                        // Tenta sem o prefixo data:image caso já tenha
                                        const qrCode = qrCodeData[bot.nome]?.qrcode;
                                        if (qrCode) {
                                          e.currentTarget.src = qrCode;
                                        }
                                      }}
                                      onLoad={() => {
                                        console.log('QR Code carregado com sucesso!');
                                      }}
                                    />
                                    {isUpdatingStatus && (
                                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 text-center">
                                    Escaneie este QR Code com o WhatsApp
                                  </p>
                                  <p className="text-xs text-gray-400 text-center">
                                    QR Code válido por tempo limitado
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center p-4 space-y-4">
                                  <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
                                    {openModals.has(bot.nome) && !qrCodeData[bot.nome]?.qrcode ? (
                                      <svg className="h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                    ) : (
                                      <QrCode className="h-12 w-12 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 mb-3">
                                      {qrCodeData[bot.nome]?.loading 
                                        ? 'Gerando QR Code...' 
                                        : openModals.has(bot.nome) && !qrCodeData[bot.nome]?.qrcode
                                          ? 'QR Code expirou ou foi removido'
                                          : 'QR Code não disponível'
                                      }
                                    </p>
                                    {!qrCodeData[bot.nome]?.loading && (
                                      <div className="space-y-2">
                                        <Button 
                                          onClick={() => handleGenerateQRCode(bot.nome)}
                                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                          disabled={qrCodeData[bot.nome]?.loading}
                                        >
                                          <QrCode className="h-4 w-4 mr-2" />
                                          Gerar Novo QR Code
                                        </Button>
                                        <p className="text-xs text-gray-400">
                                          Clique para gerar um novo QR Code
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">
                                Escaneie com o WhatsApp: {bot.loja || bot.nome}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="text-xs text-gray-400">
                        Status: {robotStatus[bot.nome] === "connected" ? "Online" : "Offline"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-600">Como conectar um robô</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                1
              </div>
              <p className="text-gray-600">Clique em "Gerar QR Code" no robô que deseja conectar</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <p className="text-gray-600">Abra o WhatsApp Business no celular da loja</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <p className="text-gray-600">Vá em Menu → Dispositivos conectados → Conectar um dispositivo</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                4
              </div>
              <p className="text-gray-600">Escaneie o QR Code exibido na tela</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                5
              </div>
              <p className="text-gray-600">O robô será conectado automaticamente e o status mudará para "Conectado"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RobotsPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_bots">
      <RobotsPageContent />
    </ProtectedRouteWithPermission>
  )
}
