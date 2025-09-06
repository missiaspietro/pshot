import { PDFErrorType, PDFError } from './survey-pdf-service'

export interface ErrorContext {
  operation: string
  dataSize?: number
  fieldCount?: number
  retryCount?: number
  userAgent?: string
  timestamp: number
}

export interface RecoveryAction {
  action: 'retry' | 'fallback' | 'fix' | 'abort'
  delay?: number
  maxRetries?: number
  fallbackType?: 'html' | 'simplified'
  requiredFixes?: string[]
  message?: string
}

export class PDFErrorHandler {
  /**
   * Handles different types of PDF generation errors and suggests recovery actions
   */
  static async handleError(error: any, context: ErrorContext): Promise<RecoveryAction> {
    console.error('🚨 [ERROR HANDLER] Processando erro:', {
      error: error.message || error,
      type: error.type || 'unknown',
      context
    })

    // Log error for monitoring
    this.logError(error, context)

    // Classify error if not already classified
    const pdfError = this.classifyError(error, context)

    switch (pdfError.type) {
      case PDFErrorType.TIMEOUT_ERROR:
        return this.handleTimeoutError(pdfError, context)
      
      case PDFErrorType.RESOURCE_ERROR:
        return this.handleResourceError(pdfError, context)
      
      case PDFErrorType.VALIDATION_ERROR:
        return this.handleValidationError(pdfError, context)
      
      case PDFErrorType.GENERATION_ERROR:
        return this.handleGenerationError(pdfError, context)
      
      case PDFErrorType.LAYOUT_ERROR:
        return this.handleLayoutError(pdfError, context)
      
      default:
        return this.handleUnknownError(pdfError, context)
    }
  }

  /**
   * Classifies an error into a PDFError type
   */
  private static classifyError(error: any, context: ErrorContext): PDFError {
    let type = PDFErrorType.GENERATION_ERROR
    let canRetry = true
    let suggestedAction = 'Tente novamente em alguns instantes'

    const errorMessage = error.message || String(error)

    // Timeout errors
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('Request timeout') ||
        error.name === 'AbortError') {
      type = PDFErrorType.TIMEOUT_ERROR
      suggestedAction = 'A geração demorou muito. Tente reduzir a quantidade de dados'
    }
    
    // Resource errors
    else if (errorMessage.includes('memory') || 
             errorMessage.includes('heap') ||
             errorMessage.includes('out of memory') ||
             errorMessage.includes('ENOMEM')) {
      type = PDFErrorType.RESOURCE_ERROR
      suggestedAction = 'Muitos dados para processar. Reduza o período ou campos selecionados'
    }
    
    // Network errors
    else if (errorMessage.includes('Failed to fetch') ||
             errorMessage.includes('NetworkError') ||
             errorMessage.includes('ERR_NETWORK') ||
             errorMessage.includes('ERR_INTERNET_DISCONNECTED')) {
      type = PDFErrorType.TIMEOUT_ERROR // Treat as timeout for retry logic
      suggestedAction = 'Erro de conexão. Verifique sua internet e tente novamente'
    }
    
    // Validation errors
    else if (errorMessage.includes('Nenhum dado') ||
             errorMessage.includes('Campos selecionados') ||
             errorMessage.includes('inválidos') ||
             error.name === 'SyntaxError') {
      type = PDFErrorType.VALIDATION_ERROR
      canRetry = false
      suggestedAction = 'Verifique os dados e filtros selecionados'
    }
    
    // Layout errors
    else if (errorMessage.includes('layout') ||
             errorMessage.includes('column') ||
             errorMessage.includes('page size')) {
      type = PDFErrorType.LAYOUT_ERROR
      suggestedAction = 'Problema no layout. Tente reduzir o número de colunas'
    }

    return {
      type,
      message: errorMessage,
      details: error,
      canRetry,
      suggestedAction
    }
  }

  /**
   * Handles timeout errors
   */
  private static handleTimeoutError(error: PDFError, context: ErrorContext): RecoveryAction {
    const retryCount = context.retryCount || 0
    
    if (retryCount < 2) {
      return {
        action: 'retry',
        delay: Math.min(2000 * (retryCount + 1), 10000), // Exponential backoff
        maxRetries: 2,
        message: `Timeout na geração. Tentando novamente em ${Math.min(2 * (retryCount + 1), 10)} segundos...`
      }
    }

    // If too many retries, offer fallback
    return {
      action: 'fallback',
      fallbackType: 'html',
      message: 'A geração está demorando muito. Gerando versão HTML alternativa...'
    }
  }

  /**
   * Handles resource errors (memory, CPU, etc.)
   */
  private static handleResourceError(error: PDFError, context: ErrorContext): RecoveryAction {
    const dataSize = context.dataSize || 0
    const fieldCount = context.fieldCount || 0

    // If dataset is large, suggest fallback immediately
    if (dataSize > 5000 || fieldCount > 8) {
      return {
        action: 'fallback',
        fallbackType: 'html',
        message: 'Muitos dados para PDF. Gerando versão HTML que pode ser impressa...'
      }
    }

    // For smaller datasets, try once more with simplified approach
    if ((context.retryCount || 0) < 1) {
      return {
        action: 'retry',
        delay: 3000,
        maxRetries: 1,
        message: 'Recursos insuficientes. Tentando com configuração simplificada...'
      }
    }

    return {
      action: 'fallback',
      fallbackType: 'simplified',
      message: 'Gerando versão simplificada devido a limitações de recursos...'
    }
  }

  /**
   * Handles validation errors
   */
  private static handleValidationError(error: PDFError, context: ErrorContext): RecoveryAction {
    const fixes: string[] = []

    if (error.message.includes('Nenhum dado')) {
      fixes.push('Ajuste os filtros para incluir dados no período selecionado')
    }

    if (error.message.includes('Campos selecionados')) {
      fixes.push('Selecione pelo menos um campo para o relatório')
    }

    return {
      action: 'fix',
      requiredFixes: fixes,
      message: 'Corrija os problemas identificados antes de gerar o PDF'
    }
  }

  /**
   * Handles PDF generation errors
   */
  private static handleGenerationError(error: PDFError, context: ErrorContext): RecoveryAction {
    const retryCount = context.retryCount || 0

    if (retryCount < 1) {
      return {
        action: 'retry',
        delay: 2000,
        maxRetries: 1,
        message: 'Erro na geração do PDF. Tentando novamente...'
      }
    }

    return {
      action: 'fallback',
      fallbackType: 'html',
      message: 'Não foi possível gerar PDF. Fornecendo versão HTML alternativa...'
    }
  }

  /**
   * Handles layout errors
   */
  private static handleLayoutError(error: PDFError, context: ErrorContext): RecoveryAction {
    return {
      action: 'fallback',
      fallbackType: 'simplified',
      message: 'Problema no layout do PDF. Gerando versão simplificada...'
    }
  }

  /**
   * Handles unknown errors
   */
  private static handleUnknownError(error: PDFError, context: ErrorContext): RecoveryAction {
    const retryCount = context.retryCount || 0

    if (retryCount < 1) {
      return {
        action: 'retry',
        delay: 3000,
        maxRetries: 1,
        message: 'Erro inesperado. Tentando novamente...'
      }
    }

    return {
      action: 'abort',
      message: 'Não foi possível gerar o relatório. Tente novamente mais tarde ou contate o suporte.'
    }
  }

  /**
   * Logs errors for monitoring and debugging
   */
  private static logError(error: any, context: ErrorContext): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      operation: context.operation,
      error: {
        message: error.message || String(error),
        type: error.type || 'unknown',
        stack: error.stack
      },
      context: {
        dataSize: context.dataSize,
        fieldCount: context.fieldCount,
        retryCount: context.retryCount,
        userAgent: context.userAgent || navigator.userAgent
      }
    }

    // Log to console for development
    console.error('📊 [ERROR LOG]', errorLog)

    // In production, you might want to send this to a logging service
    // Example: sendToLoggingService(errorLog)
  }

  /**
   * Gets user-friendly error message based on error type
   */
  static getUserFriendlyMessage(error: PDFError): string {
    switch (error.type) {
      case PDFErrorType.TIMEOUT_ERROR:
        return 'A geração do PDF está demorando mais que o esperado. Isso pode acontecer com muitos dados.'
      
      case PDFErrorType.RESOURCE_ERROR:
        return 'Não há recursos suficientes para gerar o PDF com essa quantidade de dados.'
      
      case PDFErrorType.VALIDATION_ERROR:
        return 'Há um problema com os dados ou configurações selecionadas.'
      
      case PDFErrorType.GENERATION_ERROR:
        return 'Ocorreu um erro durante a geração do PDF.'
      
      case PDFErrorType.LAYOUT_ERROR:
        return 'Há um problema com o layout do PDF devido ao número de colunas ou dados.'
      
      default:
        return 'Ocorreu um erro inesperado durante a geração do PDF.'
    }
  }

  /**
   * Gets suggested actions for the user based on error type
   */
  static getSuggestedActions(error: PDFError): string[] {
    const actions: string[] = []

    switch (error.type) {
      case PDFErrorType.TIMEOUT_ERROR:
        actions.push('Reduza o período de tempo selecionado')
        actions.push('Selecione menos campos para o relatório')
        actions.push('Tente novamente em alguns minutos')
        break
      
      case PDFErrorType.RESOURCE_ERROR:
        actions.push('Reduza a quantidade de dados selecionando um período menor')
        actions.push('Selecione apenas os campos essenciais')
        actions.push('Use a versão HTML que será oferecida como alternativa')
        break
      
      case PDFErrorType.VALIDATION_ERROR:
        actions.push('Verifique se há dados no período selecionado')
        actions.push('Certifique-se de ter selecionado pelo menos um campo')
        actions.push('Ajuste os filtros aplicados')
        break
      
      case PDFErrorType.GENERATION_ERROR:
        actions.push('Tente novamente em alguns instantes')
        actions.push('Se o problema persistir, use a versão HTML')
        actions.push('Contate o suporte se o erro continuar')
        break
      
      case PDFErrorType.LAYOUT_ERROR:
        actions.push('Reduza o número de colunas selecionadas')
        actions.push('Use a versão simplificada que será oferecida')
        break
      
      default:
        actions.push('Tente novamente em alguns instantes')
        actions.push('Se o problema persistir, contate o suporte')
    }

    return actions
  }
}