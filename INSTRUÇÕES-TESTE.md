# Instruções para Testar as Correções

## 🚀 Como Testar as Correções Implementadas

### 1. **Iniciar o Servidor**
```bash
npm run dev
# ou
yarn dev
```

### 2. **Testar Relatório de Aniversários**

#### Via Interface Web:
1. Acesse: `http://localhost:3000/reports`
2. Configure as datas (ex: 01/01/2024 a 31/12/2024)
3. Clique no ícone de engrenagem (⚙️) no card "Relatório de Aniversários"
4. Selecione os campos desejados
5. Clique em "Ver", "PDF" ou "Excel"
6. **Verificar:** Se todos os registros do período aparecem (não apenas 100)

#### Via API (usando curl ou Postman):
```bash
curl -X POST http://localhost:3000/api/reports/birthday \
  -H "Content-Type: application/json" \
  -d '{
    "selectedFields": ["criado_em", "cliente", "whatsApp", "rede", "loja"],
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### 3. **Testar Configurações de Filtros**

#### Via Interface Web:
1. Na página de relatórios, expanda as configurações (⚙️)
2. Selecione alguns campos
3. Clique em "Salvar"
4. Digite um nome para a configuração
5. Clique em "Salvar Configuração"
6. **Verificar:** Se não aparece erro 500

#### Via API:
```bash
# Salvar configuração
curl -X POST http://localhost:3000/api/users/report-filters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Configuração",
    "selectedFields": ["criado_em", "cliente", "whatsApp"]
  }'

# Carregar configurações
curl -X GET http://localhost:3000/api/users/report-filters \
  -H "Content-Type: application/json"
```

## 🔍 O Que Verificar

### ✅ Relatório de Aniversários
- [ ] **Todos os registros do período** são retornados (não apenas 100)
- [ ] **Filtro por empresa** está sendo aplicado corretamente
- [ ] **Logs no console** mostram quantidade de registros e rede do usuário
- [ ] **Datas** estão sendo respeitadas no filtro

### ✅ Configurações de Filtros
- [ ] **Salvamento funciona** sem erro 500
- [ ] **Carregamento funciona** e mostra configurações salvas
- [ ] **Criptografia funciona** (dados são salvos criptografados)
- [ ] **Exclusão funciona** sem erros

## 📊 Logs Esperados

### No Console do Navegador:
```
API Birthday Report - Dados recebidos: {selectedFields: [...], startDate: "...", endDate: "..."}
API Birthday Report - Rede do usuário: rede_teste
API Birthday Report - Dados retornados: 1500 registros
```

### No Terminal do Servidor:
```
Service - Filtros recebidos: {selectedFields: [...], userNetwork: "rede_teste"}
Service - Aplicando filtro de rede: rede_teste
Service - Executando query SEM LIMITE para pegar todos os registros...
Service - Resultado: {dataLength: 1500, error: "Nenhum erro"}
```

## 🚨 Problemas Comuns e Soluções

### Erro: "Tabela users não está acessível"
**Solução:** Verificar se a tabela `users` existe no Supabase com as colunas:
- `id` (integer)
- `email` (text)
- `rede` (text)
- `config_filtros_relatorios` (text, nullable)

### Erro: "Não foi possível determinar a empresa do usuário"
**Solução:** Verificar se existe pelo menos um registro na tabela `relatorio_niver_decor_fabril` com campo `rede` preenchido.

### Erro 500 na criptografia
**Solução:** Verificar se a variável de ambiente `ENCRYPTION_SECRET` está definida no `.env.local`.

### Nenhum registro retornado
**Solução:** 
1. Verificar se existem dados na tabela `relatorio_niver_decor_fabril`
2. Verificar se o campo `rede` dos dados corresponde ao usuário
3. Verificar se as datas estão no formato correto (YYYY-MM-DD)

## 🎯 Resultado Esperado

Após as correções, você deve ver:

1. **Relatórios completos** - Todos os registros do período selecionado
2. **Sem erro 500** - Configurações salvam normalmente
3. **Filtro por empresa** - Apenas dados da empresa do usuário
4. **Logs detalhados** - Para monitoramento e debug
5. **Criptografia funcionando** - Dados sensíveis protegidos

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs no console do navegador (F12)
2. Verificar logs no terminal do servidor
3. Verificar se todas as variáveis de ambiente estão configuradas
4. Verificar se o banco de dados tem as tabelas e dados necessários