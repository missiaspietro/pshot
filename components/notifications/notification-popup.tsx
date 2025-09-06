'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, X, Info, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

// Interface baseada na tabela notificacoes do Supabase
interface Notificacao {
  id: number;
  created_at: string;
  empresa: string | null;
  texto: string | null;
  usuario: string | null;
  status_leitura: string | null; // 'sim' | 'nao'
  sistema: string | null;
  remetente: string | null;
  ministerio: string | null;
  email_destinatario: string | null;
}

export function NotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Função para buscar notificações do Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user || !user.empresa || !user.email) return;

    try {
      setIsLoading(true);
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('empresa', user.empresa)
        .eq('email_destinatario', user.email)
        .eq('sistema', 'Praise Shot')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return;
      }

      if (data) {
        setNotificacoes(data);
        // Calcular notificações não lidas
        const unread = data.filter(n => n.status_leitura === 'nao' || n.status_leitura === null).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Função para marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('notificacoes')
        .update({ status_leitura: 'sim' })
        .eq('id', notificationId);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      // Atualizar estado local
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status_leitura: 'sim' }
            : notif
        )
      );

      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao atualizar status da notificação:', error);
    }
  }, []);

  // Função para remover notificação da memória (não do banco de dados)
  const removeFromMemory = useCallback((notificationId: number) => {
    // Verificar se a notificação era não lida antes de remover
    const notificacao = notificacoes.find(n => n.id === notificationId);
    const wasUnread = notificacao && (notificacao.status_leitura === 'nao' || notificacao.status_leitura === null);

    // Remover da lista local
    setNotificacoes(prev => prev.filter(notif => notif.id !== notificationId));

    // Atualizar contador se era não lida
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notificacoes]);

  // Função para formatar data/hora
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Agora';
      if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `Há ${diffInHours}h`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `Há ${diffInDays}d`;
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // Carregar notificações iniciais
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling para atualizações automáticas (30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fechar o popup quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notificacao: Notificacao) => {
    if (notificacao.status_leitura === 'nao' || notificacao.status_leitura === null) {
      markAsRead(notificacao.id);
    }
  };

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={togglePopup}
        className="text-gray-600 hover:text-gray-900 cursor-pointer transition-all duration-200 hover:shadow-md p-1 rounded-full relative"
        title="Notificações"
        data-component-name="GlassHeader"
      >
        <Bell className="h-5 w-5 text-gray-800" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-medium text-gray-900">Notificações</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notificacoes.map((notificacao) => {
                  const isUnread = notificacao.status_leitura === 'nao' || notificacao.status_leitura === null;
                  
                  return (
                    <li 
                      key={notificacao.id}
                      className={cn(
                        "p-3 hover:bg-gray-50 transition-colors",
                        isUnread && "bg-blue-50 border-l-4 border-blue-500"
                      )}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <Info className="h-5 w-5 text-blue-500" />
                        </div>
                        <div 
                          className="ml-3 flex-1 cursor-pointer"
                          onClick={() => handleNotificationClick(notificacao)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm text-gray-900",
                                isUnread && "font-semibold"
                              )}>
                                {notificacao.texto || 'Notificação sem conteúdo'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                De: {notificacao.remetente || 'Sistema'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end ml-2">
                              <span className="text-xs text-gray-400">
                                {formatTime(notificacao.created_at)}
                              </span>
                              {isUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromMemory(notificacao.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remover notificação"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
