"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { excelExportService, ExcelExportError, ExportErrorType } from '@/lib/excel-export-service'

export interface PromocoesExcelExportButtonProps {
  graphData: any[] // Dados do gráfico no formato { loja: string, botDesconectado: number, numeroInvalido: number }
  title: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function PromocoesExcelExportButton({
  graphData,
  title,
  isLoading = false,
  disabled = false,
  className
}: PromocoesExcelExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!graphData || graphData.length === 0) {
      toast.info('Não há dados de promoções não enviadas para exportar')
      return
    }

    setIsExporting(true)

    try {
      // Pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 100))
      
      excelExportService.exportPromocoesNaoEnviadasToExcel(graphData, title)
      
      toast.success('Dados de promoções não enviadas exportados com sucesso!')
    } catch (error) {
      console.error('Erro na exportação:', error)
      
      if (error instanceof ExcelExportError) {
        switch (error.type) {
          case ExportErrorType.EMPTY_DATA:
            toast.info('Não há dados para exportar')
            break
          case ExportErrorType.NO_STORES:
            toast.info('Não há lojas disponíveis para exportar')
            break
          case ExportErrorType.GENERATION_ERROR:
            toast.error('Erro ao gerar arquivo Excel. Tente novamente.')
            break
          case ExportErrorType.DOWNLOAD_ERROR:
            toast.error('Erro ao fazer download do arquivo. Tente novamente.')
            break
          default:
            toast.error('Erro inesperado durante a exportação')
        }
      } else {
        toast.error('Erro inesperado durante a exportação')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const isButtonDisabled = disabled || isLoading || isExporting

  return (
    <Button
      onClick={handleExport}
      disabled={isButtonDisabled}
      variant="outline"
      size="sm"
      className={`
        border-green-600 text-green-600 bg-white
        hover:bg-green-600 hover:text-white hover:border-green-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        ${className}
      `}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </>
      )}
    </Button>
  )
}