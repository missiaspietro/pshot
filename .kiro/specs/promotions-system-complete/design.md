# Design - Sistema Completo de Relatórios de Promoções

## Overview

O sistema de promoções seguirá a mesma arquitetura dos outros relatórios existentes (aniversários, cashback, pesquisas), garantindo consistência e reutilização de componentes. A implementação incluirá APIs REST, serviços de dados, geração de PDF e sistema de configurações criptografadas.

## Architecture

### Componentes do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  PromotionsPreviewModal  │  ReportsPage (Config Management) │
├─────────────────────────────────────────────────────────────┤
│                    API Routes (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  /api/reports/promotions │  /api/reports/promotions/pdf     │
├─────────────────────────────────────────────────────────────┤
│                    Services Layer                           │
├─────────────────────────────────────────────────────────────┤
│  PromotionsReportService │  PromotionsPdfService           │
├─────────────────────────────────────────────────────────────┤
│                    Database (Supabase)                      │
├─────────────────────────────────────────────────────────────┤
│  "Relatorio Envio de Promoções"  │  users (config_filtros) │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### API Routes

#### /api/reports/promotions (POST)
```typescript
interface PromotionsApiRequest {
  selectedFields: string[]
  startDate?: string
  endDate?: string
}

interface PromotionsApiResponse {
  success: boolean
  data: PromotionsData[]
  total: number
  userEmpresa: string
  userInfo: UserInfo
  message: string
}
```

#### /api/reports/promotions/pdf (POST)
```typescript
interface PromotionsPdfRequest {
  selectedFields: string[]
  startDate?: string
  endDate?: string
  data?: PromotionsData[]
}

// Response: PDF Blob ou HTML (fallback)
```

### Data Models

#### Tabela "Relatorio Envio de Promoções"
```typescript
interface PromotionsData {
  Cliente: string | null
  Enviado: string | null
  Obs: string | null
  Whatsapp: string | null
  Rede: string | null
  Sub_rede: string | null
  Loja: string | null
  Id: string // UUID
  Data_Envio: string | null // Date
}
```

#### Configurações de Filtros
```typescript
interface PromotionsConfiguration {
  id: string
  name: string // Deve terminar com "(Promoções)"
  selectedFields: string[]
  type: 'promotions'
  encrypted: boolean
}
```

### Services

#### PromotionsReportService
```typescript
class PromotionsReportService {
  async getPromotionsData(filters: PromotionsReportFilters): Promise<PromotionsData[]>
  async validateUserAccess(userEmpresa: string): Promise<boolean>
  private validateSelectedFields(selectedFields: string[]): string[]
  private validateCompanyData(data: any[], expectedEmpresa: string): PromotionsData[]
}
```

#### PromotionsPdfService
```typescript
class PromotionsPdfService {
  async generatePdf(data: PromotionsData[], options: PdfOptions): Promise<Buffer>
  private generateHtmlTemplate(data: PromotionsData[], options: PdfOptions): string
  private formatPromotionsData(data: PromotionsData[]): FormattedData[]
}
```

## Data Flow

### Busca de Dados
```
1. Modal aberto → fetchData()
2. POST /api/reports/promotions
3. Validar autenticação (sessão/cookie)
4. Buscar dados do usuário (empresa/rede)
5. PromotionsReportService.getPromotionsData()
6. Filtrar por empresa: WHERE Rede = userEmpresa
7. Aplicar filtros de data: WHERE Data_Envio BETWEEN startDate AND endDate
8. Selecionar campos: SELECT selectedFields
9. Validar dados da empresa
10. Retornar dados formatados
```

### Geração de PDF
```
1. Botão "Gerar PDF" → handleGeneratePdf()
2. POST /api/reports/promotions/pdf
3. Validar autenticação
4. PromotionsPdfService.generatePdf()
5. Gerar HTML template
6. Puppeteer → PDF (ou fallback HTML)
7. Retornar PDF blob
8. Abrir em nova aba
```

### Configurações
```
1. Salvar configuração → handleSavePromotionsConfiguration()
2. Criptografar dados: encrypt(selectedFields)
3. Adicionar sufixo: name + " (Promoções)"
4. Salvar em users.config_filtros_relatorios
5. Carregar configuração → handleLoadPromotionsConfiguration()
6. Filtrar por sufixo: name.includes("(Promoções)")
7. Descriptografar dados: decrypt(config.selectedFields)
8. Aplicar configuração
```

## Error Handling

### Tipos de Erro
- **401 Unauthorized**: Sessão inválida ou expirada
- **403 Forbidden**: Usuário sem permissão para promoções
- **404 Not Found**: Empresa não encontrada na tabela
- **500 Internal Server Error**: Erro no banco de dados ou processamento
- **408 Request Timeout**: Query muito lenta (timeout)

### Tratamento de Erros
```typescript
interface ErrorState {
  message: string
  type: 'network' | 'auth' | 'permission' | 'timeout' | 'server' | 'unknown'
  canRetry: boolean
}
```

## Security

### Autenticação
- Validação de sessão via cookie `ps_session`
- Verificação de usuário na tabela `users`
- Validação de empresa/rede do usuário

### Autorização
- Filtro automático por empresa do usuário
- Validação de dados retornados (security check)
- Prevenção de acesso a dados de outras empresas

### Criptografia de Configurações
- Usar mesmo sistema dos outros relatórios
- Criptografar `selectedFields` antes de salvar
- Descriptografar ao carregar configurações

## Performance

### Otimizações de Query
- Índices na tabela por `Rede` e `Data_Envio`
- Limit de 1000 registros para evitar timeout
- Ordenação por `Data_Envio DESC` para dados mais recentes primeiro

### Cache
- Usar sistema de cache existente (`dashboard-optimizations`)
- Cache por empresa e campos selecionados
- Invalidar cache quando necessário

### PDF Generation
- Usar Puppeteer com timeout configurado
- Fallback para HTML se PDF falhar
- Otimizar template HTML para performance

## Testing Strategy

### Cenários de Teste

1. **API de Dados**
   - Busca com filtros válidos
   - Filtro por empresa do usuário
   - Tratamento de erros de autenticação
   - Validação de campos selecionados

2. **Geração de PDF**
   - PDF com dados válidos
   - Fallback para HTML
   - Tratamento de erros de geração
   - Validação de template

3. **Configurações**
   - Salvamento criptografado
   - Carregamento e descriptografia
   - Filtro por tipo de configuração
   - Validação de permissões

4. **Integração**
   - Modal com dados reais
   - Fluxo completo de usuário
   - Consistência com outros relatórios