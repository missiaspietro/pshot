# Correções nos Checkboxes de Status

## ✅ Alterações Realizadas

### 1. Card de Promoções
- **Alteração**: Trocado o nome do checkbox "Observações" para "Status"
- **Alteração**: Removido o checkbox "Enviado" completamente
- **Alteração**: Removido o checkbox "Rede" completamente
- **Campo**: `{ id: "Obs", label: "Status", description: "Status sobre o envio" }`
- **Campos removidos**: 
  - `{ id: "Enviado", label: "Enviado", description: "Status de envio da promoção" }`
  - `{ id: "Rede", label: "Rede", description: "Rede da loja" }`
- **Localização**: `availablePromotionsFields` em `app/reports/page.tsx`
- **Estado padrão**: `["Cliente", "Whatsapp", "Loja", "Data_Envio"]` (sem "Enviado" e "Rede")

### 2. Card de Aniversários
- **Alteração**: Removido `disabled: true` do campo status
- **Alteração**: Removido "status" dos campos selecionados por padrão
- **Alteração**: Removida lógica que impedia desmarcar o status na função `toggleField`
- **Campo**: `{ id: "status", label: "Status", description: "Status do envio (observações)" }`
- **Estado padrão**: `["criado_em", "cliente", "whatsApp", "loja"]` (sem "status")

### 3. Card de Cashback
- **Alteração**: Removido `disabled: true` do campo status
- **Alteração**: Removido "Status" dos campos selecionados por padrão
- **Alteração**: Removida lógica que impedia desmarcar o status na função `toggleCashbackField`
- **Campo**: `{ id: "Status", label: "Status", description: "Status do envio" }`
- **Estado padrão**: `["Envio_novo", "Nome", "Whatsapp", "Loja"]` (sem "Status")

## 🔧 Comportamento Atual

### Antes das Alterações:
- ❌ Promoções: Campo "Observações" + Campo "Enviado" + Campo "Rede"
- ❌ Aniversários: Status sempre marcado e não editável
- ❌ Cashback: Status sempre marcado e não editável

### Depois das Alterações:
- ✅ Promoções: Campo "Status" editável (sem campos "Enviado" e "Rede")
- ✅ Aniversários: Status editável e não marcado por padrão
- ✅ Cashback: Status editável e não marcado por padrão

## 📝 Arquivos Modificados

1. `app/reports/page.tsx`
   - Alterado `availablePromotionsFields` (removido "Enviado", renomeado "Observações" → "Status")
   - Alterado `availableFields` (aniversários)
   - Alterado `availableCashbackFields`
   - Removida lógica de restrição nas funções `toggleField` e `toggleCashbackField`
   - Alterados estados padrão `selectedFields`, `selectedCashbackFields` e `selectedPromotionsFields`

2. `lib/promotions-report-service.ts`
   - Removidos campos "Enviado" e "Rede" da lista `availableFields`

## 🎯 Resultado Final

Todos os campos de status agora são:
- ✅ Editáveis (podem ser marcados/desmarcados)
- ✅ Não vêm marcados por padrão
- ✅ Funcionam normalmente como qualquer outro checkbox
- ✅ Promoções tem o nome correto "Status" ao invés de "Observações"
- ✅ Campos "Enviado" e "Rede" foram completamente removidos das promoções