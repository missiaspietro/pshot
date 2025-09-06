"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { normalizeText } from "@/lib/text-utils"

interface SurveyPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFields: string[]
  startDate: string
  endDate: string
  selectedStore: string
  fieldLabels: { [key: string]: string }
}

interface SurveyData {
  [key: string]: any
}

interface ErrorState {
  message: string
  type: 'network' | 'auth' | 'permission' | 'timeout' | 'server' | 'unknown'
  canRetry: boolean
}

export function SurveyPreviewModal({
  isOpen,
  onClose,
  selectedFields,
  startDate,
  endDate,
  selectedStore,
  fieldLabels
}: SurveyPreviewModalProps) {
  const [allData, setAllData] = useState<SurveyData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  // Estados para paginacao
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  
  // Calcular dados da pagina atual
  const totalItems = allData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = allData.slice(startIndex, endIndex)

  // Funcao para determinar o tipo de erro
  const determineErrorType = (error: any): ErrorState => {
    const errorMessage = error?.message?.toLowerCase() || ''
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        message: 'Erro de conexao. Verifique sua internet e tente novamente.',
        type: 'network',
        canRetry: true
      }
    }
    
    if (errorMessage.includes('timeout')) {
      return {
        message: 'Tempo limite excedido. Tente novamente em alguns instantes.',
        type: 'timeout',
        canRetry: true
      }
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return {
        message: 'Sem permissao para acessar os dados de pesquisas.',
        type: 'permission',
        canRetry: false
      }
    }
    
    if (errorMessage.includes('server') || error?.status >= 500) {
      return {
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
        type: 'server',
        canRetry: true
      }
    }
    
    return {
      message: 'Erro ao carregar dados de pesquisas. Tente novamente.',
      type: 'unknown',
      canRetry: true
    }
  }

  // Funcao para buscar dados de pesquisas
  const fetchSurveyData = async () => {
    if (!isOpen) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reports/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          startDate,
          endDate,
          selectedFields,
          selectedStore
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setAllData(data.data || [])
      setCurrentPage(1)
      setRetryCount(0)
      
    } catch (err) {
      console.error('Erro ao buscar dados de pesquisas:', err)
      setError(determineErrorType(err))
      setAllData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Funcao para retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchSurveyData()
  }

  // Funcao para gerar PDF
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const user = JSON.parse(localStorage.getItem('ps_user') || '{}')
      
      const response = await fetch('/api/reports/survey/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          empresa: user.empresa,
          startDate,
          endDate,
          selectedFields,
          data: allData
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Abrir PDF em nova aba ao inves de forcar download
      window.open(url, '_blank')
      
      // Limpar o blob URL apos um tempo para liberar memoria
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
      
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Funcao para formatar valor da celula
  const formatCellValue = (value: any, field: string): string => {
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    // Campos especificos de pesquisas
    if (field === 'resposta') {
      const respostaMap: { [key: string]: string } = {
        '1': 'Otimo',
        '2': 'Bom', 
        '3': 'Regular',
        '4': 'Pessimo'
      }
      return respostaMap[String(value)] || String(value)
    }

    if (field === 'telefone' && String(value).length > 10) {
      // Formatar telefone
      const phone = String(value).replace(/\D/g, '')
      if (phone.length === 11) {
        return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
      }
    }

    if (field === 'data_de_envio') {
      try {
        const date = new Date(value)
        return date.toLocaleDateString('pt-BR')
      } catch {
        return String(value)
      }
    }

    return normalizeText(String(value))
  }

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchSurveyData()
    }
  }, [isOpen, startDate, endDate, selectedFields])

  // Resetar estado quando fechar
  useEffect(() => {
    if (!isOpen) {
      setAllData([])
      setError(null)
      setCurrentPage(1)
      setRetryCount(0)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Relatorio de Pesquisas
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-sm text-gray-600">Carregando dados de pesquisas...</p>
                {retryCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Tentativa {retryCount + 1}</p>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="mb-4">
                  {error.type === 'network' ? (
                    <WifiOff className="h-12 w-12 mx-auto text-red-500" />
                  ) : (
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Erro ao carregar dados
                </h3>
                <p className="text-sm text-gray-600 mb-4">{error.message}</p>
                {error.canRetry && (
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                )}
              </div>
            </div>
          ) : allData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma pesquisa encontrada
                </h3>
                <p className="text-sm text-gray-600">
                  Nao ha dados de pesquisas para o periodo selecionado.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Informacoes do relatorio */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">
                      {totalItems} pesquisa{totalItems !== 1 ? 's' : ''} encontrada{totalItems !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    Periodo: {new Date(startDate).toLocaleDateString('pt-BR')} ate {new Date(endDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <ScrollArea className="h-96 border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedFields.map((field) => (
                        <TableHead key={field} className="font-semibold">
                          {fieldLabels[field] || field}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        {selectedFields.map((field) => (
                          <TableCell key={field} className="py-2">
                            {formatCellValue(item[field], field)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Paginacao */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} registros
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Pagina {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {allData.length > 0 && (
            <Button 
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar PDF
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}