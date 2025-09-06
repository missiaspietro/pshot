# Design Document

## Overview

Este documento detalha o design para melhorias na funcionalidade de geração de PDF do relatório de pesquisas. O sistema atual já possui a base funcional, mas será aprimorado com melhor UX, tratamento de erros, otimizações de performance e formatação profissional.

## Architecture

### Current System Analysis

**Existing Components:**
- `components/ui/survey-preview-modal.tsx` - Modal que exibe dados e tem botão "Gerar PDF"
- `app/api/reports/survey/pdf/route.ts` - API que gera PDF usando PDFKit
- `app/api/reports/survey/route.ts` - API que busca dados das pesquisas

**Current Flow:**
1. Modal busca dados via `/api/reports/survey`
2. Usuário clica "Gerar PDF"
3. Modal envia dados para `/api/reports/survey/pdf`
4. API gera PDF com PDFKit
5. PDF é retornado e aberto em nova aba

### Enhanced Architecture

**Improved Components:**
- **Enhanced Modal** - Melhor UX, feedback visual, tratamento de erros
- **Optimized PDF API** - Performance melhorada, melhor formatação
- **PDF Service Layer** - Lógica de geração centralizada e reutilizável
- **Error Handling System** - Tratamento robusto de diferentes tipos de erro

## Components and Interfaces

### 1. Enhanced Survey Preview Modal

**File:** `components/ui/survey-preview-modal.tsx`

**Improvements:**
```typescript
interface EnhancedSurveyPreviewModalProps {
  // Existing props...
  isOpen: boolean
  onClose: () => void
  selectedFields: string[]
  startDate: string
  endDate: string
  fieldLabels: { [key: string]: string }
}

interface PDFGenerationState {
  isGenerating: boolean
  progress: number
  error: string | null
  retryCount: number
}
```

**New Features:**
- Progress indicator during PDF generation
- Retry mechanism for failed generations
- Better error messages with specific actions
- Automatic modal closure on success
- Prevention of multiple simultaneous generations

### 2. Enhanced PDF Generation API

**File:** `app/api/reports/survey/pdf/route.ts`

**Improvements:**
```typescript
interface PDFGenerationRequest {
  selectedFields: string[]
  startDate: string
  endDate: string
  data: SurveyData[]
  options?: PDFOptions
}

interface PDFOptions {
  pageSize?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  fontSize?: number
  includeTimestamp?: boolean
}

interface PDFGenerationResponse {
  success: boolean
  pdfBuffer?: Buffer
  filename: string
  error?: string
  fallbackHtml?: string
}
```

**Enhanced Features:**
- Dynamic layout based on column count
- Responsive font sizing
- Better table formatting
- Improved error handling with fallbacks
- Resource cleanup

### 3. PDF Service Layer

**New File:** `lib/survey-pdf-service.ts`

**Purpose:** Centralize PDF generation logic for reusability and maintainability

```typescript
class SurveyPDFService {
  static async generatePDF(data: SurveyData[], options: PDFGenerationOptions): Promise<PDFResult>
  static calculateOptimalLayout(columnCount: number): LayoutConfig
  static formatCellValue(value: any, fieldType: string): string
  static generateFilename(startDate: string, endDate: string, fieldCount: number): string
  static validateData(data: SurveyData[]): ValidationResult
}

interface PDFGenerationOptions {
  selectedFields: string[]
  fieldLabels: { [key: string]: string }
  startDate: string
  endDate: string
  empresa?: string
}

interface LayoutConfig {
  pageSize: string
  orientation: 'portrait' | 'landscape'
  fontSize: number
  columnWidth: number
  margins: { top: number, bottom: number, left: number, right: number }
}
```

## Data Models

### Enhanced PDF Generation Flow

```typescript
// 1. Data Validation
interface DataValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recordCount: number
  fieldCount: number
}

// 2. Layout Calculation
interface LayoutCalculation {
  optimalPageSize: 'A4' | 'A3' | 'Letter'
  optimalOrientation: 'portrait' | 'landscape'
  fontSize: number
  columnWidths: number[]
  estimatedPages: number
}

// 3. Generation Progress
interface GenerationProgress {
  stage: 'validating' | 'calculating' | 'generating' | 'finalizing'
  progress: number // 0-100
  currentPage?: number
  totalPages?: number
}
```

### Error Types and Handling

```typescript
enum PDFErrorType {
  VALIDATION_ERROR = 'validation_error',
  LAYOUT_ERROR = 'layout_error',
  GENERATION_ERROR = 'generation_error',
  RESOURCE_ERROR = 'resource_error',
  TIMEOUT_ERROR = 'timeout_error'
}

interface PDFError {
  type: PDFErrorType
  message: string
  details?: any
  canRetry: boolean
  suggestedAction?: string
}
```

## Error Handling

### Comprehensive Error Management

**1. Validation Errors**
- Empty data sets
- Invalid field selections
- Malformed date ranges
- Missing required parameters

**2. Generation Errors**
- PDFKit failures
- Memory limitations
- Processing timeouts
- File system errors

**3. Network Errors**
- API timeouts
- Connection failures
- Server overload
- Client disconnection

**4. Fallback Strategies**
- HTML preview when PDF fails
- Simplified layout for complex data
- Chunked processing for large datasets
- Retry with different parameters

### Error Recovery Flow

```typescript
class PDFErrorHandler {
  static async handleError(error: PDFError, context: GenerationContext): Promise<RecoveryAction> {
    switch (error.type) {
      case PDFErrorType.TIMEOUT_ERROR:
        return { action: 'retry', delay: 2000, maxRetries: 3 }
      
      case PDFErrorType.RESOURCE_ERROR:
        return { action: 'fallback', fallbackType: 'html' }
      
      case PDFErrorType.VALIDATION_ERROR:
        return { action: 'fix', requiredFixes: error.details }
      
      default:
        return { action: 'abort', message: error.message }
    }
  }
}
```

## Testing Strategy

### Unit Tests

**1. PDF Service Tests**
- Data validation logic
- Layout calculation algorithms
- Filename generation
- Error handling scenarios

**2. API Route Tests**
- Request/response validation
- Error scenarios
- Performance under load
- Resource cleanup

**3. Component Tests**
- Modal state management
- User interaction flows
- Error display
- Progress indication

### Integration Tests

**1. End-to-End PDF Generation**
- Complete flow from modal to PDF
- Different data sizes and complexities
- Various field combinations
- Error recovery scenarios

**2. Performance Tests**
- Large dataset handling
- Concurrent generation requests
- Memory usage monitoring
- Response time benchmarks

### Test Scenarios

```typescript
describe('Survey PDF Generation', () => {
  describe('Happy Path', () => {
    test('generates PDF with standard data set')
    test('handles different field combinations')
    test('formats dates and responses correctly')
  })

  describe('Edge Cases', () => {
    test('handles empty data set')
    test('manages very large data sets')
    test('processes special characters in data')
    test('handles missing or null values')
  })

  describe('Error Scenarios', () => {
    test('recovers from PDFKit failures')
    test('handles network timeouts')
    test('manages server resource limits')
    test('provides meaningful error messages')
  })
})
```

## Performance Optimizations

### 1. Data Processing Optimizations

- **Streaming Processing:** Process large datasets in chunks
- **Memory Management:** Clean up resources after generation
- **Caching:** Cache formatted data for repeated requests
- **Lazy Loading:** Load only necessary data for PDF generation

### 2. PDF Generation Optimizations

- **Layout Pre-calculation:** Calculate optimal layout before generation
- **Font Optimization:** Use system fonts for better performance
- **Image Optimization:** Optimize any embedded images or logos
- **Compression:** Apply PDF compression for smaller file sizes

### 3. API Optimizations

- **Request Queuing:** Manage concurrent PDF generation requests
- **Resource Pooling:** Reuse PDF generation resources
- **Response Streaming:** Stream PDF directly to client
- **Timeout Management:** Implement appropriate timeouts

## Security Considerations

### 1. Data Protection

- **Input Validation:** Validate all input parameters
- **Data Sanitization:** Clean data before PDF generation
- **Access Control:** Ensure user has permission to generate PDFs
- **Audit Logging:** Log PDF generation activities

### 2. Resource Protection

- **Rate Limiting:** Prevent abuse of PDF generation
- **Resource Limits:** Set limits on PDF size and complexity
- **Timeout Protection:** Prevent long-running processes
- **Memory Limits:** Prevent memory exhaustion

## Implementation Phases

### Phase 1: Core Improvements
- Enhanced error handling
- Better user feedback
- Improved PDF formatting

### Phase 2: Performance Optimizations
- Caching implementation
- Resource management
- Concurrent request handling

### Phase 3: Advanced Features
- Custom layout options
- Export format choices
- Batch processing capabilities

## Success Metrics

### User Experience Metrics
- PDF generation success rate > 95%
- Average generation time < 5 seconds
- User error rate < 2%
- User satisfaction score > 4.5/5

### Technical Metrics
- API response time < 3 seconds
- Memory usage < 100MB per request
- CPU usage < 50% during generation
- Error recovery rate > 90%

### Business Metrics
- Increased PDF usage by 30%
- Reduced support tickets by 50%
- Improved report sharing by 40%
- Enhanced user adoption by 25%