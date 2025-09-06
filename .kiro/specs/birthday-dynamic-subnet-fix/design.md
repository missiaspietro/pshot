# Design Document

## Overview

Esta correção visa substituir o valor hardcoded "bababibi" por um sistema dinâmico que exibe a sub-rede real do usuário logado na página de aniversários. O sistema já possui a lógica de autenticação e filtragem correta, precisando apenas ajustar a interface para refletir os dados reais.

## Architecture

### Current State Analysis
- ✅ API `/api/user/profile` retorna dados corretos do usuário incluindo `sub_rede`
- ✅ `birthday-service.ts` filtra mensagens corretamente pela `sub_rede` do usuário
- ❌ Interface exibe valor fixo "bababibi" independente do usuário logado
- ❌ Inconsistência entre dados exibidos e dados utilizados

### Target State
- Interface dinâmica que exibe a sub-rede real do usuário
- Fallback para empresa quando sub-rede não estiver definida
- Tratamento de estados de loading e erro
- Consistência total entre interface e lógica de negócio

## Components and Interfaces

### 1. User Data Interface
```typescript
interface UserData {
  id: string;
  email: string;
  nome: string;
  empresa: string;
  rede: string;
  sub_rede: string;
  sistema: string;
}
```

### 2. Subnet Display Component Logic
```typescript
const getDisplaySubnet = (user: UserData | null): string => {
  if (!user) return 'Não definida';
  return user.sub_rede || user.empresa || 'Não definida';
}
```

### 3. Loading States
- Loading: Exibir skeleton ou spinner
- Error: Exibir mensagem de erro
- Success: Exibir sub-rede real

## Data Models

### User Context State
```typescript
interface UserContextState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
}
```

### Display States
```typescript
type SubnetDisplayState = 
  | { type: 'loading' }
  | { type: 'error', message: string }
  | { type: 'success', subnet: string }
  | { type: 'not-authenticated' }
```

## Error Handling

### 1. Authentication Errors
- Quando usuário não está logado
- Quando sessão expirou
- Quando dados do usuário não são encontrados

### 2. Data Loading Errors
- Falha na API de perfil
- Timeout de rede
- Dados corrompidos

### 3. Fallback Strategy
1. Tentar usar `sub_rede` do usuário
2. Se não existir, usar `empresa`
3. Se não existir, exibir "Não definida"
4. Em caso de erro, exibir mensagem apropriada

## Testing Strategy

### 1. Unit Tests
- Função `getDisplaySubnet` com diferentes cenários de dados
- Estados de loading e erro
- Fallback logic

### 2. Integration Tests
- Carregamento de dados do usuário
- Atualização da interface quando dados mudam
- Comportamento com diferentes tipos de usuário

### 3. E2E Tests
- Fluxo completo de login e visualização da sub-rede
- Mudança de usuário e atualização da interface
- Comportamento em cenários de erro

### 4. Manual Testing Scenarios
- Usuário com sub-rede definida
- Usuário sem sub-rede (usando empresa como fallback)
- Usuário não logado
- Erro de rede ao carregar dados
- Diferentes níveis de acesso de usuário

## Implementation Notes

### Files to Modify
1. `app/birthdays/page.tsx` - Substituir valor hardcoded por valor dinâmico
2. Possíveis outros arquivos que referenciem "bababibi" (se encontrados)

### Key Changes
1. Remover string hardcoded "bababibi"
2. Usar dados reais do usuário carregado
3. Implementar estados de loading e erro
4. Adicionar fallback apropriado

### Backward Compatibility
- Mudança é puramente visual/UX
- Não afeta lógica de negócio existente
- Não quebra funcionalidades existentes