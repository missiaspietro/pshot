# 🔍 Checklist de Debug - API de Promoções Retornando Vazio

## ❌ Problema
A API `/api/reports/promotions` está retornando array vazio mesmo com dados na tabela.

## 🎯 Verificações Críticas

### 1. 🏢 **Verificar Empresa do Usuário**
```sql
-- No Supabase, execute esta query para ver quais empresas existem:
SELECT DISTINCT "Rede" FROM "Relatorio Envio de Promoções";
```

**❓ Pergunta:** Quais valores aparecem na coluna "Rede"?

### 2. 👤 **Verificar Usuário Logado**
- Abra DevTools → Application → Cookies
- Procure por `ps_session`
- **❓ Pergunta:** Qual é o valor do cookie `ps_session`?

### 3. 📊 **Verificar Estrutura da Tabela**
```sql
-- Execute no Supabase para ver a estrutura:
SELECT * FROM "Relatorio Envio de Promoções" LIMIT 3;
```

**❓ Perguntas:**
- A tabela existe?
- Quais são os nomes exatos das colunas?
- Como estão formatadas as datas?

### 4. 📅 **Verificar Formato das Datas**
```sql
-- Verificar formato do campo Data_Envio:
SELECT "Data_Envio", typeof("Data_Envio") 
FROM "Relatorio Envio de Promoções" 
LIMIT 5;
```

**❓ Pergunta:** As datas estão no formato YYYY-MM-DD?

### 5. 🔐 **Verificar Autenticação**
- Abra a página de relatórios
- Abra DevTools → Console
- Clique em "Ver" no card de promoções
- **❓ Pergunta:** Aparecem erros no console?

## 🧪 Testes para Executar

### Teste 1: Verificar Total de Registros
```sql
SELECT COUNT(*) as total FROM "Relatorio Envio de Promoções";
```

### Teste 2: Verificar Registros Recentes
```sql
SELECT * FROM "Relatorio Envio de Promoções" 
ORDER BY "Data_Envio" DESC 
LIMIT 5;
```

### Teste 3: Testar Filtro por Empresa
```sql
-- Substitua 'SUA_EMPRESA' pelo valor real da empresa do usuário
SELECT COUNT(*) FROM "Relatorio Envio de Promoções" 
WHERE "Rede" = 'SUA_EMPRESA';
```

### Teste 4: Usar o Arquivo HTML
1. Abra o arquivo `test-promotions-browser.html` no navegador
2. Clique em "Testar API"
3. Veja os logs detalhados

## 🔍 Pontos de Investigação

### A. **Problema de Empresa**
- A empresa do usuário logado não confere com os valores na coluna "Rede"
- **Solução:** Verificar se o usuário tem empresa/rede configurada corretamente

### B. **Problema de Data**
- As datas na tabela estão em formato incompatível
- **Solução:** Ajustar formato das datas ou query

### C. **Problema de Autenticação**
- Cookie de sessão inválido ou usuário não encontrado
- **Solução:** Verificar sistema de autenticação

### D. **Problema de Permissões**
- RLS (Row Level Security) bloqueando acesso
- **Solução:** Verificar políticas do Supabase

## 📋 Informações Necessárias

Para continuar o debug, preciso saber:

1. **Quantos registros tem a tabela?**
   ```sql
   SELECT COUNT(*) FROM "Relatorio Envio de Promoções";
   ```

2. **Quais empresas existem na tabela?**
   ```sql
   SELECT DISTINCT "Rede" FROM "Relatorio Envio de Promoções";
   ```

3. **Qual é a empresa do usuário logado?**
   - Verificar nos logs da API ou no banco de dados

4. **Como estão as datas?**
   ```sql
   SELECT "Data_Envio" FROM "Relatorio Envio de Promoções" LIMIT 3;
   ```

5. **Há erros nos logs do servidor?**
   - Verificar console do Next.js

## 🚀 Próximos Passos

1. Execute as queries SQL acima
2. Use o arquivo `test-promotions-browser.html`
3. Verifique os logs do servidor
4. Me informe os resultados para identificar o problema exato

## 🎯 Resultado Esperado

Após essas verificações, saberemos exatamente onde está o problema:
- ✅ Tabela existe e tem dados
- ✅ Empresa do usuário confere com campo "Rede"  
- ✅ Datas estão no formato correto
- ✅ Autenticação está funcionando
- ✅ API retorna dados corretamente