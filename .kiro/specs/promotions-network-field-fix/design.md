# Design Document

## Overview

Este documento descreve a solução para corrigir o problema de mapeamento incorreto entre os campos "rede" e "sub_rede" no sistema de promoções. A correção envolve ajustar a lógica de determinação da rede do usuário e garantir que o campo correto seja usado para filtragem e criação de promoções.

## Architecture

### Current Problem
- O `promotion-service.ts` usa `userData.sub_rede || userData.rede || userData.empresa` para determinar a rede
- Isso faz com que `sub_rede` tenha prioridade sobre `rede`, causando inconsistências
- As lojas são filtradas pela `rede` real, mas as promoções são criadas com `sub_rede`

### Proposed Solution
- Alterar a prioridade para `userData.rede || userData.empresa || userData.sub_rede`
- Manter `sub_rede` como campo separado para informações complementares
- Garantir consistência entre filtragem de lojas e criação de promoções

## Components and Interfaces

### 1. UserData Interface Enhancement
```typescript
interface UserData {
  email?: string;
  rede?: string;        // Campo principal para rede
  empresa?: string;     // Fallback para rede
  sub_rede?: string;    // Campo complementar, não principal
  instancia?: string;
}
```

### 2. Network Resolution Function
```typescript
function resolveUserNetwork(userData: UserData): string | null {
  // Prioridade correta: rede > empresa > sub_rede
  return userData.rede || userData.empresa || userData.sub_rede || null;
}
```

### 3. Promotion Service Updates
- Método `getPromotions()`: Usar rede correta para filtrar
- Método `createPromotion()`: Usar rede correta no campo "Rede" e manter sub_rede no campo "Sub_Rede"

### 4. Store Loading Logic
- Manter a lógica atual do `shot-lojas.ts` que já filtra corretamente por `rede`
- Garantir que a mesma rede seja usada tanto para carregar lojas quanto para criar promoções

## Data Models

### Promotion Database Schema
```sql
-- Tabela promocoes
{
  Id: string,
  Rede: string,        -- Deve usar userData.rede (não sub_rede)
  Sub_Rede: string,    -- Campo separado para sub_rede
  Loja: string,
  Titulo: string,
  Msg: string,
  Status: string,
  Criador: string,
  Bot: string,
  Foto: string,
  id_promo: string,
  Data_Criacao: timestamp,
  Data_Atualizacao: timestamp
}
```

### User Data Structure
```typescript
{
  email: string,
  rede: string,        -- Campo principal (prioridade 1)
  empresa: string,     -- Fallback (prioridade 2)  
  sub_rede: string,    -- Complementar (prioridade 3)
  instancia: string,
  loja: string,
  nivel: string
}
```

## Error Handling

### Network Resolution Errors
- Se nenhum campo de rede estiver disponível, retornar array vazio
- Logar warnings quando fallbacks são usados
- Manter mensagens de erro claras para o usuário

### Data Consistency Checks
- Validar se a rede determinada existe na tabela `shot_lojas`
- Verificar se o usuário tem permissão para a rede determinada
- Alertar sobre inconsistências nos logs

## Testing Strategy

### Unit Tests
1. **Network Resolution Function**
   - Testar prioridade correta: rede > empresa > sub_rede
   - Testar casos com campos nulos/undefined
   - Testar casos com todos os campos preenchidos

2. **Promotion Service**
   - Testar filtragem com rede correta
   - Testar criação com campos corretos
   - Testar casos de usuários sem rede definida

3. **Store Loading**
   - Testar consistência entre rede usada para lojas e promoções
   - Testar casos de Super Admin vs usuário normal

### Integration Tests
1. **End-to-End Promotion Flow**
   - Carregar lojas → criar promoção → verificar consistência
   - Testar com diferentes tipos de usuário (Super Admin, normal)
   - Verificar se promoções aparecem corretamente após criação

2. **Data Consistency**
   - Verificar se promoções criadas usam a mesma rede das lojas carregadas
   - Testar filtros de promoções com diferentes configurações de usuário

### Manual Testing Scenarios
1. **Usuário com rede definida**: Verificar se usa `rede` corretamente
2. **Usuário sem rede, com empresa**: Verificar se usa `empresa` como fallback
3. **Usuário apenas com sub_rede**: Verificar se usa `sub_rede` como último recurso
4. **Super Admin**: Verificar se vê todas as lojas da rede correta