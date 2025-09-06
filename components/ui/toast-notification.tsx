'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

interface ToastState {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Singleton para gerenciar os toasts globalmente
class ToastManager {
  private static instance: ToastManager;
  private listeners: ((toasts: ToastState[]) => void)[] = [];
  private toasts: ToastState[] = [];

  private constructor() {}

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  public addToast(message: string, type: ToastType = 'info', duration: number = 3000): string {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, message, type, duration };
    this.toasts = [...this.toasts, toast];
    this.notifyListeners();
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
    
    return id;
  }

  public removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  public subscribe(listener: (toasts: ToastState[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.toasts); // Notify immediately with current state
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

// Função para mostrar toasts de qualquer lugar da aplicação
export const showToast = (message: string, type: ToastType = 'info', duration: number = 3000): string => {
  return ToastManager.getInstance().addToast(message, type, duration);
};

// Componente individual de toast
export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;
      
      if (remaining <= 0) {
        clearInterval(timer);
        // Inicia animação de saída automática
        setIsExiting(true);
        // Aguarda a animação terminar antes de chamar onClose
        setTimeout(() => {
          onClose?.();
        }, 700); // Tempo para a animação de saída
      } else {
        setProgress(newProgress);
      }
    }, 10);
    
    return () => clearInterval(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'info':
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      case 'info':
      default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 max-w-md w-full md:w-auto rounded-lg shadow-lg border p-4 pr-10 transition-all duration-700 ease-out transform",
        getBgColor(),
        isVisible && !isExiting ? "translate-y-0 opacity-100 scale-100" : 
        isExiting ? "translate-y-8 opacity-0 scale-95 pointer-events-none" :
        "translate-y-8 opacity-0 scale-95 pointer-events-none"
      )}
      style={{ zIndex: 9999 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
      </div>
      
      <button
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            onClose?.();
          }, 700);
        }}
      >
        <span className="sr-only">Fechar</span>
        <X className="h-4 w-4" />
      </button>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div 
          className={cn("h-full transition-all ease-linear", getProgressColor())}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Componente container para todos os toasts
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  
  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setToasts);
    return unsubscribe;
  }, []);
  
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => ToastManager.getInstance().removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
