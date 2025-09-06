# Design Document

## Overview

Esta implementação corrige o problema do botão "Salvar" no card de Relatório de Promoções que não estava funcionando devido à ausência do modal de salvamento na renderização. A solução envolve adicionar o componente `SaveConfigurationModal` para promoções, seguindo o mesmo padrão já implementado para os outros tipos de relatório (aniversários, cashback e pesquisas).

## Architecture

A arquitetura segue o padrão já estabelecido no sistema:

1. **Estado do Modal**: O estado `isPromotionsSaveModalOpen` já existe e está sendo usado corretamente
2. **Função de Salvamento**: A função `handleSavePromotionsConfiguration` já está implementada
3. **Hook de Configurações**: O hook `useFilterConfigurations` já está sendo usado para promoções
4. **Componente Modal**: O `SaveConfigurationModal` já existe e é reutilizado pelos outros relatórios

## Components and Interfaces

### Componente Existente a ser Reutilizado

**SaveConfigurationModal**
- Props necessárias:
  - `isOpen: boolean` - controla se o modal está aberto
  - `onClose: () => void` - função para fechar o modal
  - `onSave: (name: string) => Promise<boolean>` - função para salvar a configuração
  - `isNameDuplicate: (name: string) => boolean` - função para verificar nomes duplicados
  - `isSaving: boolean` - indica se está salvando

### Estado Existente

O estado já está corretamente implementado:
```typescript
const [isPromotionsSaveModalOpen, setIsPromotionsSaveModalOpen] = useState(false)
```

### Funções Existentes

As funções necessárias já estão implementadas:
- `handleSavePromotionsConfiguration` - salva a configuração
- `isPromotionsNameDuplicate` - verifica nomes duplicados
- `isSavingPromotions` - indica estado de salvamento

## Data Models

Não há necessidade de novos modelos de dados. O sistema usa o modelo existente `FilterConfiguration`:

```typescript
interface FilterConfiguration {
  id: string
  name: string
  selectedFields: string[]
  type: string
}
```

## Error Handling

O tratamento de erros já está implementado através do hook `useFilterConfigurations`:
- Erros de salvamento são capturados e exibidos
- Validação de nomes duplicados
- Validação de limite máximo de configurações

## Testing Strategy

### Testes Manuais
1. Verificar se o botão "Salvar" abre o modal
2. Testar salvamento de configuração com nome válido
3. Testar validação de nome duplicado
4. Testar comportamento quando limite máximo é atingido
5. Verificar se a configuração aparece na lista após salvamento

### Testes Automatizados
- Testes unitários para verificar renderização do modal
- Testes de integração para fluxo completo de salvamento
- Testes de validação de props passadas para o modal

## Implementation Details

### Localização da Correção

O modal deve ser adicionado na seção de renderização de modais no final do componente `ReportsPageContent`, após os outros modais de salvamento existentes.

### Posição Exata

Adicionar após o modal de salvamento de pesquisas (linha ~1723) e antes dos modais de preview.

### Props a serem Passadas

```typescript
<SaveConfigurationModal
  isOpen={isPromotionsSaveModalOpen}
  onClose={() => setIsPromotionsSaveModalOpen(false)}
  onSave={handleSavePromotionsConfiguration}
  isNameDuplicate={isPromotionsNameDuplicate}
  isSaving={isSavingPromotions}
/>
```

## Design Decisions

### Reutilização de Componente
**Decisão**: Reutilizar o componente `SaveConfigurationModal` existente
**Justificativa**: Mantém consistência na UI e evita duplicação de código

### Posicionamento do Modal
**Decisão**: Adicionar o modal na mesma seção dos outros modais de salvamento
**Justificativa**: Mantém organização do código e facilita manutenção

### Uso do Hook Existente
**Decisão**: Usar o hook `useFilterConfigurations` já instanciado para promoções
**Justificativa**: Toda a lógica de estado já está implementada e funcionando