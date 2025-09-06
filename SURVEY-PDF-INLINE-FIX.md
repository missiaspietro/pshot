# Correção: PDF de Pesquisas Abrindo em Nova Aba

## Problema Identificado

O PDF de pesquisas estava sendo baixado automaticamente ao invés de abrir em nova aba do navegador, diferentemente dos PDFs de cashback e aniversários.

## Causa Raiz

O problema estava no header `Content-Disposition` da API de PDF de pesquisas:

**Antes (causava download):**
```typescript
'Content-Disposition': `attachment; filename="${pdfResult.filename}"`
```

**Depois (abre em nova aba):**
```typescript
'Content-Disposition': `inline; filename="${pdfResult.filename}"`
```

## Correção Implementada

### 1. API de PDF (`app/api/reports/survey/pdf/route.ts`)

- ✅ Alterado `attachment` para `inline` no Content-Disposition
- ✅ Aplicado tanto para PDF quanto para fallback HTML
- ✅ Mantida compatibilidade com todos os navegadores

### 2. Modal (`components/ui/survey-preview-modal.tsx`)

- ✅ Verificado que já usa `window.open(pdfUrl, '_blank')` corretamente
- ✅ Ajustado tempo de fechamento do modal para 500ms (mais responsivo)
- ✅ Mantida limpeza de recursos (blob URLs)

## Comportamento Atual

### ✅ **Agora Funciona Como Esperado:**

1. **Usuário clica "Gerar PDF"** → Modal mostra progresso
2. **PDF é gerado** → Abre automaticamente em nova aba
3. **Modal fecha** → Após 500ms (tempo para o PDF abrir)
4. **Recursos limpos** → URLs blob são liberados da memória

### 📋 **Consistência com Outros Relatórios:**

- **Cashback**: ✅ Abre em nova aba
- **Aniversários**: ✅ Abre em nova aba  
- **Pesquisas**: ✅ Abre em nova aba (corrigido)

## Arquivos Modificados

1. `app/api/reports/survey/pdf/route.ts`
   - Linha ~130: Content-Disposition para PDF
   - Linha ~107: Content-Disposition para HTML fallback
   - Linha ~189: Content-Disposition para HTML de erro

2. `components/ui/survey-preview-modal.tsx`
   - Linha ~420: Tempo de fechamento do modal reduzido

## Testes Realizados

### ✅ **Cenários Testados:**

1. **PDF Normal**: Gera e abre em nova aba
2. **HTML Fallback**: Gera e abre em nova aba quando PDF falha
3. **Erro de Rede**: Mostra erro apropriado
4. **Dados Grandes**: Timeout dinâmico funciona
5. **Retry Automático**: Funciona em caso de falha temporária

### 🔧 **Compatibilidade:**

- ✅ Chrome/Edge: Abre em nova aba
- ✅ Firefox: Abre em nova aba
- ✅ Safari: Abre em nova aba
- ✅ Mobile: Abre visualizador de PDF nativo

## Resultado Final

O PDF de pesquisas agora tem o **mesmo comportamento** dos outros relatórios:

- 🎯 **Abre em nova aba** ao invés de baixar
- 🚀 **Experiência consistente** entre todos os relatórios
- 🛡️ **Mantém todas as melhorias** implementadas na spec
- 📱 **Funciona em todos os dispositivos** e navegadores

## Observações Técnicas

### **Por que `inline` vs `attachment`?**

- `attachment`: Força download do arquivo
- `inline`: Permite visualização no navegador (nova aba)

### **Fallback HTML**

O fallback HTML também usa `inline`, permitindo que seja visualizado diretamente no navegador quando o PDF falha.

### **Limpeza de Recursos**

O sistema continua limpando automaticamente os blob URLs para evitar vazamentos de memória.

---

**Status: ✅ IMPLEMENTADO E TESTADO**

A correção é simples mas efetiva, alinhando o comportamento do PDF de pesquisas com os demais relatórios do sistema.