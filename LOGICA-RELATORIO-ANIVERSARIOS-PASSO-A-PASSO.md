# 📋 LÓGICA COMPLETA DO RELATÓRIO DE ANIVERSÁRIOS - PASSO A PASSO

## 🏗️ **ESTRUTURA GERAL**

### **Arquivos envolvidos:**
1. `app/api/reports/birthday/pdf/route.ts` - API para gerar PDF
2. `lib/birthday-report-service.ts` - Service para buscar dados
3. Frontend em `app/reports/page.tsx` - Interface do usuário

---

## 📝 **PASSO 1: RECEBIMENTO DA REQUISIÇÃO**

### **Input da API:**
```typescript
const body = await request.json()
const { selectedFields, startDate, endDate } = body
```

### **Validações:**
- ✅ Verificar se `selectedFields` existe e é array
- ✅ Verificar se tem pelo menos 1 campo selecionado
- ❌ Se falhar → Retorna erro 400

---

## 🔐 **PASSO 2: AUTENTICAÇÃO DO USUÁRIO**

### **2.1 - Extrair cookie de sessão:**
```typescript
const cookies = request.headers.get('cookie') || ''
const sessionMatch = cookies.match(/ps_session=([^;]+)/)
```

### **2.2 - Validar sessão:**
- ✅ Se cookie existe → Extrai email
- ❌ Se não existe → Retorna erro 401

### **2.3 - Buscar dados do usuário no Supabase:**
```typescript
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('id, email, nome, empresa, rede, sistema')
  .eq('email', email)
  .eq('sistema', 'Praise Shot')
  .single()
```

### **2.4 - Validar usuário:**
- ✅ Se encontrado → Extrai `userNetwork` (rede ou empresa)
- ❌ Se não encontrado → Retorna erro 401
- ❌ Se sem rede/empresa → Retorna erro 400

---

## 📊 **PASSO 3: BUSCAR DADOS DO RELATÓRIO**

### **3.1 - Chamar service:**
```typescript
const data = await getCustomBirthdayReport({
  selectedFields,
  startDate,
  endDate,
  userNetwork
})
```

### **3.2 - O service faz:**
- 🔍 Query no Supabase na tabela `relatorio_niver_decor_fabril`
- 🎯 Filtra por `rede = userNetwork`
- 📅 Aplica filtros de data se fornecidos
- 📋 Seleciona apenas campos escolhidos
- 🔄 Retorna array de registros

---

## 🏷️ **PASSO 4: MAPEAR LABELS DOS CAMPOS**

### **4.1 - Definir mapeamento:**
```typescript
const fieldLabels: { [key: string]: string } = {
  'criado_em': 'Data de Criação',
  'cliente': 'Cliente',
  'whatsApp': 'WhatsApp',
  'mensagem_entrege': 'Mensagem Entregue',
  'mensagem_perdida': 'Mensagem Perdida',
  'rede': 'Rede',
  'loja': 'Loja',
  'obs': 'Observações',
  'Sub_Rede': 'Sub-rede'
}
```

---

## 🎨 **PASSO 5: GERAR HTML DO RELATÓRIO**

### **5.1 - Função `generateReportHTML()`:**

#### **5.1.1 - Criar cabeçalhos da tabela:**
```typescript
const tableHeaders = selectedFields.map(fieldId => 
  `<th>${fieldLabels[fieldId] || fieldId}</th>`
).join('')
```

#### **5.1.2 - Criar linhas da tabela:**
```typescript
const tableRows = data.map((row) => {
  const cells = selectedFields.map(fieldId => {
    let value = row[fieldId]
    
    // Formatação especial para datas
    if (fieldId === 'criado_em' && value) {
      value = new Date(value).toLocaleDateString('pt-BR')
    }
    
    // Escapar HTML
    const displayValue = value === null || undefined ? '-' : String(value)
    const escapedValue = displayValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    
    return `<td>${escapedValue}</td>`
  }).join('')
  return `<tr>${cells}</tr>`
}).join('')
```

#### **5.1.3 - Montar HTML completo:**
- 📄 DOCTYPE e meta tags UTF-8
- 🎨 CSS inline com estilos da tabela
- 📊 Header com título e informações
- 📋 Tabela com dados ou mensagem "sem dados"
- 🔻 Footer com data de geração

---

## 🖨️ **PASSO 6: GERAR PDF COM PUPPETEER**

### **6.1 - Tentar usar Puppeteer:**
```typescript
try {
  const puppeteer = require('puppeteer')
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  
  await page.setExtraHTTPHeaders({
    'Accept-Charset': 'utf-8'
  })
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true
  })
  
  await browser.close()
  
  // Retornar PDF
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf; charset=utf-8',
      'Content-Disposition': 'attachment; filename="relatorio-aniversarios-DATE.pdf"'
    }
  })
}
```

### **6.2 - Se Puppeteer falhar:**
```typescript
catch (puppeteerError) {
  // Retornar HTML como fallback
  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'inline; filename="relatorio-aniversarios-DATE.html"'
    }
  })
}
```

---

## 🔄 **PASSO 7: TRATAMENTO DE ERROS**

### **7.1 - Erros capturados:**
- ❌ Campos não selecionados → 400
- ❌ Usuário não autenticado → 401
- ❌ Usuário não encontrado → 401
- ❌ Usuário sem rede → 400
- ❌ Erro interno → 500

### **7.2 - Logs para debug:**
- 🔍 Dados recebidos
- 👤 Email da sessão
- 🎯 Empresa do usuário
- 📊 Quantidade de registros
- 📝 Tamanho do HTML gerado

---

## 📱 **PASSO 8: FRONTEND (CHAMADA DA API)**

### **8.1 - Função no frontend:**
```typescript
const handleGenerateReport = async () => {
  const response = await fetch('/api/reports/birthday/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      selectedFields,
      startDate,
      endDate
    })
  })
  
  const pdfBlob = await response.blob()
  const pdfUrl = window.URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
}
```

---

## ✅ **RESUMO DOS PONTOS CRÍTICOS:**

1. **Autenticação** - Cookie `ps_session` obrigatório
2. **Filtro por empresa** - Sempre aplicado automaticamente
3. **Puppeteer** - Essencial para gerar PDF real
4. **UTF-8** - Configurado em múltiplos pontos
5. **Fallback HTML** - Se Puppeteer falhar
6. **Headers corretos** - `Content-Type` e `Content-Disposition`
7. **Tratamento de erros** - Em cada etapa crítica