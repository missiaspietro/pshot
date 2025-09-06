// Versão temporária da página de robôs com debug
// USAR APENAS PARA DEBUG - REMOVER APÓS IDENTIFICAR O PROBLEMA

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
import { ProtectedRouteWithPermission } from "@/components/protected-route-with-permission"
import { DebugProductionQRCode } from "@/components/debug-production-qrcode"

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

function RobotsPageContentWithDebug() {
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

  useEffect(() => {
    const fetchBots = async () => {
      try {
        console.log('Usuário atual:', user);
        
        // Primeiro carregar dados do usuário
        const userData = await loadUserData();
        
        if (!userData) {
          console.error('Não foi possível carregar dados do usuário');
          return;
        }
        
        // Obter empresa do usuário
        const empresa = userData.empresa || user?.empresa || '';
        
        console.log('Buscando bots para empresa:', empresa);
        
        // Importar o botService dinamicamente
        const { botService } = await import('@/lib/bot-service');
        
        // Buscar bots filtrados pela empresa do usuário
        const botsData = await botService.getBotsPorEmpresa(empresa);
        
        console.log('Bots encontrados:', botsData);
        
        setBots(botsData);
        setFilteredBots(botsData);
        
        // Inicializa o status dos robôs baseado no status atual da tabela
        const initialStatus: Record<string, 'connected' | 'disconnected'> = {};
        botsData.forEach((bot) => {
          initialStatus[bot.nome] = bot.status === 'open' ? 'connected' : 'disconnected';
        });
        setRobotStatus(initialStatus);
        
      } catch (error) {
        console.error('Erro ao buscar bots:', error);
        toast.error('Erro ao carregar os bots');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [user?.email]);

  // Função para gerar QR Code com debug adicional
  const handleGenerateQRCode = async (botNome: string) => {
    console.log('🚀 [DEBUG] Iniciando geração de QR Code para:', botNome);
    console.log('🚀 [DEBUG] Timestamp:', new Date().toISOString());
    console.log('🚀 [DEBUG] User:', user);
    console.log('🚀 [DEBUG] UserBankData:', userBankData);
    
    if (!user) {
      console.error('❌ [DEBUG] Usuário não autenticado');
      toast.error("Usuário não autenticado");
      return;
    }

    const bot = filteredBots.find(b => b.nome === botNome);
    if (!bot) {
      console.error('❌ [DEBUG] Bot não encontrado:', botNome);
      toast.error("Bot não encontrado");
      return;
    }
    
    console.log('📋 [DEBUG] Dados do bot:', bot);
    
    try {
      // Se o status for 'open', não permite gerar novo QR Code, mas mostra o pop-up com check
      if (bot.status === 'open') {
        console.log('✅ [DEBUG] Bot já conectado, mostrando status');
        
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
      
      console.log('🔄 [DEBUG] Iniciando estado de carregamento');
      
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

      console.log('📤 [DEBUG] Enviando requisição:', requestBody);
      console.log('🔗 [DEBUG] URL da API:', '/api/webhook');
      console.log('🔗 [DEBUG] NEXT_PUBLIC_WEBHOOK_URL:', process.env.NEXT_PUBLIC_WEBHOOK_URL);

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

      console.log('📥 [DEBUG] Status da resposta:', response.status);
      console.log('📥 [DEBUG] Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [DEBUG] Erro na resposta:', errorData);
        throw new Error(errorData.message || `Erro ao gerar QR Code: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('✅ [DEBUG] Resposta da API webhook:', responseData);
      
      // Aguarda um pouco para dar tempo do QR Code ser gerado
      console.log('⏳ [DEBUG] Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Função para buscar QR Code com retry
      const buscarQRCode = async (tentativas = 5) => {
        for (let i = 0; i < tentativas; i++) {
          console.log(`🔍 [DEBUG] Tentativa ${i + 1} de buscar QR Code para ${bot.nome}`);
          
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
            
            console.log(`📊 [DEBUG] Dados do bot na tentativa ${i + 1}:`, botData);
            
            if (botData?.qrcode) {
              console.log(`✅ [DEBUG] QR Code encontrado na tentativa ${i + 1}:`, botData.qrcode.substring(0, 100) + '...');
              
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
                console.log('🔄 [DEBUG] Estado QR Code atualizado:', newData[botNome]);
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
            console.log(`⏳ [DEBUG] Aguardando 1 segundo antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log('❌ [DEBUG] QR Code não encontrado após todas as tentativas');
        toast.error("QR Code não foi gerado. Tente novamente.");
        return false;
      };
      
      await buscarQRCode();
      
    } catch (error: any) {
      console.error('💥 [DEBUG] Erro ao gerar QR Code:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao processar a requisição';
      toast.error(errorMessage);
    } finally {
      console.log('🏁 [DEBUG] Finalizando geração de QR Code');
      
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

  const connectedCount = Object.values(robotStatus).filter(status => status === 'connected').length;
  const totalBots = filteredBots.length;
  const disconnectedCount = totalBots - connectedCount;

  return (
    <div className="space-y-6">
      {/* Componente de Debug - REMOVER APÓS IDENTIFICAR O PROBLEMA */}
      <DebugProductionQRCode />
      
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{totalBots}</div>
            <p className="text-sm text-gray-500">Total de Robôs</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{connectedCount}</div>
            <p className="text-sm text-gray-500">Conectados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{disconnectedCount}</div>
            <p className="text-sm text-gray-500">Desconectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Robôs */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Robot className="h-5 w-5 text-gray-900" />
            Robôs de WhatsApp (COM DEBUG)
          </CardTitle>
          <CardDescription className="text-gray-500">
            Versão com debug ativo - REMOVER APÓS IDENTIFICAR O PROBLEMA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>Carregando robôs...</p>
            ) : filteredBots.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  Nenhum robô encontrado para a sua empresa. Entre em contato com o administrador.
                </p>
              </div>
            ) : (
              filteredBots.map((bot) => (
                <Card key={bot.nome} className="group relative overflow-hidden border-2 border-orange-200">
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
                        <Button 
                          variant={bot.status === 'open' ? "outline" : "outline"}
                          size="sm" 
                          className={`flex-1 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors duration-200 ${bot.status === 'open' 
                            ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-500 hover:text-white' 
                            : 'text-black bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:border-transparent'}`}
                          onClick={() => {
                            console.log('🖱️ [DEBUG] Botão clicado para bot:', bot.nome);
                            handleGenerateQRCode(bot.nome);
                          }}
                          disabled={isLoading}
                        >
                          {bot.status === 'open' ? (
                            <>
                              <div className="flex items-center justify-center bg-green-100 rounded-full p-0.5 mr-2">
                                <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              Ver Status (DEBUG)
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4 mr-2" />
                              {isLoading ? 'Gerando...' : 'Gerar QR Code (DEBUG)'}
                            </>
                          )}
                        </Button>
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
    </div>
  )
}

export default function RobotsPageWithDebug() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_bots">
      <RobotsPageContentWithDebug />
    </ProtectedRouteWithPermission>
  )
}