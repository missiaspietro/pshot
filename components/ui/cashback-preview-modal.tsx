"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeText } from "@/lib/text-utils"

interface CashbackPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFields: string[]
  startDate: string
  endDate: string
  selectedStore: string
  fieldLabels: { [key: string]: string }
}

interface CashbackData {
  [key: string]: any
}

interface ErrorState {
  message: string
  type: 'network' | 'auth' | 'permission' | 'timeout' | 'server' | 'unknown'
  canRetry: boolean
}

export function CashbackPreviewModal({
  isOpen,
  onClose,
  selectedFields,
  startDate,
  endDate,
  selectedStore,
  fieldLabels
}: CashbackPreviewModalProps) {
  const [allData, setAllData] = useState<CashbackData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorState | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  
  // Calcular dados da página atual
  const totalItems = allData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = allData.slice(startIndex, endIndex)

  // Buscar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && selectedFields.length > 0) {
      fetchData()
    }
  }, [isOpen]) // Removido dependências que causam loop infinito

  const fetchData = async () => {
    console.log('🔄 Iniciando busca de dados...')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📤 Enviando requisição para API...')
      
      const requestData = {
        selectedFields,
        startDate,
        endDate,
        selectedStore
      }
      
      console.log('📋 Dados da requisição:', requestData)
      console.log('📋 Campos selecionados:', selectedFields)
      console.log('📅 Data inicial:', startDate)
      console.log('📅 Data final:', endDate)
      console.log('🏪 Loja selecionada:', selectedStore)
      
      // Criar um timeout para a requisição
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos
      
      const response = await fetch('/api/reports/cashback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify(requestData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      console.log('📥 Resposta recebida:', response.status)

      if (!response.ok) {
        let errorData: any = {}
        try {
          const errorText = await response.text()
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `Erro HTTP ${response.status}` }
        }

        console.error('❌ ERRO DETALHADO DA API:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData: errorData,
          timestamp: new Date().toISOString()
        })
        
        // Log específico para erro 403
        if (response.status === 403) {
          console.error('🚫 ERRO 403 - ACESSO NEGADO:')
          console.error('   Detalhes do erro:', errorData.details || 'Não fornecidos')
          console.error('   Empresa solicitada:', errorData.details?.requestedCompany || 'Não informada')
          console.error('   Email do usuário:', errorData.details?.userEmail || 'Não informado')
          console.error('   Empresa do usuário:', errorData.details?.userCompany || 'Não informada')
          console.error('   Rede do usuário:', errorData.details?.userNetwork || 'Não informada')
          console.error('   Motivo:', errorData.details?.reason || 'Não especificado')
        }
        
        // Determinar tipo de erro baseado no status HTTP
        let errorType: ErrorState['type'] = 'unknown'
        let canRetry = true
        
        switch (response.status) {
          case 401:
            errorType = 'auth'
            canRetry = false
            break
          case 403:
            errorType = 'permission'
            canRetry = false
            break
          case 408:
          case 504:
            errorType = 'timeout'
            break
          case 500:
          case 502:
          case 503:
            errorType = 'server'
            break
          default:
            if (response.status >= 400 && response.status < 500) {
              canRetry = false
            }
        }

        throw {
          message: errorData.error || `Erro ${response.status}`,
          type: errorType,
          canRetry
        }
      }

      const result = await response.json()
      console.log('✅ Dados recebidos EXATAMENTE como vêm do banco:', result)

      // USAR DADOS EXATAMENTE COMO VÊM DO BANCO - SEM PROCESSAMENTO
      const rawData = result.data || []
      
      console.log('🔍 Dados brutos (sem modificação):', rawData.length, 'registros')
      console.log('🔍 Primeiro item bruto:', rawData[0])
      
      // Verificar se há nomes vazios nos dados originais
      const nomesVaziosOriginais = rawData.filter((item: any) => !item.Nome || item.Nome === '' || item.Nome === null)
      if (nomesVaziosOriginais.length > 0) {
        console.warn('⚠️ DADOS ORIGINAIS: Encontrados', nomesVaziosOriginais.length, 'registros sem nome no banco de dados')
        nomesVaziosOriginais.slice(0, 3).forEach((item: any, index: number) => {
          console.warn(`   ${index + 1}. ID: ${item.id}, Nome: "${item.Nome}", Status: "${item.Status}", Whatsapp: "${item.Whatsapp}"`)
        })
      }

      setAllData(rawData)
      setCurrentPage(1) // Reset para primeira página
      setRetryCount(0) // Reset retry count on success
    } catch (error: any) {
      console.error('💥 Erro ao buscar dados:', error)
      
      let errorState: ErrorState
      
      if (error.name === 'AbortError') {
        errorState = {
          message: 'Tempo limite excedido. Tente novamente.',
          type: 'timeout',
          canRetry: true
        }
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorState = {
          message: 'Erro de conexão. Verifique sua internet.',
          type: 'network',
          canRetry: true
        }
      } else if (error.type && error.message) {
        // Erro estruturado da API
        errorState = error as ErrorState
      } else {
        errorState = {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          type: 'unknown',
          canRetry: true
        }
      }
      
      setError(errorState)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)

    try {
      console.log('🔄 Iniciando geração de relatório de cashback PDF...')
      console.log('📋 Campos selecionados:', selectedFields)
      console.log('📅 Período:', { startDate, endDate })

      const response = await fetch('/api/reports/cashback/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para autenticação
        body: JSON.stringify({
          selectedFields,
          startDate,
          endDate,
          selectedStore
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

      // Fechar modal após gerar PDF
      onClose()

    } catch (error) {
      console.error('💥 Erro ao gerar relatório de cashback:', error)
      
      // Mostrar erro detalhado para o usuário
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao gerar relatório de cashback: ${errorMessage}`)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const formatCellValue = (value: any) => {
    // Se é null ou undefined, mostrar como string vazia
    if (value === null || value === undefined) {
      return ''
    }
    
    // Se é string vazia, mostrar como está
    if (value === '') {
      return ''
    }
    
    // Se é uma string que parece ser uma data válida, formatar apenas para exibição
    if (typeof value === 'string' && value.includes('T')) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR')
        }
      } catch (error) {
        // Se não conseguir formatar como data, retornar valor original
        return String(value)
      }
    }
    
    // Se é uma data no formato YYYY-MM-DD, formatar apenas para exibição
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        const date = new Date(value + 'T00:00:00')
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('pt-BR')
        }
      } catch (error) {
        // Se não conseguir formatar como data, retornar valor original
        return String(value)
      }
    }
    
    // Para números (incluindo WhatsApp), retornar exatamente como está
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
      return String(value)
    }
    
    // Para strings que contêm apenas números e caracteres especiais (como números de telefone)
    if (typeof value === 'string' && /^[\d\s\-\(\)\+]+$/.test(value)) {
      return value
    }
    
    // Para texto (nomes, etc.), aplicar normalização apenas para corrigir acentos corrompidos
    if (typeof value === 'string') {
      return normalizeText(value)
    }
    
    // Para outros tipos, converter para string sem normalização
    return String(value)
  }

  // Funções de navegação
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col" aria-describedby="cashback-preview-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Preview do Relatório de Cashback
          </DialogTitle>
          <div id="cashback-preview-description" className="text-sm text-gray-500">
            Período: {formatDate(startDate)} até {formatDate(endDate)} • 
            Campos: {selectedFields.length} selecionados • 
            Registros: {totalItems} • 
            Página: {currentPage} de {totalPages}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 max-h-[calc(90vh-200px)] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando dados...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="flex items-center justify-center mb-4">
                  {error.type === 'network' ? (
                    <WifiOff className="h-12 w-12 text-red-500" />
                  ) : error.type === 'auth' ? (
                    <AlertCircle className="h-12 w-12 text-orange-500" />
                  ) : error.type === 'timeout' ? (
                    <RefreshCw className="h-12 w-12 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  )}
                </div>
                
                <div className="text-red-600 font-medium mb-2">
                  {error.type === 'network' && 'Erro de Conexão'}
                  {error.type === 'auth' && 'Erro de Autenticação'}
                  {error.type === 'permission' && 'Acesso Negado'}
                  {error.type === 'timeout' && 'Tempo Limite Excedido'}
                  {error.type === 'server' && 'Erro do Servidor'}
                  {error.type === 'unknown' && 'Erro Desconhecido'}
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  {error.message}
                </div>
                
                {error.canRetry && (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        setRetryCount(prev => prev + 1)
                        fetchData()
                      }} 
                      variant="outline" 
                      size="sm"
                      disabled={isLoading}
                      className="hover:bg-gray-100 hover:shadow-md hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Tentar Novamente {retryCount > 0 && `(${retryCount + 1}ª tentativa)`}
                    </Button>
                    
                    {retryCount > 2 && (
                      <div className="text-xs text-gray-500">
                        Se o problema persistir, contate o suporte técnico
                      </div>
                    )}
                  </div>
                )}
                
                {!error.canRetry && (
                  <div className="text-xs text-gray-500">
                    {error.type === 'auth' && 'Faça login novamente para continuar'}
                    {error.type === 'permission' && 'Você não tem permissão para acessar estes dados'}
                  </div>
                )}
              </div>
            </div>
          ) : totalItems === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <div>Nenhum dado de cashback encontrado para a sua empresa</div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(90vh-280px)] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedFields.map((field) => (
                      <TableHead key={field} className="whitespace-nowrap text-gray-600">
                        {fieldLabels[field] || field}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((row, index) => (
                    <TableRow key={startIndex + index}>
                      {selectedFields.map((field) => (
                        <TableCell key={field} className="whitespace-nowrap">
                          {formatCellValue(row[field])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center pt-4 pb-2 px-2 bg-white border-t flex-shrink-0">
          {/* Controles de Paginação - Lado Esquerdo */}
          <div className="flex items-center gap-2 max-w-[60%] overflow-hidden">
            {totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 hover:bg-gray-100 hover:shadow-md hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-600 px-2">
                  {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 hover:bg-gray-100 hover:shadow-md hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {totalPages <= 7 && (
                  <div className="flex gap-1 ml-2 max-w-[300px] overflow-hidden">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`h-8 w-8 p-0 text-xs flex-shrink-0 transition-all duration-200 ${
                          currentPage === page 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:text-white' 
                            : 'hover:bg-gray-100 hover:shadow-md hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botões de Ação - Lado Direito */}
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-gray-100 hover:shadow-md hover:text-gray-700 hover:border-gray-300 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || totalItems === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}