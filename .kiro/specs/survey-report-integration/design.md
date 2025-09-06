# Design Document

## Overview

Este documento descreve o design para conectar o card "Relatório de Pesquisas" ao banco de dados usando a tabela `respostas_pesquisas`. A implementação seguirá o padrão já estabelecido pelos outros cards de relatório no dashboard, mantendo consistência na arquitetura e experiência do usuário.

## Architecture

### Database Schema
A tabela `respostas_pesquisas` possui a seguinte estrutura:
- `id`: UUID (chave primária)
- `criado_em`: timestamp with time zone
- `telefone`: text
- `nome`: text
- `resposta`: text
- `loja`: text
- `rede`: text (usado para filtrar por empresa)
- `sub_rede`: text
- `passo`: numeric
- `pergunta`: text
- `vendedor`: text
- `data_de_envio`: date
- `data_text`: text
- `caixa`: text

### Authentication & Authorization
- Utilizar o contexto de autenticação existente (`useAuth`)
- Filtrar dados pela empresa do usuário logado (`user.empresa`)
- Aplicar as mesmas verificações de permissão dos outros relatórios

## Components and Interfaces

### 1. Service Layer (`lib/respostas-pesquisas-service.ts`)

```typescript
interface RespostaPesquisaData {
  id: string;
  criado_em: string;
  telefone: string | null;
  nome: string | null;
  resposta: string | null;
  loja: string | null;
  rede: string | null;
  sub_rede: string | null;
  passo: number | null;
  pergunta: string | null;
  vendedor: string | null;
  data_de_envio: string | null;
  data_text: string | null;
  caixa: string | null;
}

interface RespostasPesquisasStats {
  totalRespostas: number;
  ultimaResposta: string | null;
  respostasPorLoja: Array<{
    loja: string;
    quantidade: number;
  }>;
}

export const respostasPesquisasService = {
  async getRespostasPesquisasByStore(empresa: string): Promise<RespostaPesquisaData[]>
  async getRespostasPesquisasStats(empresa: string): Promise<RespostasPesquisasStats>
}
```

### 2. Dashboard Integration

#### Card Statistics Update
Modificar o array `statsData` no dashboard para conectar o card de pesquisas:

```typescript
// Atualizar o card existente
{
  title: "Relatório de Pesquisas",
  value: totalRespostas.toString(),
  change: "+X%", // Calculado baseado em período anterior
  icon: MessageSquare,
  bgGradient: "from-purple-500 via-purple-600 to-purple-700",
  borderColor: "border-purple-700",
  iconColor: "text-purple-400",
  textColor: "text-white",
  iconBg: "bg-purple-100",
  dataComponentName: "survey-report-card"
}
```

#### State Management
```typescript
const [respostasPesquisasData, setRespostasPesquisasData] = useState<RespostaPesquisaData[]>([]);
const [respostasPesquisasStats, setRespostasPesquisasStats] = useState<RespostasPesquisasStats | null>(null);
const [isLoadingRespostasPesquisas, setIsLoadingRespostasPesquisas] = useState(true);
```

### 3. Data Fetching Logic

```typescript
const fetchRespostasPesquisasData = useCallback(async () => {
  try {
    if (!user || !user.empresa) {
      setRespostasPesquisasData([]);
      setRespostasPesquisasStats(null);
      return;
    }

    setIsLoadingRespostasPesquisas(true);
    
    const [data, stats] = await Promise.all([
      respostasPesquisasService.getRespostasPesquisasByStore(user.empresa),
      respostasPesquisasService.getRespostasPesquisasStats(user.empresa)
    ]);
    
    setRespostasPesquisasData(data);
    setRespostasPesquisasStats(stats);
  } catch (error) {
    console.error("Erro ao carregar dados de respostas de pesquisas:", error);
    setRespostasPesquisasData([]);
    setRespostasPesquisasStats(null);
  } finally {
    setIsLoadingRespostasPesquisas(false);
  }
}, [user]);
```

## Data Models

### RespostaPesquisaData Interface
```typescript
interface RespostaPesquisaData {
  id: string;
  criado_em: string;
  telefone: string | null;
  nome: string | null;
  resposta: string | null;
  loja: string | null;
  rede: string | null;
  sub_rede: string | null;
  passo: number | null;
  pergunta: string | null;
  vendedor: string | null;
  data_de_envio: string | null;
  data_text: string | null;
  caixa: string | null;
}
```

### RespostasPesquisasStats Interface
```typescript
interface RespostasPesquisasStats {
  totalRespostas: number;
  ultimaResposta: string | null;
  respostasPorLoja: Array<{
    loja: string;
    quantidade: number;
  }>;
}
```

## Error Handling

### Service Layer Error Handling
```typescript
try {
  const { data, error } = await supabase
    .from('respostas_pesquisas')
    .select('*')
    .eq('rede', empresa);
    
  if (error) {
    throw new Error(`Erro ao buscar respostas de pesquisas: ${error.message}`);
  }
  
  return data || [];
} catch (error) {
  console.error('Erro no serviço de respostas de pesquisas:', error);
  throw error;
}
```

### Component Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

// No useEffect
try {
  await fetchRespostasPesquisasData();
  setError(null);
} catch (err) {
  setError('Erro ao carregar dados de pesquisas');
  console.error(err);
}
```

### Loading States
- Exibir skeleton/loading durante carregamento inicial
- Manter dados anteriores durante refresh
- Indicador visual de erro quando aplicável

## Testing Strategy

### Unit Tests
1. **Service Layer Tests** (`__tests__/respostas-pesquisas-service.test.ts`)
   - Testar filtros por empresa
   - Testar tratamento de dados vazios
   - Testar tratamento de erros de API
   - Testar formatação de dados

2. **Component Integration Tests** (`__tests__/dashboard-respostas-pesquisas.test.tsx`)
   - Testar renderização do card com dados
   - Testar estado de loading
   - Testar estado de erro
   - Testar filtros por empresa

### Integration Tests
1. **Database Integration** (`__tests__/respostas-pesquisas-integration.test.ts`)
   - Testar conexão com Supabase
   - Testar queries com filtros
   - Testar performance com grandes volumes de dados

### E2E Tests
1. **Dashboard Flow** (`__tests__/dashboard-e2e.test.tsx`)
   - Testar carregamento completo do dashboard
   - Testar interação com card de pesquisas
   - Testar filtros por empresa

## Performance Considerations

### Database Optimization
- Criar índices apropriados na tabela `respostas_pesquisas`:
  ```sql
  CREATE INDEX idx_respostas_pesquisas_rede ON respostas_pesquisas(rede);
  CREATE INDEX idx_respostas_pesquisas_criado_em ON respostas_pesquisas(criado_em);
  CREATE INDEX idx_respostas_pesquisas_loja ON respostas_pesquisas(loja);
  ```

### Caching Strategy
- Implementar cache no service layer similar aos outros relatórios
- Cache invalidation baseado em tempo (5 minutos)
- Cache por empresa para evitar conflitos

### Data Loading
- Implementar paginação se necessário
- Limitar consultas a períodos específicos (últimos 6 meses)
- Usar `useCallback` para evitar re-renders desnecessários

## Security Considerations

### Data Access Control
- Filtrar sempre pela empresa do usuário logado
- Validar permissões antes de exibir dados
- Usar prepared statements para prevenir SQL injection

### API Security
- Utilizar as mesmas credenciais e headers dos outros serviços
- Implementar rate limiting se necessário
- Validar dados de entrada

## Implementation Notes

### Existing Pattern Compliance
- Seguir o mesmo padrão de nomenclatura dos outros serviços
- Usar a mesma estrutura de pastas e arquivos
- Manter consistência visual com outros cards

### Migration Strategy
1. Criar o serviço `respostas-pesquisas-service.ts`
2. Atualizar o dashboard para usar dados reais
3. Implementar testes
4. Validar com dados de produção
5. Monitorar performance pós-deploy

### Rollback Plan
- Manter código atual como fallback
- Implementar feature flag se necessário
- Monitorar logs de erro pós-deploy