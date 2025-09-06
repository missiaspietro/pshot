# Design Document

## Overview

Esta spec implementa correções críticas na página de promoções para resolver problemas de autenticação, UX e comportamento de componentes. As soluções focam em melhorar a experiência do usuário e eliminar erros de console.

## Architecture

### Componentes Afetados
- `app/promotions/page.tsx` - Página principal de promoções
- `lib/promotion-service.ts` - Serviço de promoções (se necessário)
- `contexts/auth-context.tsx` - Contexto de autenticação (verificação)

### Fluxo de Dados
1. **Autenticação**: Página → Auth Context → Dados do usuário
2. **Validação de Loja**: Estado local → Tentativa de envio → Validação → Feedback
3. **Textarea**: Componente → CSS fixo → Scroll automático

## Components and Interfaces

### 1. Correção de Autenticação

#### Problema Atual
```typescript
// Problema: Busca no localStorage diretamente
const getUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ps_user')
    return saved ? JSON.parse(saved) : null
  }
  return null
}
```

#### Solução Proposta
```typescript
// Solução: Usar o contexto de autenticação
const { user } = useAuth();
const userSubRede = user?.sub_rede || user?.empresa || user?.rede || '';
```

#### Interface de Dados do Usuário
```typescript
interface UserData {
  email?: string;
  rede?: string;
  empresa?: string;
  sub_rede?: string;
  instancia?: string;
}
```

### 2. Controle de Aviso de Seleção de Loja

#### Estados Necessários
```typescript
const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
const [showStoreError, setShowStoreError] = useState<boolean>(false);
```

#### Lógica de Validação
```typescript
const validateStoreSelection = () => {
  if (!selectedStoreId) {
    setShowStoreError(true);
    return false;
  }
  setShowStoreError(false);
  return true;
};
```

#### Componente de Aviso Condicional
```jsx
{showStoreError && (
  <p className="text-sm text-red-600">
    Você precisa selecionar uma loja para continuar
  </p>
)}
```

### 3. Textarea com Scroll Fixo

#### CSS Classes
```css
.fixed-textarea {
  height: 120px; /* Altura fixa */
  resize: none; /* Desabilita redimensionamento */
  overflow-y: auto; /* Scroll vertical quando necessário */
  min-height: 120px; /* Altura mínima */
  max-height: 120px; /* Altura máxima */
}
```

#### Implementação no Componente
```jsx
<Textarea 
  id="description" 
  placeholder="Descreva a promoção" 
  className="text-gray-700 placeholder:text-gray-400 fixed-textarea"
  {...register("description")} 
/>
```

## Data Models

### Estado da Página
```typescript
interface PromotionsPageState {
  promotions: Promotion[];
  stores: Store[];
  selectedStoreId: string | null;
  showStoreError: boolean;
  imagePreview: string | null;
  successMsg: string;
  errorMsg: string;
  isActive: boolean;
  selectedPromotion: Promotion | null;
  showDeleteConfirmation: boolean;
  promotionToDelete: string | null;
}
```

### Store Interface
```typescript
interface Store {
  id: string;
  name: string;
}
```

## Error Handling

### 1. Erro de Autenticação
```typescript
const handleAuthError = () => {
  console.warn('⚠️ Usuário não encontrado no contexto de autenticação');
  setErrorMsg('Erro de autenticação. Faça login novamente.');
  setStores([]);
};
```

### 2. Erro de Carregamento de Lojas
```typescript
const handleStoreLoadError = (error: Error) => {
  console.error('Erro ao carregar lojas:', error);
  setErrorMsg('Erro ao carregar lojas disponíveis.');
  setStores([]);
};
```

### 3. Validação de Formulário
```typescript
const handleFormValidation = () => {
  if (!validateStoreSelection()) {
    setErrorMsg("Você precisa selecionar uma loja para continuar");
    setTimeout(() => setErrorMsg(""), 4000);
    return false;
  }
  return true;
};
```

## Testing Strategy

### Testes Unitários
1. **Teste de Autenticação**
   - Verificar se os dados do usuário são obtidos corretamente do contexto
   - Testar fallback quando usuário não está autenticado

2. **Teste de Validação de Loja**
   - Verificar se o aviso aparece apenas quando necessário
   - Testar se o aviso desaparece após seleção de loja

3. **Teste de Textarea**
   - Verificar se a altura permanece fixa
   - Testar se o scroll aparece com texto longo

### Testes de Integração
1. **Fluxo Completo de Criação de Promoção**
   - Carregar página → Selecionar loja → Preencher dados → Criar promoção
   
2. **Tratamento de Erros**
   - Simular falha de autenticação
   - Simular falha no carregamento de lojas

### Testes E2E
1. **Cenário de Usuário Completo**
   - Login → Acessar promoções → Criar promoção → Verificar resultado

## Performance Considerations

### Otimizações
1. **Lazy Loading**: Carregar lojas apenas quando necessário
2. **Debounce**: Evitar múltiplas validações simultâneas
3. **Memoização**: Cache de dados do usuário quando possível

### Métricas
- Tempo de carregamento da página < 2s
- Tempo de resposta da validação < 100ms
- Uso de memória otimizado para listas de lojas