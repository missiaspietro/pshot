# Design Document

## Overview

Este documento define o design da reconexão dos gráficos "Pesquisas Enviadas" e "Relatório de Envio de Aniversários - GERAIS" ao Supabase. O processo envolve remover as conexões atuais e implementar novas conexões com filtros corretos.

## Architecture

### Estrutura Atual dos Gráficos

**Gráfico "Pesquisas Enviadas":**
- Localização: `app/dashboard/page.tsx` (linha ~2700)
- Conexão atual: `pesquisa-enviada-service.ts`
- Estado: `pesquisasEnviadas`, `lojasPesquisas`, `isLoadingPesquisas`

**Gráfico "Aniversários Gerais":**
- Localização: `app/dashboard/page.tsx` (linha ~3200)
- Conexão atual: `birthday-report-service.ts`
- Estado: `birthdayReportData`, `isLoadingBirthdayReport`

## Components and Interfaces

### Estrutura de Dados - Pesquisas Enviadas

```typescript
interface PesquisaEnviadaData {
  mes: string
  [loja: string]: string | number // Permite propriedades dinâmicas das lojas
}

interface PesquisaEnviadaRaw {
  id: string
  criado_em: string
  telefone: string | null
  nome: string | null
  loja: string | null
  rede: string | null
  sub_rede: string | null
  pergunta: string | null
  vendedor: string | null
  Caixa: string | null
}
```

### Estrutura de Dados - Aniversários Gerais

```typescript
interface AniversarioGeralData {
  name: string // nome da loja
  value: number // quantidade de aniversários enviados
}

interface AniversarioGeralRaw {
  id: string
  criado_em: string
  cliente: string | null
  whatsApp: string | null
  mensagem_entrege: string | null
  mensagem_perdida: string | null
  rede: string | null
  loja: string | null
  obs: string | null
  Sub_Rede: string | null
}
```

## Data Models

### Filtros de Data

**Pesquisas Enviadas:**
```typescript
const seisMesesAtras = new Date()
seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
const dataInicio = seisMesesAtras.toISOString().split('T')[0]
```

**Aniversários Gerais:**
```typescript
const currentDate = new Date()
const seisMesesAtras = new Date(currentDate)
seisMesesAtras.setMonth(currentDate.getMonth() - 6)
const dataInicio = seisMesesAtras.toISOString().split('T')[0]
const dataFim = currentDate.toISOString().split('T')[0]
```

### Queries Supabase

**Pesquisas Enviadas:**
```typescript
const { data, error } = await supabase
  .from('pesquisas_enviadas')
  .select('loja, criado_em, rede')
  .eq('rede', user.empresa)
  .gte('criado_em', dataInicio)
  .order('criado_em', { ascending: true })
```

**Aniversários Gerais:**
```typescript
const { data, error } = await supabase
  .from('relatorio_niver_decor_fabril')
  .select('loja, criado_em, rede, mensagem_entrege')
  .eq('rede', user.empresa)
  .eq('mensagem_entrege', 'sim')
  .gte('criado_em', dataInicio)
  .lte('criado_em', dataFim)
```

## Error Handling

### Tratamento de Erros

1. **Conexão Supabase**: Try-catch para capturar erros de conexão
2. **Dados Vazios**: Verificação se `data` existe e tem conteúdo
3. **Filtros**: Validação se `user.empresa` existe antes da query
4. **Estados de Loading**: Controle adequado dos estados de carregamento

### Estados dos Gráficos

```typescript
// Estado inicial: loading
setIsLoadingPesquisas(true)
setIsLoadingBirthdayReport(true)

// Estado de erro: dados vazios
setPesquisasEnviadas([])
setBirthdayReportData([])

// Estado de sucesso: dados carregados
setPesquisasEnviadas(dadosProcessados)
setBirthdayReportData(dadosProcessados)
```

## Testing Strategy

### Verificação de Remoção

1. Verificar se as conexões antigas foram removidas
2. Confirmar que não há erros de console
3. Validar que os gráficos mostram estado vazio/loading

### Verificação de Reconexão

1. Testar se as novas queries retornam dados
2. Verificar se os filtros estão funcionando corretamente
3. Validar se os dados são agrupados adequadamente
4. Confirmar que os gráficos renderizam os dados

### Casos de Teste

1. **Usuário com dados**: Gráficos devem mostrar informações
2. **Usuário sem dados**: Gráficos devem mostrar estado vazio
3. **Erro de conexão**: Gráficos devem mostrar estado de erro
4. **Filtro de empresa**: Apenas dados da empresa do usuário

## Implementation Plan

### Fase 1: Remoção das Conexões Atuais

1. Remover chamadas aos serviços atuais
2. Comentar/remover useEffects relacionados
3. Definir estados vazios para os gráficos

### Fase 2: Implementação das Novas Conexões

1. Criar novas funções de busca inline no componente
2. Implementar filtros corretos (6 meses, empresa, status)
3. Processar dados para formato dos gráficos
4. Conectar aos estados dos gráficos

### Fase 3: Testes e Validação

1. Testar com diferentes usuários/empresas
2. Validar filtros de data
3. Confirmar agrupamento de dados
4. Verificar renderização dos gráficos