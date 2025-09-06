"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { FilterConfiguration } from "@/lib/filter-config-encryption"
import { Play, Trash2, Calendar, AlertCircle } from "lucide-react"

interface SavedConfigurationsListProps {
  configurations: FilterConfiguration[]
  onLoad: (config: FilterConfiguration) => void
  onDelete: (configId: string) => void
  isLoading: boolean
}

interface DeleteConfirmationModalProps {
  isOpen: boolean
  configName: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmationModal({ isOpen, configName, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  // Adicionar suporte a tecla Escape
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div 
        className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-2 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-config-title"
        aria-describedby="delete-config-description"
      >
        <div className="flex items-start gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              id="delete-config-title"
              className="font-semibold text-gray-800 text-base sm:text-base"
            >
              Excluir Configuração
            </h3>
            <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
          </div>
        </div>
        
        <p 
          id="delete-config-description"
          className="text-sm text-gray-700 mb-6 break-words"
        >
          Tem certeza que deseja excluir a configuração <strong>"{configName}"</strong>?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1 min-h-[44px] text-base sm:text-sm order-2 sm:order-1"
            aria-label="Cancelar exclusão da configuração"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 min-h-[44px] text-base sm:text-sm bg-red-600 hover:bg-red-700 text-white order-1 sm:order-2"
            aria-label={`Confirmar exclusão da configuração ${configName}`}
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SavedConfigurationsList({
  configurations,
  onLoad,
  onDelete,
  isLoading
}: SavedConfigurationsListProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    configId: string
    configName: string
  }>({
    isOpen: false,
    configId: "",
    configName: ""
  })

  const handleDeleteClick = (config: FilterConfiguration) => {
    setDeleteModal({
      isOpen: true,
      configId: config.id,
      configName: config.name
    })
  }

  const handleDeleteConfirm = () => {
    onDelete(deleteModal.configId)
    setDeleteModal({ isOpen: false, configId: "", configName: "" })
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, configId: "", configName: "" })
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data inválida'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h6 className="text-sm font-medium text-gray-600">Configurações Salvas</h6>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (configurations.length === 0) {
    return (
      <div className="space-y-3">
        <h6 className="text-sm font-medium text-gray-600">Configurações Salvas (0/10)</h6>
        <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-md bg-gray-50">
          <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-gray-600 mb-1">Nenhuma configuração salva</p>
          <p className="text-xs text-gray-500">Salve uma configuração para reutilizá-la depois</p>
        </div>
      </div>
    )
  }

  const isAtLimit = configurations.length >= 10
  const hasScroll = configurations.length > 4 // Mostra mais de 4 itens, precisa scroll

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h6 className="text-sm font-medium text-gray-600">
            Configurações Salvas ({configurations.length}/10)
          </h6>
          {isAtLimit && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Limite atingido
            </span>
          )}
        </div>
        
        <div className="relative">
          <div 
            className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar"
            role="list"
            aria-label="Lista de configurações salvas"
          >
            {configurations.map((config) => (
              <div
                key={config.id}
                className="border border-gray-200 rounded-md p-3 sm:p-3 hover:bg-gray-50 transition-colors"
                role="listitem"
              >
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm sm:text-sm truncate">
                      {config.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-gray-500 truncate">
                        {formatDate(config.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {config.selectedFields.length} campos selecionados
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center gap-1 sm:gap-1 ml-2 flex-shrink-0"
                    role="group"
                    aria-label={`Ações para configuração ${config.name}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLoad(config)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8"
                      aria-label={`Carregar configuração ${config.name}`}
                    >
                      <Play className="h-4 w-4 sm:h-3 sm:w-3" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(config)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8"
                      aria-label={`Excluir configuração ${config.name}`}
                    >
                      <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Indicador de scroll */}
          {hasScroll && (
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
        
        {/* Aviso quando próximo do limite */}
        {configurations.length >= 8 && configurations.length < 10 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            Você pode salvar mais {10 - configurations.length} configuração(ões)
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        configName={deleteModal.configName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}