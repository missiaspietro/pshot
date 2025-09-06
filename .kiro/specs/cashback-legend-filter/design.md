# Design Document

## Overview

O gráfico "Cash Back Tem Total" atualmente mostra todas as lojas retornadas pelo serviço `getCashbackData` na legenda lateral, mesmo quando algumas dessas lojas não possuem dados (barras) no gráfico. O design atual já possui uma lógica parcial de filtro, mas precisa ser aprimorada para garantir que apenas lojas com dados sejam exibidas na legenda e que o botão "Ver mais" seja ocultado quando não há lojas suficientes.

## Architecture

### Componentes Afetados
- **Dashboard Page** (`app/dashboard/page.tsx`): Componente principal que renderiza o gráfico de cashback
- **Cashback Service** (`lib/cashback-service.ts`): Serviço que busca dados do Supabase (não será modificado)

### Fluxo de Dados Atual
1. `getCashbackData()` retorna `{ data: CashbackData[], lojas: string[] }`
2. `cashbackTemTotalData` contém os dados mensais com propriedades dinâmicas `loja{N}`
3. `cashbackTemTotalLojas` contém todas as lojas do banco de dados
4. A legenda filtra parcialmente as lojas, mas ainda mostra lojas sem dados

## Components and Interfaces

### Estrutura de Dados
```typescript
interface CashbackData {
  mes: string
  [key: string]: string | number // Propriedades dinâmicas das lojas (loja0, loja1, etc.)
}
```

### Lógica de Filtro Aprimorada
A lógica atual já existe mas precisa ser consistente:
```typescript
const lojasComDados = cashbackTemTotalLojas.filter(loja => {
  const lojaKey = `loja${loja}`;
  return cashbackTemTotalData.some(dataItem =>
    dataItem[lojaKey] && typeof dataItem[lojaKey] === 'number' && dataItem[lojaKey] > 0
  );
});
```

### Componentes da Interface

#### 1. Legenda Lateral Filtrada
- **Localização**: Lado esquerdo do gráfico
- **Funcionalidade**: Mostrar apenas lojas que têm dados no gráfico
- **Limite**: Máximo 10 lojas visíveis inicialmente
- **Interação**: Hover para destacar barras correspondentes

#### 2. Botão "Ver mais" Condicional
- **Condição de Exibição**: Apenas quando `lojasComDados.length > 10`
- **Funcionalidade**: Expandir para mostrar lojas adicionais
- **Comportamento**: Ocultar automaticamente quando não há lojas suficientes

## Data Models

### Estados Existentes (Mantidos)
```typescript
const [cashbackTemTotalData, setCashbackTemTotalData] = useState<CashbackData[]>([]);
const [cashbackTemTotalLojas, setCashbackTemTotalLojas] = useState<string[]>([]);
const [hoveredLojaCashback, setHoveredLojaCashback] = useState<string | null>(null);
```

### Lógica de Processamento
1. **Dados Brutos**: Manter `cashbackTemTotalLojas` com todas as lojas do banco
2. **Dados Filtrados**: Criar `lojasComDados` dinamicamente para a interface
3. **Critério de Filtro**: Loja deve ter pelo menos um valor > 0 em qualquer mês

## Error Handling

### Cenários de Erro
1. **Dados Vazios**: Se não há dados de cashback, não mostrar legenda nem botão
2. **Lojas Sem Dados**: Filtrar automaticamente lojas sem barras no gráfico
3. **Estados de Loading**: Manter indicadores de carregamento existentes

### Validação de Dados
- Verificar se `dataItem[lojaKey]` existe e é um número
- Garantir que o valor seja maior que 0
- Tratar casos onde `cashbackTemTotalData` está vazio

## Testing Strategy

### Testes de Funcionalidade
1. **Filtro de Legenda**: Verificar que apenas lojas com dados aparecem
2. **Botão "Ver mais"**: Confirmar que aparece/desaparece conforme necessário
3. **Interações**: Validar hover e destaque de barras
4. **Responsividade**: Testar em diferentes tamanhos de tela

### Cenários de Teste
1. **Todas as lojas com dados**: Botão "Ver mais" deve aparecer se > 10 lojas
2. **Poucas lojas com dados**: Botão "Ver mais" deve estar oculto
3. **Nenhuma loja com dados**: Legenda deve estar vazia
4. **Dados mistos**: Apenas lojas com barras devem aparecer na legenda

### Testes de Regressão
- Verificar que a funcionalidade de hover continua funcionando
- Confirmar que as cores das barras permanecem consistentes
- Validar que o tooltip ainda funciona corretamente
- Testar que o carregamento de dados não foi afetado

## Implementation Details

### Modificações Necessárias

#### 1. Consistência na Lógica de Filtro
- Aplicar a mesma lógica de filtro `lojasComDados` em todos os lugares
- Garantir que legenda e botão "Ver mais" usem a mesma lista filtrada

#### 2. Otimização de Performance
- Memoizar o cálculo de `lojasComDados` para evitar recálculos desnecessários
- Usar `useMemo` para derivar dados filtrados dos estados existentes

#### 3. Manutenção da Funcionalidade Existente
- Preservar todas as interações de hover e destaque
- Manter as cores e estilos das barras
- Não modificar a busca de dados do backend

### Estrutura do Código
```typescript
const lojasComDados = useMemo(() => {
  return cashbackTemTotalLojas.filter(loja => {
    const lojaKey = `loja${loja}`;
    return cashbackTemTotalData.some(dataItem =>
      dataItem[lojaKey] && typeof dataItem[lojaKey] === 'number' && dataItem[lojaKey] > 0
    );
  });
}, [cashbackTemTotalLojas, cashbackTemTotalData]);
```

Esta abordagem garante que:
1. A lógica de filtro seja consistente em toda a aplicação
2. O desempenho seja otimizado através de memoização
3. A funcionalidade existente seja preservada
4. O código seja mais limpo e maintível