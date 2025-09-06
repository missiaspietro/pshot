# Design Document

## Overview

Este documento define o design das correções adicionais para textos corrompidos e títulos faltantes no dashboard. O foco está em corrigir caracteres especiais mal formatados e implementar títulos dinâmicos baseados na seleção do usuário.

## Architecture

O dashboard continua implementado em `app/dashboard/page.tsx` como um componente React. As correções envolvem:

1. **Substituição de strings** para caracteres corrompidos
2. **Títulos dinâmicos** baseados no estado `periodoSelecionado`
3. **Correções de texto** em componentes Card

### Estrutura dos Textos Corrompidos

Os textos identificados com problemas de codificação:
- `éš` → `ú` (última)
- `é­` → `í` (diário, período)
- `é£` → `ã` (conexão)

## Components and Interfaces

### Título Dinâmico do Cashback

O título será implementado usando o estado existente `periodoSelecionado`:

```typescript
const getTituloCashback = (periodo: number): string => {
  return `Cashbacks enviados - ${periodo} ${periodo === 1 ? 'mês' : 'meses'}`;
};
```

### Localização dos Componentes

1. **Gráfico de Promoções Semanais**: CardTitle e CardDescription
2. **Gráfico de Pizza Números Inválidos**: Texto interno do gráfico
3. **Gráfico de Bots Conectados**: CardDescription
4. **Primeiro Gráfico de Cashback**: CardTitle (a ser adicionado)
5. **Seletor de Período**: Label do seletor

## Data Models

### Estado do Período

O componente já possui o estado `periodoSelecionado` que controla o período de pesquisa:

```typescript
const [periodoSelecionado, setPeriodoSelecionado] = useState<number>(1); // 1, 2 ou 3 meses
```

## Error Handling

### Mapeamento de Caracteres Corrompidos

```typescript
const correcaoTexto = {
  'éš': 'ú',    // última
  'é­': 'í',    // diário, período  
  'é£': 'ã',    // conexão
  'NéšMEROS INVéLIDOS': 'Números Inválidos'
};
```

## Testing Strategy

### Verificação de Textos

1. Verificar se todos os caracteres especiais foram corrigidos
2. Confirmar que o título dinâmico muda conforme a seleção
3. Validar que não há regressões nos textos já corrigidos

### Verificação de Funcionalidade

1. Testar mudança de período (1, 2, 3 meses)
2. Verificar se o título do cashback atualiza corretamente
3. Confirmar que os dados continuam sendo carregados normalmente

## Implementation Plan

### Correções de String

As correções serão implementadas através de substituições diretas no código:

1. Localizar cada texto corrompido
2. Substituir pela versão correta
3. Adicionar título dinâmico onde necessário

### Título Dinâmico

O título do cashback será implementado usando template string com o valor do estado `periodoSelecionado`.

## Lista de Correções Futuras

Mantendo a lista das correções identificadas anteriormente:

1. **Gráfico de Pesquisas Enviadas**: "ele não está mostrando nada, mas vamos corrigir isso depois"
2. **Gráfico de Aniversários Gerais**: "também não está aparecendo nada nesse gráfico, mas vamos mudar isso depois"  
3. **Gráfico de Respostas Pesquisas**: "provavelmente não está conectado ao supabase, mas vamos corrigir isso depois"