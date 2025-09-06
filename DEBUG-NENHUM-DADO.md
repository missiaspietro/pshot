# Debug: Nenhum Dado Aparecendo

## 🔍 Possíveis Causas

### 1. **Problema de Autenticação**
- Cookie `ps_session` não está sendo enviado
- Usuário não encontrado na tabela `users`
- Campo `empresa`/`rede` do usuário está vazio

### 2. **Incompatibilidade de Redes**
- Rede do usuário não corresponde às redes na tabela `relatorio_niver_decor_fabril`
- Diferenças de maiúsculas/minúsculas
- Espaços extras nos nomes das redes

### 3. **Filtros de Data Muito Restritivos**
- Período selecionado não tem dados
- Formato de data incorreto
- Dados estão fora do período

### 4. **Problemas na Tabela**
- Tabela `relatorio_niver_decor_fabril` vazia
- Campos `rede` com valores null
- Estrutura da tabela diferente do esperado

## 🧪 Como Diagnosticar

### 1. **Execute o Script de Debug**
```bash
node debug-nenhum-dado.js
```

Este script irá:
- ✅ Verificar se a tabela existe e tem dados
- ✅ Listar todas as redes disponíveis
- ✅ Verificar usuários na tabela `users`
- ✅ Comparar redes entre as tabelas
- ✅ Testar filtros de data
- ✅ Simular query completa da aplicação

### 2. **Verifique os Logs do Servidor**
Procure por estes logs específicos:
```
🎯 Gerando relatório. Empresa do user: [EMPRESA]
📈 Dados brutos obtidos: 0 registros
🔍 INVESTIGANDO AUSÊNCIA DE DADOS:
📊 Redes disponíveis na tabela: [...]
📊 Rede do usuário: [...]
📊 Rede do usuário está na lista? false
```

### 3. **Teste Manual no Banco**
```sql
-- Verificar se há dados na tabela
SELECT COUNT(*) FROM relatorio_niver_decor_fabril;

-- Verificar redes disponíveis
SELECT DISTINCT rede FROM relatorio_niver_decor_fabril WHERE rede IS NOT NULL;

-- Verificar usuário específico
SELECT email, empresa, rede FROM users WHERE email = 'seu_email@empresa.com';

-- Verificar correspondência
SELECT COUNT(*) FROM relatorio_niver_decor_fabril 
WHERE rede = 'SUA_REDE_DO_USUARIO';
```

## 🔧 Soluções Comuns

### 1. **Se Não Há Dados na Tabela**
```sql
-- Inserir dados de teste
INSERT INTO relatorio_niver_decor_fabril (cliente, rede, criado_em, whatsApp, loja)
VALUES ('Cliente Teste', 'SUA_EMPRESA', '2024-01-15', '11999999999', 'Loja 1');
```

### 2. **Se Rede do Usuário Não Corresponde**
```sql
-- Atualizar rede do usuário
UPDATE users SET rede = 'REDE_CORRETA' WHERE email = 'seu_email@empresa.com';

-- OU atualizar redes na tabela de relatórios
UPDATE relatorio_niver_decor_fabril SET rede = 'REDE_DO_USUARIO' WHERE rede = 'REDE_ANTIGA';
```

### 3. **Se Há Problemas de Maiúsculas/Espaços**
```sql
-- Limpar espaços extras
UPDATE relatorio_niver_decor_fabril SET rede = TRIM(rede);
UPDATE users SET rede = TRIM(rede), empresa = TRIM(empresa);

-- Padronizar maiúsculas
UPDATE relatorio_niver_decor_fabril SET rede = UPPER(rede);
UPDATE users SET rede = UPPER(rede), empresa = UPPER(empresa);
```

### 4. **Se Filtros de Data São o Problema**
- Teste com período mais amplo (ex: último ano)
- Verifique formato das datas na tabela
- Use período que você sabe que tem dados

## 📊 Logs Esperados (Funcionando)

### Console do Servidor:
```
🎯 Gerando relatório. Empresa do user: EMPRESA_ABC
📈 Dados brutos obtidos: 150 registros
🔍 ANÁLISE DOS DADOS BRUTOS:
   Todas as redes encontradas: ["EMPRESA_ABC"]
   Distribuição por rede: { "EMPRESA_ABC": 150 }
🎯 Aplicando filtro manual para rede: EMPRESA_ABC
✅ Total original: 150, Total filtrado: 150, Removidos: 0
```

### Script de Debug:
```
📊 Total de registros na tabela: 500
📊 Redes únicas encontradas: ["EMPRESA_A", "EMPRESA_B", "EMPRESA_C"]
📊 Usuários encontrados:
   1. Email: user@empresa.com, Empresa: "EMPRESA_A", Rede: "EMPRESA_A"
      Tem dados na tabela de relatórios: ✅ SIM
📊 Registros no período: 50
📊 Dados após filtro de rede "EMPRESA_A": 50
```

## 🚨 Sinais de Problema

### Logs Problemáticos:
```
❌ Erro ao acessar tabela: [erro]
📊 Total de registros na tabela: 0
⚠️ Rede do usuário não encontrada na tabela de relatórios
📊 Rede do usuário está na lista? false
📊 Dados brutos obtidos: 0 registros
📊 Dados após filtro de rede: 0
```

## 🎯 Checklist de Verificação

- [ ] Tabela `relatorio_niver_decor_fabril` existe e tem dados
- [ ] Tabela `users` tem usuário com sistema 'Praise Shot'
- [ ] Campo `rede` ou `empresa` do usuário está preenchido
- [ ] Rede do usuário existe na tabela de relatórios
- [ ] Período de datas tem dados disponíveis
- [ ] Cookie de sessão está sendo enviado corretamente
- [ ] Não há erros de SQL nas queries
- [ ] Campos selecionados existem na tabela

Execute o script de debug e compare com este checklist para identificar o problema específico.