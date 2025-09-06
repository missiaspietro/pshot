# Design Document

## Overview

Este documento define o design das correções necessárias para os gráficos do dashboard. O objetivo é padronizar títulos, legendas, descrições e alinhamentos dos gráficos, corrigindo textos mal formatados e garantindo consistência visual.

## Architecture

O dashboard está implementado em `app/dashboard/page.tsx` como um componente React que utiliza a biblioteca Recharts para renderização dos gráficos. Os dados são obtidos através de serviços específicos que se conectam ao Supabase.

### Estrutura dos Gráficos

1. **Gráfico de Pizza - Números Inválidos**: Mostra números inválidos dos envios
2. **Gráfico de Pizza - Gênero dos Clientes**: Mostra distribuição por gênero
3. **Gráfico de Barras - Promoções Semana**: Envios diários da última semana
4. **Gráfico de Barras - Promoções 6 Meses**: Promoções enviadas nos últimos 6 meses
5. **Gráfico de Barras - Pesquisas Enviadas**: Pesquisas dos últimos 6 meses
6. **Gráfico de Barras - Cashback Detalhado**: Cashbacks dos últimos 6 meses
7. **Gráfico de Pizza - Relatório Aniversários Gerais**: Envios gerais dos últimos 6 meses
8. **Gráfico de Barras - Aniversários Detalhado**: Envios detalhados dos últimos 6 meses
9. **Gráfico de Barras - Respostas Pesquisas**: Classificação das respostas por loja

## Components and Interfaces

### Componentes de Gráfico

Cada gráfico é implementado usando componentes do Recharts:
- `PieChart` para gráficos de pizza
- `BarChart` para gráficos de barras
- `ResponsiveContainer` para responsividade
- `Card` do shadcn/ui para container

### Estrutura de Títulos e Legendas

```typescript
interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
}
```

## Data Models

### Conexões com Supabase

1. **Números Inválidos**: Dados estáticos no componente (promocoesNaoEnviadas)
2. **Gênero dos Clientes**: Tabela `clientes_decorfabril`
3. **Promoções Semana**: Tabela `Relatorio Envio de Promoções`
4. **Promoções 6 Meses**: Tabela `Relatorio Envio de Promoções`
5. **Pesquisas Enviadas**: Tabela `pesquisas_enviadas` via `pesquisa-enviada-service`
6. **Cashback**: Tabela `EnvioCashTemTotal` via `cashback-service`
7. **Aniversários Gerais**: Tabela `relatorio_niver_decor_fabril` via `birthday-report-service`
8. **Aniversários Detalhado**: Tabela `relatorio_niver_decor_fabril` via `birthday-report-service`
9. **Respostas Pesquisas**: Tabela `respostas_pesquisas` via `respostas-pesquisas-service`

## Error Handling

### Tratamento de Textos Corrompidos

Os textos corrompidos identificados serão corrigidos através de substituições diretas:
- "NéšMEROS INVéLIDOS" → "NÚMEROS INVÁLIDOS"
- "gênero dos clientesVisé£o geral do sexo dos clientes" → "Gênero dos Clientes - Visão geral do sexo dos clientes"
- "Cash Back Tem Total" → "Cashbacks DETALHADO - Últimos 6 Meses"
- "Envio de Aniversérios" → "Envio de Aniversários"

### Alinhamento de Gráficos

Os gráficos serão organizados em uma estrutura de grid responsiva para garantir alinhamento consistente.

## Testing Strategy

### Verificação Visual

1. Verificar se todos os títulos estão corretos
2. Confirmar que as legendas estão presentes onde necessário
3. Validar alinhamento dos gráficos
4. Testar responsividade em diferentes tamanhos de tela

### Verificação de Dados

1. Confirmar que os gráficos mantêm suas conexões com o Supabase
2. Verificar se os dados são carregados corretamente
3. Validar que as correções não afetam a funcionalidade

### Status de Conexão Supabase

Baseado na análise dos serviços:

**Conectados ao Supabase:**
- Gênero dos Clientes: ✅ Conectado (`clientes_decorfabril`)
- Promoções Semana: ✅ Conectado (`Relatorio Envio de Promoções`)
- Promoções 6 Meses: ✅ Conectado (`Relatorio Envio de Promoções`)
- Pesquisas Enviadas: ✅ Conectado (`pesquisas_enviadas`)
- Cashback: ✅ Conectado (`EnvioCashTemTotal`)
- Aniversários Gerais: ✅ Conectado (`relatorio_niver_decor_fabril`)
- Aniversários Detalhado: ✅ Conectado (`relatorio_niver_decor_fabril`)
- Respostas Pesquisas: ✅ Conectado (`respostas_pesquisas`)

**Dados Estáticos:**
- Números Inválidos: ⚠️ Dados estáticos no componente

### Implementação das Correções

As correções serão implementadas através de:

1. **Substituição de strings** para corrigir textos corrompidos
2. **Adição de props** para títulos e descrições faltantes
3. **Ajustes de CSS** para alinhamento
4. **Correção de legendas** onde necessário

### Estrutura de Cards

```jsx
<Card>
  <CardHeader>
    <CardTitle>{titulo}</CardTitle>
    {descricao && <CardDescription>{descricao}</CardDescription>}
  </CardHeader>
  <CardContent>
    {/* Gráfico */}
  </CardContent>
</Card>
```