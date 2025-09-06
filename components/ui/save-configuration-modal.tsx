"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Save, AlertCircle } from "lucide-react"

interface SaveConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<boolean>
  isNameDuplicate: (name: string) => boolean
  isSaving: boolean
}

export function SaveConfigurationModal({
  isOpen,
  onClose,
  onSave,
  isNameDuplicate,
  isSaving
}: SaveConfigurationModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("")
      setError("")
    }
  }, [isOpen])

  const validateName = (value: string) => {
    const trimmed = value.trim()
    
    if (trimmed.length < 3) {
      return "Nome deve ter pelo menos 3 caracteres"
    }
    
    if (trimmed.length > 50) {
      return "Nome deve ter no máximo 50 caracteres"
    }
    
    if (isNameDuplicate(trimmed)) {
      return "Já existe uma configuração com este nome"
    }
    
    return ""
  }

  const handleNameChange = (value: string) => {
    setName(value)
    const validationError = validateName(value)
    setError(validationError)
  }

  const handleSave = async () => {
    const validationError = validateName(name)
    if (validationError) {
      setError(validationError)
      return
    }

    const success = await onSave(name.trim())
    if (success) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error && name.trim()) {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal - Otimizado para mobile */}
      <div 
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-2 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-config-title"
        aria-describedby="save-config-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 
            id="save-config-title"
            className="text-base sm:text-lg font-semibold text-gray-800 pr-2"
          >
            Salvar Configuração
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-name" className="text-sm font-medium text-gray-700">
              Nome da Configuração
            </Label>
            <Input
              id="config-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Relatório Mensal"
              className={`${error ? 'border-red-500 focus:border-red-500' : ''} min-h-[44px] text-base sm:text-sm`}
              disabled={isSaving}
              autoFocus
              aria-describedby={error ? "config-name-error" : "save-config-description"}
              aria-invalid={!!error}
              aria-required="true"
            />
            {error && (
              <div 
                id="config-name-error"
                className="flex items-center gap-1 text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                <span className="break-words">{error}</span>
              </div>
            )}
          </div>

          <div 
            id="save-config-description"
            className="text-xs sm:text-xs text-gray-500"
          >
            A configuração incluirá todos os campos selecionados atualmente.
          </div>
        </div>

        {/* Actions - Otimizado para touch */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 min-h-[44px] text-base sm:text-sm order-2 sm:order-1"
            aria-label="Cancelar salvamento da configuração"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!!error || !name.trim() || isSaving}
            className="flex-1 min-h-[44px] text-base sm:text-sm bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white order-1 sm:order-2"
            aria-label={isSaving ? "Salvando configuração..." : "Salvar configuração"}
            aria-describedby={error ? "config-name-error" : undefined}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}