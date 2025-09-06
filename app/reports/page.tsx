"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Calendar, Cake, DollarSign, Search, Settings, ChevronDown, ChevronUp, Save, Percent, Store } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { shotLojasService } from "@/lib/shot-lojas"
import { excelExportService } from "@/lib/excel-export-service"
import { Checkbox } from "@/components/ui/checkbox"
import { SaveConfigurationModal } from "@/components/ui/save-configuration-modal"
import { SavedConfigurationsList } from "@/components/ui/saved-configurations-list"
import { CashbackPreviewModal } from "@/components/ui/cashback-preview-modal"
import { BirthdayPreviewModal } from "@/components/ui/birthday-preview-modal"
import { SurveyPreviewModal } from "@/components/ui/survey-preview-modal"
import { PromotionsPreviewModal } from "@/components/ui/promotions-preview-modal"
import { useFilterConfigurations } from "@/hooks/use-filter-configurations"
import { FilterConfiguration } from "@/lib/filter-config-encryption"
import { ProtectedRouteWithPermission } from "@/components/protected-route-with-permission"



function ReportsPageContent() {
  const { user } = useAuth();
  
  // Definir datas padrão para teste (último mês)
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

  const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  // Estados para filtro de lojas
  const [stores, setStores] = useState<{id: string, name: string}[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [userBankData, setUserBankData] = useState<any>(null)


  // Estados para configuração do relatório de aniversários
  const [isConfigExpanded, setIsConfigExpanded] = useState(false)
  const [isConfigListExpanded, setIsConfigListExpanded] = useState(false)
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "criado_em", "cliente", "whatsApp", "loja"
  ])
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isBirthdayPreviewModalOpen, setIsBirthdayPreviewModalOpen] = useState(false)

  // Estados para configuração do relatório de cashbacks
  const [isCashbackConfigExpanded, setIsCashbackConfigExpanded] = useState(false)
  const [isCashbackConfigListExpanded, setIsCashbackConfigListExpanded] = useState(false)
  const [selectedCashbackFields, setSelectedCashbackFields] = useState<string[]>([
    "Envio_novo", "Nome", "Whatsapp", "Loja"
  ])
  const [isGeneratingCashbackReport, setIsGeneratingCashbackReport] = useState(false)
  const [isCashbackPreviewModalOpen, setIsCashbackPreviewModalOpen] = useState(false)

  // Estados para configuração do relatório de pesquisas
  const [isSurveyConfigExpanded, setIsSurveyConfigExpanded] = useState(false)
  const [selectedSurveyFields, setSelectedSurveyFields] = useState<string[]>([
    "nome", "telefone", "loja"
  ])
  const [isGeneratingSurveyReport, setIsGeneratingSurveyReport] = useState(false)
  const [isSurveyPreviewModalOpen, setIsSurveyPreviewModalOpen] = useState(false)

  // Estados para configuração do relatório de promoções
  const [isPromotionsConfigExpanded, setIsPromotionsConfigExpanded] = useState(false)
  const [isPromotionsConfigListExpanded, setIsPromotionsConfigListExpanded] = useState(false)
  const [selectedPromotionsFields, setSelectedPromotionsFields] = useState<string[]>([
    "Cliente", "Whatsapp", "Loja", "Data_Envio"
  ])
  const [isGeneratingPromotionsReport, setIsGeneratingPromotionsReport] = useState(false)
  const [isPromotionsPreviewModalOpen, setIsPromotionsPreviewModalOpen] = useState(false)
  const [isPromotionsSaveModalOpen, setIsPromotionsSaveModalOpen] = useState(false)


  // Opções de campos disponíveis baseados na tabela relatorio_niver_decor_fabril
  const availableFields = [
    { id: "criado_em", label: "Data de Criação", description: "Data de criação do registro" },
    { id: "cliente", label: "Cliente", description: "Nome do cliente" },
    { id: "whatsApp", label: "WhatsApp", description: "Número do WhatsApp" },
    { id: "status", label: "Status", description: "Status do envio (observações)" },
    { id: "loja", label: "Loja", description: "Loja associada" },
    { id: "Sub_Rede", label: "Sub-rede", description: "Sub-rede associada" }
  ]

  // Opções de campos disponíveis para cashback
  const availableCashbackFields = [
    { id: "Envio_novo", label: "Data de Envio", description: "Data do envio do cashback" },
    { id: "Nome", label: "Nome", description: "Nome do cliente" },
    { id: "Whatsapp", label: "WhatsApp", description: "Número do WhatsApp" },
    { id: "Status", label: "Status", description: "Status do envio" },
    { id: "Loja", label: "Loja", description: "Loja associada" }
  ]

  // Opções de campos disponíveis para pesquisas de satisfação
  const availableSurveyFields = [
    { id: "nome", label: "Nome", description: "Nome do cliente" },
    { id: "telefone", label: "Telefone", description: "Telefone do cliente" },
    { id: "loja", label: "Loja", description: "Loja onde foi realizada a pesquisa" },
    { id: "resposta", label: "Resposta", description: "Resposta da pesquisa (1-Ótimo, 2-Bom, 3-Regular, 4-Péssimo)" },
    { id: "sub_rede", label: "Sub Rede", description: "Sub rede associada" },
    { id: "passo", label: "Passo", description: "Passo da pesquisa" },
    { id: "pergunta", label: "Pergunta", description: "Pergunta da pesquisa" },
    { id: "data_de_envio", label: "Data de Envio", description: "Data de envio da pesquisa" }
  ]

  // Opções de campos disponíveis para promoções (baseado na tabela "Relatorio Envio de Promoções")
  const availablePromotionsFields = [
    { id: "Cliente", label: "Cliente", description: "Nome do cliente" },
    { id: "Whatsapp", label: "WhatsApp", description: "Número do WhatsApp do cliente" },
    { id: "Loja", label: "Loja", description: "Loja onde foi enviada a promoção" },
    { id: "Sub_rede", label: "Sub Rede", description: "Sub rede da loja" },
    { id: "Data_Envio", label: "Data de Envio", description: "Data de envio da promoção" },
    { id: "Obs", label: "Status", description: "Status sobre o envio" }
  ]

  // Função para alternar seleção de campo
  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  // Função para alternar seleção de campo do cashback
  const toggleCashbackField = (fieldId: string) => {
    setSelectedCashbackFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  // Função para alternar seleção de campo das pesquisas
  const toggleSurveyField = (fieldId: string) => {
    // Todos os campos podem ser desmarcados

    setSelectedSurveyFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  // Função para alternar seleção de campo das promoções
  const togglePromotionsField = (fieldId: string) => {
    // Todos os campos podem ser desmarcados

    setSelectedPromotionsFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  // Estados para sistema de configurações (aniversários)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const {
    configurations: allConfigurations,
    isLoading: isLoadingConfigs,
    isSaving,
    error: configError,
    saveConfiguration,
    deleteConfiguration,
    clearError,
    canSaveMore,
    isNameDuplicate,
    retryLoad
  } = useFilterConfigurations()

  // Estados para sistema de configurações (cashbacks)
  const [isCashbackSaveModalOpen, setIsCashbackSaveModalOpen] = useState(false)

  // Estados para sistema de configurações (pesquisas)
  const [isSurveySaveModalOpen, setIsSurveySaveModalOpen] = useState(false)
  const [isSurveyConfigListExpanded, setIsSurveyConfigListExpanded] = useState(false)
  const {
    configurations: allCashbackConfigurations,
    isLoading: isLoadingCashbackConfigs,
    isSaving: isSavingCashback,
    error: cashbackConfigError,
    saveConfiguration: saveCashbackConfiguration,
    deleteConfiguration: deleteCashbackConfiguration,
    clearError: clearCashbackError,
    canSaveMore: canSaveMoreCashback,
    isNameDuplicate: isCashbackNameDuplicate,
    retryLoad: retryCashbackLoad
  } = useFilterConfigurations()

  // Hook para configurações de pesquisas
  const {
    configurations: allSurveyConfigurations,
    isLoading: isLoadingSurveyConfigs,
    isSaving: isSavingSurvey,
    error: surveyConfigError,
    saveConfiguration: saveSurveyConfiguration,
    deleteConfiguration: deleteSurveyConfiguration,
    clearError: clearSurveyError,
    canSaveMore: canSaveMoreSurvey,
    isNameDuplicate: isSurveyNameDuplicate,
    retryLoad: retrySurveyLoad
  } = useFilterConfigurations()

  // Hook para configurações de promoções (reutilizando o primeiro hook)
  const {
    configurations: allPromotionsConfigurations,
    isLoading: isLoadingPromotionsConfigs,
    isSaving: isSavingPromotions,
    error: promotionsConfigError,
    saveConfiguration: savePromotionsConfiguration,
    deleteConfiguration: deletePromotionsConfiguration,
    clearError: clearPromotionsError,
    canSaveMore: canSaveMorePromotions,
    isNameDuplicate: isPromotionsNameDuplicate,
    retryLoad: retryPromotionsLoad
  } = {
    configurations: allConfigurations,
    isLoading: isLoadingConfigs,
    isSaving,
    error: configError,
    saveConfiguration,
    deleteConfiguration,
    clearError,
    canSaveMore,
    isNameDuplicate,
    retryLoad
  }

  // Filtrar configurações por tipo
  const configurations = allConfigurations.filter(config =>
    config.name.includes('(Aniversários)')
  )

  const cashbackConfigurations = allCashbackConfigurations.filter(config =>
    config.name.includes('(Cashback)')
  )

  const surveyConfigurations = allSurveyConfigurations.filter(config =>
    config.name.includes('(Pesquisas)')
  )

  const promotionsConfigurations = allPromotionsConfigurations.filter(config =>
    config.name.includes('(Promoções)')
  )

  // Debug: Logs detalhados sobre configurações filtradas
  console.log('🔍 DEBUG: Análise de configurações por tipo')
  console.log('📊 Total de configurações carregadas:', allConfigurations.length)
  console.log('🎂 Configurações de aniversários filtradas:', configurations.length)
  console.log('💰 Configurações de cashback filtradas:', cashbackConfigurations.length)
  console.log('📋 Configurações de pesquisas filtradas:', surveyConfigurations.length)
  console.log('🎯 Configurações de promoções filtradas:', promotionsConfigurations.length)

  if (allConfigurations.length > 0) {
    console.log('📝 Detalhes das configurações por tipo:')
    allConfigurations.forEach(config => {
      const tipo = config.name.includes('(Aniversários)') ? 'Aniversários' :
        config.name.includes('(Cashback)') ? 'Cashback' :
          config.name.includes('(Pesquisas)') ? 'Pesquisas' :
          config.name.includes('(Promoções)') ? 'Promoções' : 'Desconhecido'
      console.log(`   - ${config.name} → Tipo: ${tipo}`)
    })
  }

  // Função para salvar configuração (aniversários)
  const handleSaveConfiguration = async (name: string): Promise<boolean> => {
    // Adicionar sufixo para identificar o tipo de relatório
    const nameWithSuffix = `${name} (Aniversários)`

    const success = await saveConfiguration({
      name: nameWithSuffix,
      selectedFields,
      type: 'birthday'
    })
    return success
  }

  // Função para carregar configuração (aniversários)
  const handleLoadConfiguration = (config: FilterConfiguration) => {
    try {
      console.log('🔄 Tentando carregar configuração de aniversários:', config.name)

      // Verificar se é uma configuração de aniversários
      if (!config.name.includes('(Aniversários)')) {
        console.warn('❌ VALIDAÇÃO FALHOU: Tentativa de carregar configuração de tipo incorreto na seção de aniversários')
        console.warn('   Nome da configuração:', config.name)
        console.warn('   Tipo esperado: deve conter "(Aniversários)"')
        return
      }

      console.log('✅ Validação de tipo passou: configuração é do tipo aniversários')

      // Validar se a configuração tem dados válidos
      if (!config.selectedFields || !Array.isArray(config.selectedFields) || config.selectedFields.length === 0) {
        console.error('Configuração com dados inválidos:', config)
        return
      }

      // Validar se os campos são válidos para aniversários
      const validFields = config.selectedFields.filter(field =>
        availableFields.some(available => available.id === field)
      )

      if (validFields.length === 0) {
        console.error('Nenhum campo válido encontrado na configuração de aniversários:', config)
        return
      }

      setSelectedFields(validFields)
      // Manter configurações abertas para que o usuário veja as mudanças nos ticks
    } catch (error) {
      console.error('Erro ao carregar configuração de aniversários:', error)
      // Manter estado atual em caso de erro
    }
  }

  // Função para excluir configuração (aniversários)
  const handleDeleteConfiguration = async (configId: string): Promise<boolean> => {
    console.log('🗑️ Tentando excluir configuração de aniversários:', configId)

    // Encontrar a configuração para validar o tipo antes de excluir
    const configToDelete = configurations.find(config => config.id === configId)

    if (configToDelete && !configToDelete.name.includes('(Aniversários)')) {
      console.error('❌ SEGURANÇA: Tentativa de excluir configuração que não é de aniversários')
      console.error('   ID:', configId)
      console.error('   Nome:', configToDelete.name)
      return false
    }

    console.log('✅ Validação de exclusão passou: configuração é do tipo aniversários')
    return await deleteConfiguration(configId)
  }

  // Função para salvar configuração (cashbacks)
  const handleSaveCashbackConfiguration = async (name: string): Promise<boolean> => {
    // Adicionar sufixo para identificar o tipo de relatório
    const nameWithSuffix = `${name} (Cashback)`

    const success = await saveCashbackConfiguration({
      name: nameWithSuffix,
      selectedFields: selectedCashbackFields,
      type: 'cashback'
    })
    return success
  }

  // Função para carregar configuração (cashbacks)
  const handleLoadCashbackConfiguration = (config: FilterConfiguration) => {
    try {
      // Verificar se é uma configuração de cashback
      if (!config.name.includes('(Cashback)')) {
        console.warn('Tentativa de carregar configuração de tipo incorreto na seção de cashback:', config)
        return
      }

      // Validar se a configuração tem dados válidos
      if (!config.selectedFields || !Array.isArray(config.selectedFields) || config.selectedFields.length === 0) {
        console.error('Configuração de cashback com dados inválidos:', config)
        return
      }

      // Validar se os campos são válidos para cashback
      const validFields = config.selectedFields.filter(field =>
        availableCashbackFields.some(available => available.id === field)
      )

      if (validFields.length === 0) {
        console.error('Nenhum campo válido encontrado na configuração de cashback:', config)
        return
      }

      setSelectedCashbackFields(validFields)
      // Manter configurações abertas para que o usuário veja as mudanças nos ticks
    } catch (error) {
      console.error('Erro ao carregar configuração de cashback:', error)
      // Manter estado atual em caso de erro
    }
  }

  // Função para excluir configuração (cashbacks)
  const handleDeleteCashbackConfiguration = async (configId: string): Promise<boolean> => {
    return await deleteCashbackConfiguration(configId)
  }

  // Função para salvar configuração (pesquisas)
  const handleSaveSurveyConfiguration = async (name: string): Promise<boolean> => {
    // Adicionar sufixo para identificar o tipo de relatório
    const nameWithSuffix = `${name} (Pesquisas)`

    const success = await saveSurveyConfiguration({
      name: nameWithSuffix,
      selectedFields: selectedSurveyFields,
      type: 'survey'
    })
    return success
  }

  // Função para carregar configuração (pesquisas)
  const handleLoadSurveyConfiguration = (config: FilterConfiguration) => {
    try {
      // Verificar se é uma configuração de pesquisas
      if (!config.name.includes('(Pesquisas)')) {
        console.warn('Tentativa de carregar configuração de tipo incorreto na seção de pesquisas:', config)
        return
      }

      // Validar se a configuração tem dados válidos
      if (!config.selectedFields || !Array.isArray(config.selectedFields) || config.selectedFields.length === 0) {
        console.error('Configuração de pesquisas com dados inválidos:', config)
        return
      }

      // Validar se os campos são válidos para pesquisas
      const validFields = config.selectedFields.filter(field =>
        availableSurveyFields.some(available => available.id === field)
      )

      if (validFields.length === 0) {
        console.error('Nenhum campo válido encontrado na configuração de pesquisas:', config)
        return
      }

      setSelectedSurveyFields(validFields)

      // Manter configurações abertas para que o usuário veja as mudanças nos ticks
    } catch (error) {
      console.error('Erro ao carregar configuração de pesquisas:', error)
      // Manter estado atual em caso de erro
    }
  }

  // Função para excluir configuração (pesquisas)
  const handleDeleteSurveyConfiguration = async (configId: string): Promise<boolean> => {
    return await deleteSurveyConfiguration(configId)
  }

  // Função para salvar configuração (promoções)
  const handleSavePromotionsConfiguration = async (name: string): Promise<boolean> => {
    console.log('🎯 [PROMOÇÕES] Iniciando salvamento de configuração...')
    console.log('🎯 [PROMOÇÕES] Nome original:', name)
    console.log('🎯 [PROMOÇÕES] Campos selecionados:', selectedPromotionsFields)
    
    // Adicionar sufixo para identificar o tipo de relatório
    const nameWithSuffix = `${name} (Promoções)`
    console.log('🎯 [PROMOÇÕES] Nome com sufixo:', nameWithSuffix)

    try {
      const success = await savePromotionsConfiguration({
        name: nameWithSuffix,
        selectedFields: selectedPromotionsFields,
        type: 'promotions'
      })
      
      console.log('🎯 [PROMOÇÕES] Resultado do salvamento:', success)
      return success
    } catch (error) {
      console.error('🎯 [PROMOÇÕES] Erro no salvamento:', error)
      return false
    }
  }

  // Função para carregar configuração (promoções)
  const handleLoadPromotionsConfiguration = (config: FilterConfiguration) => {
    try {
      // Verificar se é uma configuração de promoções
      if (!config.name.includes('(Promoções)')) {
        console.warn('Tentativa de carregar configuração de tipo incorreto na seção de promoções:', config)
        return
      }

      // Validar se a configuração tem dados válidos
      if (!config.selectedFields || !Array.isArray(config.selectedFields) || config.selectedFields.length === 0) {
        console.error('Configuração de promoções com dados inválidos:', config)
        return
      }

      // Validar se os campos são válidos para promoções
      const validFields = config.selectedFields.filter(field =>
        availablePromotionsFields.some(available => available.id === field)
      )

      if (validFields.length === 0) {
        console.error('Nenhum campo válido encontrado na configuração de promoções:', config)
        return
      }

      setSelectedPromotionsFields(validFields)
      // Manter configurações abertas para que o usuário veja as mudanças nos ticks
    } catch (error) {
      console.error('Erro ao carregar configuração de promoções:', error)
      // Manter estado atual em caso de erro
    }
  }

  // Função para excluir configuração (promoções)
  const handleDeletePromotionsConfiguration = async (configId: string): Promise<boolean> => {
    console.log('🗑️ Tentando excluir configuração de promoções:', configId)

    // Encontrar a configuração para validar o tipo antes de excluir
    const configToDelete = promotionsConfigurations.find(config => config.id === configId)

    if (configToDelete && !configToDelete.name.includes('(Promoções)')) {
      console.error('❌ SEGURANÇA: Tentativa de excluir configuração que não é de promoções')
      console.error('   ID:', configId)
      console.error('   Nome:', configToDelete.name)
      return false
    }

    console.log('✅ Validação de exclusão passou: configuração é do tipo promoções')
    return await deletePromotionsConfiguration(configId)
  }

  // Função para gerar o relatório em PDF
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)

    try {
      const response = await fetch('/api/reports/birthday/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields,
          startDate,
          endDate
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar relatório')
      }

      // Obter o PDF como blob
      const pdfBlob = await response.blob()

      // Criar URL para o blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob)

      // Abrir em nova aba
      window.open(pdfUrl, '_blank')

      // Limpar URL após um tempo
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 1000)

    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      // Mostrar erro para o usuário
      alert(`Erro ao gerar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Função para exportar para Excel
  const handleExportExcel = async () => {
    try {
      // Validar se há campos selecionados
      if (!selectedFields || selectedFields.length === 0) {
        alert('Selecione pelo menos um campo para exportar.')
        return
      }

      // Buscar dados da API
      const response = await fetch('/api/reports/birthday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields,
          startDate,
          endDate,
          selectedStore: selectedStore === 'all' ? '' : selectedStore
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados')
      }

      // Validar se há dados para exportar
      if (!data.data || data.data.length === 0) {
        alert('Não há dados para exportar no período selecionado.')
        return
      }

      const fieldLabels = availableFields.reduce((acc, field) => {
        acc[field.id] = field.label
        return acc
      }, {} as { [key: string]: string })

      excelExportService.exportCustomBirthdayReportToExcel(
        data.data,
        selectedFields,
        fieldLabels
      )
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao exportar para Excel: ${errorMessage}`)
    }
  }

  // Função para abrir modal de preview do cashback
  const handleOpenCashbackPreview = () => {
    setIsCashbackPreviewModalOpen(true)
  }

  // Função para abrir modal de preview de aniversários
  const handleOpenBirthdayPreview = () => {
    setIsBirthdayPreviewModalOpen(true)
  }

  // Função para gerar relatório de cashback (mantida para compatibilidade)
  const handleGenerateCashbackReport = async () => {
    setIsGeneratingCashbackReport(true)

    try {
      console.log('🔄 Iniciando geração de relatório de cashback PDF...')
      console.log('📋 Campos selecionados:', selectedCashbackFields)
      console.log('📅 Período:', { startDate, endDate })

      const response = await fetch('/api/reports/cashback/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields: selectedCashbackFields,
          startDate,
          endDate,
          selectedStore: selectedStore === 'all' ? '' : selectedStore
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao gerar relatório de cashback')
      }

      // Verificar se a resposta é PDF ou HTML (fallback)
      const contentType = response.headers.get('content-type')
      console.log('📄 Tipo de conteúdo recebido:', contentType)

      if (contentType?.includes('application/pdf')) {
        // Resposta é PDF
        const pdfBlob = await response.blob()
        const pdfUrl = window.URL.createObjectURL(pdfBlob)

        console.log('✅ PDF de cashback gerado com sucesso')
        window.open(pdfUrl, '_blank')

        // Limpar URL após um tempo
        setTimeout(() => {
          window.URL.revokeObjectURL(pdfUrl)
        }, 1000)
      } else if (contentType?.includes('text/html')) {
        // Resposta é HTML (fallback)
        const htmlText = await response.text()
        const htmlBlob = new Blob([htmlText], { type: 'text/html' })
        const htmlUrl = window.URL.createObjectURL(htmlBlob)

        console.log('⚠️ Fallback: HTML de cashback gerado (Puppeteer falhou)')
        window.open(htmlUrl, '_blank')

        // Limpar URL após um tempo
        setTimeout(() => {
          window.URL.revokeObjectURL(htmlUrl)
        }, 1000)
      } else {
        throw new Error('Tipo de resposta não reconhecido')
      }

    } catch (error) {
      console.error('💥 Erro ao gerar relatório de cashback:', error)

      // Mostrar erro detalhado para o usuário
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao gerar relatório de cashback: ${errorMessage}`)
    } finally {
      setIsGeneratingCashbackReport(false)
    }
  }

  // Função para exportar cashback para Excel
  const handleExportCashbackExcel = async () => {
    try {
      // Validar se há campos selecionados
      if (!selectedCashbackFields || selectedCashbackFields.length === 0) {
        alert('Selecione pelo menos um campo para exportar.')
        return
      }

      // Buscar dados da API
      const response = await fetch('/api/reports/cashback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields: selectedCashbackFields,
          startDate,
          endDate,
          selectedStore: selectedStore === 'all' ? '' : selectedStore
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados')
      }

      // Validar se há dados para exportar
      if (!data.data || data.data.length === 0) {
        alert('Nenhum dado de cashback encontrado para a sua empresa.')
        return
      }

      const fieldLabels = availableCashbackFields.reduce((acc, field) => {
        acc[field.id] = field.label
        return acc
      }, {} as { [key: string]: string })

      excelExportService.exportCustomCashbackReportToExcel(
        data.data,
        selectedCashbackFields,
        fieldLabels
      )
    } catch (error) {
      console.error('Erro ao exportar cashback para Excel:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao exportar cashback para Excel: ${errorMessage}`)
    }
  }

  // Função para gerar relatório de pesquisas
  const handleGenerateSurveyReport = async () => {
    console.log('🎯 [PÁGINA] Botão "Ver" clicado - Iniciando geração de relatório de pesquisas')
    console.log('🎯 [PÁGINA] Campos selecionados:', selectedSurveyFields)
    console.log('🎯 [PÁGINA] Período:', { startDate, endDate })

    setIsGeneratingSurveyReport(true)
    try {
      console.log('🎯 [PÁGINA] Abrindo modal de preview...')
      // Abrir modal de preview
      setIsSurveyPreviewModalOpen(true)
      console.log('🎯 [PÁGINA] Modal aberto com sucesso')
    } catch (error) {
      console.error('💥 [PÁGINA] Erro ao gerar relatório de pesquisas:', error)
      alert('Erro ao gerar relatório de pesquisas')
    } finally {
      setIsGeneratingSurveyReport(false)
      console.log('🎯 [PÁGINA] Processo finalizado')
    }
  }

  // Função para exportar pesquisas para Excel
  const handleExportSurveyExcel = async () => {
    try {
      // Validar se há campos selecionados
      if (!selectedSurveyFields || selectedSurveyFields.length === 0) {
        alert('Selecione pelo menos um campo para exportar.')
        return
      }

      // Buscar dados da API
      const response = await fetch('/api/reports/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields: selectedSurveyFields,
          startDate,
          endDate,
          selectedStore: selectedStore === 'all' ? '' : selectedStore
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados')
      }

      // Validar se há dados para exportar
      if (!data.data || data.data.length === 0) {
        alert('Não há dados para exportar no período selecionado.')
        return
      }

      const fieldLabels = availableSurveyFields.reduce((acc, field) => {
        acc[field.id] = field.label
        return acc
      }, {} as { [key: string]: string })

      excelExportService.exportCustomSurveyReportToExcel(
        data.data,
        selectedSurveyFields,
        fieldLabels
      )
    } catch (error) {
      console.error('Erro ao exportar pesquisas para Excel:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao exportar pesquisas para Excel: ${errorMessage}`)
    }
  }

  // Função para gerar relatório de promoções
  const handleGeneratePromotionsReport = async () => {
    console.log('🎯 [PÁGINA] Botão "Ver" clicado - Iniciando geração de relatório de promoções')
    console.log('🎯 [PÁGINA] Campos selecionados:', selectedPromotionsFields)
    console.log('🎯 [PÁGINA] Período:', { startDate, endDate })

    setIsGeneratingPromotionsReport(true)
    try {
      console.log('🎯 [PÁGINA] Abrindo modal de preview...')
      // Abrir modal de preview (por enquanto apenas placeholder)
      setIsPromotionsPreviewModalOpen(true)
      console.log('🎯 [PÁGINA] Modal aberto com sucesso')
    } catch (error) {
      console.error('💥 [PÁGINA] Erro ao gerar relatório de promoções:', error)
      alert('Erro ao gerar relatório de promoções')
    } finally {
      setIsGeneratingPromotionsReport(false)
      console.log('🎯 [PÁGINA] Processo finalizado')
    }
  }

  // Função para exportar promoções para Excel
  const handleExportPromotionsExcel = async () => {
    try {
      // Validar se há campos selecionados
      if (!selectedPromotionsFields || selectedPromotionsFields.length === 0) {
        alert('Selecione pelo menos um campo para exportar.')
        return
      }

      // Buscar dados da API
      const response = await fetch('/api/reports/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields: selectedPromotionsFields,
          startDate,
          endDate,
          selectedStore: selectedStore === 'all' ? '' : selectedStore
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados')
      }

      // Validar se há dados para exportar
      if (!data.data || data.data.length === 0) {
        alert('Não há dados para exportar no período selecionado.')
        return
      }

      const fieldLabels = availablePromotionsFields.reduce((acc, field) => {
        acc[field.id] = field.label
        return acc
      }, {} as { [key: string]: string })

      excelExportService.exportCustomPromotionsReportToExcel(
        data.data,
        selectedPromotionsFields,
        fieldLabels
      )
    } catch (error) {
      console.error('Erro ao exportar promoções para Excel:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao exportar promoções para Excel: ${errorMessage}`)
    }
  }

  // Carregar dados do usuário do banco
  const loadUserData = async () => {
    try {
      if (!user?.email) {
        console.error('Email do usuário não encontrado');
        return null;
      }

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

      const isSuperAdmin = userData.nivel === 'Super Admin';
      
      if (isSuperAdmin) {
        const rede = userData.rede || user?.rede || '';
        
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
      } else {
        const userLoja = userData.loja || '';
        
        if (userLoja) {
          const lojasFormatadas = [{
            id: userLoja,
            name: userLoja
          }];
          setStores(lojasFormatadas);
          setSelectedStore(userLoja);
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
    const userData = await loadUserData();
    if (userData) {
      await loadLojas(userData);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    if (user) {
      loadUserDataAndLojas();
    }
  }, [user]);

  // Verificar se botões devem estar habilitados
  const canGenerateReport = selectedFields.length > 0 && (startDate || endDate)
  const canGenerateCashbackReport = selectedCashbackFields.length > 0 && (startDate || endDate)
  const canGenerateSurveyReport = selectedSurveyFields.length > 0 && (startDate || endDate)
  const canGeneratePromotionsReport = selectedPromotionsFields.length > 0 && (startDate || endDate)


  return (
    <div className="space-y-6 text-gray-700 p-2 sm:p-4 md:p-6 w-full max-w-[100vw] overflow-hidden">

      {/* Filtros para Geração de Relatórios */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg sm:text-xl">Filtros para Geração de Relatórios</CardTitle>
          <CardDescription className="text-gray-500">Configure os parâmetros para gerar relatórios personalizados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium text-gray-600">Data Inicial</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                  placeholder="Selecione"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium text-gray-600">Data Final</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                  placeholder="Selecione"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-filter" className="text-sm font-medium text-gray-600">Filtro por Loja</Label>
              {userBankData?.nivel === 'Super Admin' ? (
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-gray-400 mr-2" />
                      <SelectValue placeholder="Todas as lojas" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        Todas as lojas
                      </div>
                    </SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : userBankData?.loja ? (
                <Select value={userBankData.loja} disabled>
                  <SelectTrigger className="w-full border-gray-200 bg-gray-100">
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-gray-400 mr-2" />
                      <SelectValue>{userBankData.loja}</SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={userBankData.loja}>
                      {userBankData.loja}
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
                  <Store className="h-4 w-4 text-gray-400 mr-2" />
                  Carregando loja...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Card Relatório de Aniversários */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Cake className="h-6 w-6 text-white stroke-2" />
                </div>
                <div>
                  <CardTitle className="text-gray-800 text-lg">Relatório de Aniversários</CardTitle>
                  <CardDescription className="text-gray-500">Relatório automático do envio de aniversários</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                className="text-gray-500 hover:bg-transparent hover:text-gray-500 group min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
                aria-expanded={isConfigExpanded}
                aria-controls="birthday-report-config"
                aria-label={isConfigExpanded ? "Fechar configurações do relatório" : "Abrir configurações do relatório"}
              >
                <Settings className="h-4 w-4 mr-1 transition-transform duration-500 ease-out group-hover:rotate-180" aria-hidden="true" />
                {isConfigExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardHeader>

          {/* Seção de Configuração */}
          {isConfigExpanded && (
            <div
              id="birthday-report-config"
              className="px-6 pb-3 border-b border-gray-100"
              role="region"
              aria-labelledby="config-heading"
            >
              <div className="space-y-3">
                <h5
                  id="config-heading"
                  className="font-medium text-gray-700 text-sm"
                >
                  Configurações do Relatório
                </h5>

                {/* Seleção de Campos */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-gray-600">Campos a incluir:</legend>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2"
                    role="group"
                    aria-labelledby="fields-legend"
                  >
                    {availableFields.map((field) => (
                      <div key={field.id} className="flex items-center space-x-3 sm:space-x-2 py-1">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                          className={`${selectedFields.includes(field.id) ? 'data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-pink-400 data-[state=checked]:to-rose-500 border-pink-400' : 'border-pink-300 hover:border-pink-400'} min-h-[20px] min-w-[20px]`}
                          aria-describedby={`${field.id}-description`}
                        />
                        <Label
                          htmlFor={field.id}
                          className={`text-sm text-gray-700 cursor-pointer flex-1 py-2 sm:py-0`}
                        >
                          {field.label}
                        </Label>
                        <span
                          id={`${field.id}-description`}
                          className="sr-only"
                        >
                          {field.description}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedFields.length === 0 && (
                    <p
                      className="text-xs text-red-500"
                      role="alert"
                      aria-live="polite"
                    >
                      Selecione pelo menos um campo
                    </p>
                  )}
                  {selectedFields.length > 0 && !startDate && !endDate && (
                    <p
                      className="text-xs text-amber-600"
                      role="alert"
                      aria-live="polite"
                    >
                      Configure as datas nos filtros acima para gerar o relatório
                    </p>
                  )}
                </fieldset>

                {/* Seção de Salvamento e Configurações Salvas */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  {/* Botão Salvar Configuração */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h6 className="text-sm font-medium text-gray-600">Gerenciar Configurações</h6>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConfigListExpanded(!isConfigListExpanded)}
                        className="text-gray-500 hover:bg-transparent hover:text-gray-500 p-1"
                        aria-expanded={isConfigListExpanded}
                        aria-label={isConfigListExpanded ? "Ocultar configurações salvas" : "Mostrar configurações salvas"}
                      >
                        {isConfigListExpanded ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSaveModalOpen(true)}
                      disabled={selectedFields.length === 0 || isSaving || !canSaveMore}
                      className="text-xs sm:text-xs border-pink-400 text-pink-600 hover:bg-pink-600 hover:text-white disabled:opacity-50 min-h-[36px] px-3 sm:px-2 transition-colors duration-200"
                      title={!canSaveMore ? "Limite máximo de configurações atingido (10)" : "Salvar configuração atual"}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  </div>

                  {/* Lista de Configurações Salvas */}
                  {isConfigListExpanded && (
                    <div className="mt-3">
                      <SavedConfigurationsList
                        configurations={configurations}
                        onLoad={handleLoadConfiguration}
                        onDelete={handleDeleteConfiguration}
                        isLoading={isLoadingConfigs}
                      />
                    </div>
                  )}

                  {/* Mensagem de Erro */}
                  {configError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {configError}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={retryLoad}
                          className="underline hover:no-underline"
                          disabled={isLoadingConfigs}
                        >
                          {isLoadingConfigs ? 'Tentando...' : 'Tentar novamente'}
                        </button>
                        <button
                          onClick={clearError}
                          className="underline hover:no-underline"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Button
                onClick={handleOpenBirthdayPreview}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                disabled={!canGenerateReport}
                title={!canGenerateReport ? "Selecione campos e pelo menos uma data" : "Visualizar dados do relatório"}
              >
                <Search className="h-4 w-4 mr-2" />
                Ver
              </Button>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="flex-1 border-green-500 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200"
                disabled={!canGenerateReport || isGeneratingReport}
                title="Gerar e baixar relatório em Excel"
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Relatório de Cashbacks */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-white stroke-2" />
                </div>
                <div>
                  <CardTitle className="text-gray-800 text-lg">Relatório de Cashbacks</CardTitle>
                  <CardDescription className="text-gray-500">Relatório automático de transações de cashback</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCashbackConfigExpanded(!isCashbackConfigExpanded)}
                className="text-gray-500 hover:bg-transparent hover:text-gray-500 group min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
                aria-expanded={isCashbackConfigExpanded}
                aria-controls="cashback-report-config"
                aria-label={isCashbackConfigExpanded ? "Fechar configurações do relatório" : "Abrir configurações do relatório"}
              >
                <Settings className="h-4 w-4 mr-1 transition-transform duration-500 ease-out group-hover:rotate-180" aria-hidden="true" />
                {isCashbackConfigExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardHeader>

          {/* Seção de Configuração do Cashback */}
          {isCashbackConfigExpanded && (
            <div
              id="cashback-report-config"
              className="px-6 pb-3 border-b border-gray-100"
              role="region"
              aria-labelledby="cashback-config-heading"
            >
              <div className="space-y-3">
                <h5
                  id="cashback-config-heading"
                  className="font-medium text-gray-700 text-sm"
                >
                  Configurações do Relatório de Cashback
                </h5>

                {/* Seleção de Campos do Cashback */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-gray-600">Campos a incluir:</legend>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2"
                    role="group"
                    aria-labelledby="cashback-fields-legend"
                  >
                    {availableCashbackFields.map((field) => (
                      <div key={field.id} className="flex items-center space-x-3 sm:space-x-2 py-1">
                        <Checkbox
                          id={`cashback-${field.id}`}
                          checked={selectedCashbackFields.includes(field.id)}
                          onCheckedChange={() => toggleCashbackField(field.id)}
                          className={`${selectedCashbackFields.includes(field.id) ? 'data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600 border-green-500' : 'border-green-300 hover:border-green-500'} min-h-[20px] min-w-[20px]`}
                          aria-describedby={`cashback-${field.id}-description`}
                        />
                        <Label
                          htmlFor={`cashback-${field.id}`}
                          className={`text-sm text-gray-700 cursor-pointer flex-1 py-2 sm:py-0`}
                        >
                          {field.label}
                        </Label>
                        <span
                          id={`cashback-${field.id}-description`}
                          className="sr-only"
                        >
                          {field.description}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedCashbackFields.length === 0 && (
                    <p
                      className="text-xs text-red-500"
                      role="alert"
                      aria-live="polite"
                    >
                      Selecione pelo menos um campo
                    </p>
                  )}
                  {selectedCashbackFields.length > 0 && !startDate && !endDate && (
                    <p
                      className="text-xs text-amber-600"
                      role="alert"
                      aria-live="polite"
                    >
                      Configure as datas nos filtros acima para gerar o relatório
                    </p>
                  )}
                </fieldset>

                {/* Seção de Salvamento e Configurações Salvas - Cashback */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  {/* Botão Salvar Configuração */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h6 className="text-sm font-medium text-gray-600">Gerenciar Configurações</h6>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCashbackConfigListExpanded(!isCashbackConfigListExpanded)}
                        className="text-gray-500 hover:bg-transparent hover:text-gray-500 p-1"
                        aria-expanded={isCashbackConfigListExpanded}
                        aria-label={isCashbackConfigListExpanded ? "Ocultar configurações salvas" : "Mostrar configurações salvas"}
                      >
                        {isCashbackConfigListExpanded ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCashbackSaveModalOpen(true)}
                      disabled={selectedCashbackFields.length === 0 || isSavingCashback || cashbackConfigurations.length >= 10}
                      className="text-xs sm:text-xs border-green-500 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50 min-h-[36px] px-3 sm:px-2 transition-colors duration-200"
                      title={cashbackConfigurations.length >= 10 ? "Limite máximo de configurações atingido (10)" : "Salvar configuração atual"}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  </div>

                  {/* Lista de Configurações Salvas */}
                  {isCashbackConfigListExpanded && (
                    <div className="mt-3">
                      <SavedConfigurationsList
                        configurations={cashbackConfigurations}
                        onLoad={handleLoadCashbackConfiguration}
                        onDelete={handleDeleteCashbackConfiguration}
                        isLoading={isLoadingCashbackConfigs}
                      />
                    </div>
                  )}

                  {/* Mensagem de Erro */}
                  {cashbackConfigError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {cashbackConfigError}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={retryCashbackLoad}
                          className="underline hover:no-underline"
                          disabled={isLoadingCashbackConfigs}
                        >
                          {isLoadingCashbackConfigs ? 'Tentando...' : 'Tentar novamente'}
                        </button>
                        <button
                          onClick={clearCashbackError}
                          className="underline hover:no-underline"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Button
                onClick={handleOpenCashbackPreview}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                disabled={!canGenerateCashbackReport}
                title={!canGenerateCashbackReport ? "Selecione campos e pelo menos uma data" : "Gerar relatório de cashback"}
              >
                {isGeneratingCashbackReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Ver
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCashbackExcel}
                className="flex-1 border-green-500 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200"
                disabled={!canGenerateCashbackReport || isGeneratingCashbackReport}
                title="Gerar e baixar relatório de cashback em Excel"
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Relatório de Pesquisas de Satisfação */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Search className="h-6 w-6 text-white stroke-2" />
                </div>
                <div>
                  <CardTitle className="text-gray-800 text-lg">Relatório de Pesquisas</CardTitle>
                  <CardDescription className="text-gray-500">Relatório automático de pesquisas de satisfação</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSurveyConfigExpanded(!isSurveyConfigExpanded)}
                className="text-gray-500 hover:bg-transparent hover:text-gray-500 group min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
                aria-expanded={isSurveyConfigExpanded}
                aria-controls="survey-report-config"
                aria-label={isSurveyConfigExpanded ? "Fechar configurações do relatório" : "Abrir configurações do relatório"}
              >
                <Settings className="h-4 w-4 mr-1 transition-transform duration-500 ease-out group-hover:rotate-180" aria-hidden="true" />
                {isSurveyConfigExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardHeader>

          {/* Seção de Configuração das Pesquisas */}
          {isSurveyConfigExpanded && (
            <div
              id="survey-report-config"
              className="px-6 pb-3 border-b border-gray-100"
              role="region"
              aria-labelledby="survey-config-heading"
            >
              <div className="space-y-3">
                <h5
                  id="survey-config-heading"
                  className="font-medium text-gray-700 text-sm"
                >
                  Configurações do Relatório de Pesquisas
                </h5>

                {/* Seleção de Campos das Pesquisas */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-gray-600">Campos a incluir:</legend>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2"
                    role="group"
                    aria-labelledby="survey-fields-legend"
                  >
                    {availableSurveyFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        {/* Checkbox */}
                        <div className="flex items-center space-x-3 sm:space-x-2 py-1">
                          <Checkbox
                            id={`survey-${field.id}`}
                            checked={selectedSurveyFields.includes(field.id)}
                            onCheckedChange={() => toggleSurveyField(field.id)}
                            className={`${selectedSurveyFields.includes(field.id) ? 'data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-purple-500 data-[state=checked]:to-indigo-600 border-purple-500' : 'border-purple-300 hover:border-purple-500'} min-h-[20px] min-w-[20px]`}
                            aria-describedby={`survey-${field.id}-description`}
                          />
                          <Label
                            htmlFor={`survey-${field.id}`}
                            className={`text-sm text-gray-700 cursor-pointer flex-1 py-2 sm:py-0`}
                          >
                            {field.label}
                          </Label>
                          <span
                            id={`survey-${field.id}-description`}
                            className="sr-only"
                          >
                            {field.description}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                  {selectedSurveyFields.length === 0 && (
                    <p
                      className="text-xs text-red-500"
                      role="alert"
                      aria-live="polite"
                    >
                      Selecione pelo menos um campo
                    </p>
                  )}
                  {selectedSurveyFields.length > 0 && !startDate && !endDate && (
                    <p
                      className="text-xs text-amber-600"
                      role="alert"
                      aria-live="polite"
                    >
                      Configure as datas nos filtros acima para gerar o relatório
                    </p>
                  )}


                </fieldset>

                {/* Seção de Salvamento e Configurações Salvas - Pesquisas */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  {/* Botão Salvar Configuração */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h6 className="text-sm font-medium text-gray-600">Gerenciar Configurações</h6>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSurveyConfigListExpanded(!isSurveyConfigListExpanded)}
                        className="text-gray-500 hover:bg-transparent hover:text-gray-500 p-1"
                        aria-expanded={isSurveyConfigListExpanded}
                        aria-label={isSurveyConfigListExpanded ? "Ocultar configurações salvas" : "Mostrar configurações salvas"}
                      >
                        {isSurveyConfigListExpanded ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSurveySaveModalOpen(true)}
                      disabled={selectedSurveyFields.length === 0 || isSavingSurvey || surveyConfigurations.length >= 10}
                      className="text-xs sm:text-xs border-purple-500 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 min-h-[36px] px-3 sm:px-2 transition-colors duration-200"
                      title={surveyConfigurations.length >= 10 ? "Limite máximo de configurações atingido (10)" : "Salvar configuração atual"}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  </div>

                  {/* Lista de Configurações Salvas */}
                  {isSurveyConfigListExpanded && (
                    <div className="mt-3">
                      <SavedConfigurationsList
                        configurations={surveyConfigurations}
                        onLoad={handleLoadSurveyConfiguration}
                        onDelete={handleDeleteSurveyConfiguration}
                        isLoading={isLoadingSurveyConfigs}
                      />
                    </div>
                  )}

                  {/* Mensagem de Erro */}
                  {surveyConfigError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {surveyConfigError}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={retrySurveyLoad}
                          className="underline hover:no-underline"
                          disabled={isLoadingSurveyConfigs}
                        >
                          {isLoadingSurveyConfigs ? 'Tentando...' : 'Tentar novamente'}
                        </button>
                        <button
                          onClick={clearSurveyError}
                          className="underline hover:no-underline"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateSurveyReport}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                disabled={!canGenerateSurveyReport}
                title={!canGenerateSurveyReport ? "Selecione campos e pelo menos uma data" : "Gerar relatório de pesquisas"}
              >
                {isGeneratingSurveyReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Ver
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportSurveyExcel}
                className="flex-1 border-green-500 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200"
                disabled={!canGenerateSurveyReport || isGeneratingSurveyReport}
                title="Gerar e baixar relatório de pesquisas em Excel"
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Relatório de Promoções - Seção separada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Percent className="h-6 w-6 text-white stroke-2" />
                </div>
                <div>
                  <CardTitle className="text-gray-800 text-lg">Relatório de Promoções</CardTitle>
                  <CardDescription className="text-gray-500">Relatório automático de campanhas promocionais e descontos</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPromotionsConfigExpanded(!isPromotionsConfigExpanded)}
                className="text-gray-500 hover:bg-transparent hover:text-gray-500 group min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
                aria-expanded={isPromotionsConfigExpanded}
                aria-controls="promotions-report-config"
                aria-label={isPromotionsConfigExpanded ? "Fechar configurações do relatório" : "Abrir configurações do relatório"}
              >
                <Settings className="h-4 w-4 mr-1 transition-transform duration-500 ease-out group-hover:rotate-180" aria-hidden="true" />
                {isPromotionsConfigExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardHeader>

          {/* Seção de Configuração das Promoções */}
          {isPromotionsConfigExpanded && (
            <div
              id="promotions-report-config"
              className="px-6 pb-3 border-b border-gray-100"
              role="region"
              aria-labelledby="promotions-config-heading"
            >
              <div className="space-y-3">
                <h5
                  id="promotions-config-heading"
                  className="font-medium text-gray-700 text-sm"
                >
                  Configurações do Relatório de Promoções
                </h5>

                {/* Seleção de Campos das Promoções */}
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium text-gray-600">Campos a incluir:</legend>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2"
                    role="group"
                    aria-labelledby="promotions-fields-legend"
                  >
                    {availablePromotionsFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        {/* Checkbox */}
                        <div className="flex items-center space-x-3 sm:space-x-2 py-1">
                          <Checkbox
                            id={`promotions-${field.id}`}
                            checked={selectedPromotionsFields.includes(field.id)}
                            onCheckedChange={() => togglePromotionsField(field.id)}
                            className={`${selectedPromotionsFields.includes(field.id) ? 'data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-yellow-400 data-[state=checked]:to-orange-500 border-yellow-400' : 'border-yellow-300 hover:border-yellow-400'} min-h-[20px] min-w-[20px]`}
                            aria-describedby={`promotions-${field.id}-description`}
                          />
                          <Label
                            htmlFor={`promotions-${field.id}`}
                            className={`text-sm text-gray-700 cursor-pointer flex-1 py-2 sm:py-0`}
                          >
                            {field.label}
                          </Label>
                          <span
                            id={`promotions-${field.id}-description`}
                            className="sr-only"
                          >
                            {field.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedPromotionsFields.length === 0 && (
                    <p
                      className="text-xs text-red-500"
                      role="alert"
                      aria-live="polite"
                    >
                      Selecione pelo menos um campo
                    </p>
                  )}
                  {selectedPromotionsFields.length > 0 && !startDate && !endDate && (
                    <p
                      className="text-xs text-amber-600"
                      role="alert"
                      aria-live="polite"
                    >
                      Configure as datas nos filtros acima para gerar o relatório
                    </p>
                  )}
                </fieldset>

                {/* Seção de Salvamento e Configurações Salvas - Promoções */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  {/* Botão Salvar Configuração */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h6 className="text-sm font-medium text-gray-600">Gerenciar Configurações</h6>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPromotionsConfigListExpanded(!isPromotionsConfigListExpanded)}
                        className="text-gray-500 hover:bg-transparent hover:text-gray-500 p-1"
                        aria-label="Mostrar configurações salvas"
                      >
                        {isPromotionsConfigListExpanded ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPromotionsSaveModalOpen(true)}
                      disabled={selectedPromotionsFields.length === 0 || !canSaveMorePromotions}
                      className="text-xs sm:text-xs border-yellow-400 text-yellow-600 hover:bg-yellow-500 hover:text-white disabled:opacity-50 min-h-[36px] px-3 sm:px-2 transition-colors duration-200"
                      title="Salvar configuração atual"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  </div>

                  {/* Lista de Configurações Salvas - Promoções */}
                  {isPromotionsConfigListExpanded && (
                    <SavedConfigurationsList
                      configurations={promotionsConfigurations}
                      onLoad={handleLoadPromotionsConfiguration}
                      onDelete={handleDeletePromotionsConfiguration}
                      isLoading={isLoadingPromotionsConfigs}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePromotionsReport}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={!canGeneratePromotionsReport}
                title={!canGeneratePromotionsReport ? "Selecione campos e pelo menos uma data" : "Gerar relatório de promoções"}
              >
                {isGeneratingPromotionsReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Percent className="h-4 w-4 mr-2" />
                    Ver
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPromotionsExcel}
                className="flex-1 border-green-500 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-200"
                disabled={!canGeneratePromotionsReport || isGeneratingPromotionsReport}
                title="Gerar e baixar relatório de promoções em Excel"
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Salvamento - Aniversários */}
      <SaveConfigurationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfiguration}
        isNameDuplicate={isNameDuplicate}
        isSaving={isSaving}
      />

      {/* Modal de Salvamento - Cashbacks */}
      <SaveConfigurationModal
        isOpen={isCashbackSaveModalOpen}
        onClose={() => setIsCashbackSaveModalOpen(false)}
        onSave={handleSaveCashbackConfiguration}
        isNameDuplicate={isCashbackNameDuplicate}
        isSaving={isSavingCashback}
      />

      {/* Modal de Salvamento - Pesquisas */}
      <SaveConfigurationModal
        isOpen={isSurveySaveModalOpen}
        onClose={() => setIsSurveySaveModalOpen(false)}
        onSave={handleSaveSurveyConfiguration}
        isNameDuplicate={isSurveyNameDuplicate}
        isSaving={isSavingSurvey}
      />

      {/* Modal de Salvamento - Promoções */}
      <SaveConfigurationModal
        isOpen={isPromotionsSaveModalOpen}
        onClose={() => setIsPromotionsSaveModalOpen(false)}
        onSave={handleSavePromotionsConfiguration}
        isNameDuplicate={isPromotionsNameDuplicate}
        isSaving={isSavingPromotions}
      />

      {/* Modal de Preview - Aniversários */}
      <BirthdayPreviewModal
        isOpen={isBirthdayPreviewModalOpen}
        onClose={() => setIsBirthdayPreviewModalOpen(false)}
        selectedFields={selectedFields}
        startDate={startDate}
        endDate={endDate}
        selectedStore={selectedStore === 'all' ? '' : selectedStore}
        fieldLabels={availableFields.reduce((acc, field) => {
          acc[field.id] = field.label
          return acc
        }, {} as { [key: string]: string })}
      />

      {/* Modal de Preview - Cashback */}
      <CashbackPreviewModal
        isOpen={isCashbackPreviewModalOpen}
        onClose={() => setIsCashbackPreviewModalOpen(false)}
        selectedFields={selectedCashbackFields}
        startDate={startDate}
        endDate={endDate}
        selectedStore={selectedStore === 'all' ? '' : selectedStore}
        fieldLabels={availableCashbackFields.reduce((acc, field) => {
          acc[field.id] = field.label
          return acc
        }, {} as { [key: string]: string })}
      />

      {/* Modal de Preview - Pesquisas */}
      <SurveyPreviewModal
        isOpen={isSurveyPreviewModalOpen}
        onClose={() => setIsSurveyPreviewModalOpen(false)}
        selectedFields={selectedSurveyFields}
        startDate={startDate}
        endDate={endDate}
        selectedStore={selectedStore === 'all' ? '' : selectedStore}
        fieldLabels={availableSurveyFields.reduce((acc, field) => {
          acc[field.id] = field.label
          return acc
        }, {} as { [key: string]: string })}
      />

      {/* Modal de Preview - Promoções */}
      <PromotionsPreviewModal
        isOpen={isPromotionsPreviewModalOpen}
        onClose={() => setIsPromotionsPreviewModalOpen(false)}
        selectedFields={selectedPromotionsFields}
        startDate={startDate}
        endDate={endDate}
        selectedStore={selectedStore === 'all' ? '' : selectedStore}
        fieldLabels={availablePromotionsFields.reduce((acc, field) => {
          acc[field.id] = field.label
          return acc
        }, {} as { [key: string]: string })}
      />

    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRouteWithPermission requiredPermission="telaShot_relatorios">
      <ReportsPageContent />
    </ProtectedRouteWithPermission>
  )
}
