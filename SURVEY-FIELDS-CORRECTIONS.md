# Correções nos Campos de Pesquisas

## ✅ Correções Implementadas

### 1. Campo "Rede" Marcado por Padrão
- ✅ **Antes**: Rede estava apenas imodificável (disabled), mas não marcado
- ✅ **Depois**: Rede agora está marcado por padrão E imodificável
- ✅ **Implementação**: Adicionado "rede" ao array `selectedSurveyFields`

### 2. Campos Removidos
Removidos os seguintes campos conforme solicitado:

| Campo Removido | Motivo |
|----------------|--------|
| `criado_em` | Data de Criação - removido |
| `vendedor` | Vendedor - removido |
| `caixa` | Caixa - removido |

### 3. Campos Finais Disponíveis

| Campo | Label | Descrição | Status |
|-------|-------|-----------|--------|
| `nome` | Nome | Nome do cliente | ✅ Selecionável |
| `telefone` | Telefone | Telefone do cliente | ✅ Selecionável |
| `resposta` | Resposta | Resposta da pesquisa (1-Ótimo, 2-Bom, 3-Regular, 4-Péssimo) | ✅ Selecionável |
| `loja` | Loja | Loja onde foi realizada a pesquisa | ✅ Selecionável |
| `rede` | Rede | Rede do usuário | 🔒 **Sempre marcado** |
| `sub_rede` | Sub Rede | Sub rede associada | ✅ Selecionável |
| `pergunta` | Pergunta | Pergunta da pesquisa | ✅ Selecionável |
| `data_de_envio` | Data de Envio | Data de envio da pesquisa | ✅ Selecionável |

### 4. Campos Selecionados por Padrão

Agora os campos marcados por padrão são:
- ✅ Nome
- ✅ Telefone  
- ✅ Resposta
- ✅ Loja
- ✅ **Rede** (sempre marcado e imodificável)

## 🔧 Arquivos Atualizados

1. **`app/reports/page.tsx`**
   - Atualizado `selectedSurveyFields` para incluir "rede"
   - Removido campos: `criado_em`, `vendedor`, `caixa`
   - Função `toggleSurveyField` já impedia desmarcar "rede"

2. **`app/api/reports/survey/pdf/route.ts`**
   - Removido labels dos campos excluídos
   - Atualizada formatação de datas

3. **`components/ui/survey-preview-modal.tsx`**
   - Atualizada formatação para remover `criado_em`

## 🎯 Resultado

**Antes**: 
- Rede não estava marcado por padrão
- 11 campos disponíveis (incluindo vendedor, caixa, data de criação)

**Depois**:
- ✅ Rede marcado por padrão e imodificável
- ✅ 8 campos disponíveis (removidos 3 campos)
- ✅ Seleção padrão mais limpa e focada

O modal de pesquisas agora está com a configuração correta de campos!