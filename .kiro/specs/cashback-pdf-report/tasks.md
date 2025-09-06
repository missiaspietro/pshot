# Plano de Implementação - Relatório de Cashback PDF

- [x] 1. Criar estrutura base da API e service


  - Criar arquivo `/app/api/reports/cashback/pdf/route.ts` com estrutura básica da API
  - Criar arquivo `/lib/cashback-pdf-service.ts` com interfaces e funções principais
  - Implementar validação básica de parâmetros de entrada
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Implementar autenticação e autorização


  - Implementar extração e validação do cookie `ps_session`
  - Implementar busca de dados do usuário na tabela `users`
  - Implementar validação de empresa/rede do usuário
  - Adicionar tratamento de erros de autenticação (401, 400)
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implementar busca de dados da tabela EnvioCashTemTotal


  - Criar função `getCashbackReportData` no service
  - Implementar filtro obrigatório por `Status = 'Enviada'`
  - Implementar filtro obrigatório por `Rede_de_loja = userNetwork`
  - Implementar filtros opcionais de data (`startDate` e `endDate`)
  - Implementar seleção dinâmica de campos baseada em `selectedFields`
  - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Implementar mapeamento de campos e formatação


  - Criar constante `FIELD_LABELS` com mapeamento de campos técnicos para labels amigáveis
  - Implementar função para aplicar labels nos cabeçalhos
  - Implementar formatação de datas para formato brasileiro (DD/MM/AAAA)
  - Implementar tratamento de valores null/undefined
  - _Requisitos: 4.1, 4.2, 4.3_

- [x] 5. Implementar geração de HTML do relatório


  - Criar função `generateReportHTML` no service
  - Implementar estrutura HTML com DOCTYPE e meta tags UTF-8
  - Implementar cabeçalho com título "Relatório de Cashbacks" em verde (#10b981)
  - Implementar seção de informações (total de registros e data de geração)
  - Implementar tabela com cabeçalhos baseados nos campos selecionados
  - Implementar linhas de dados com formatação adequada
  - Implementar estilo zebrado e bordas para a tabela
  - Implementar escape de HTML mantendo acentos
  - Implementar mensagem para caso sem dados
  - Implementar footer com data de geração
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 6. Implementar geração de PDF com Puppeteer


  - Instalar e configurar Puppeteer se necessário
  - Implementar função `generateCashbackPDF` no service
  - Configurar inicialização do Puppeteer com `headless: true` e argumentos de segurança
  - Implementar criação de página e configuração de headers UTF-8
  - Implementar definição de conteúdo HTML com `waitUntil: 'networkidle0'`
  - Configurar geração de PDF com formato A4, margens 20mm e `printBackground: true`
  - Implementar fechamento adequado do browser
  - Configurar headers de resposta para PDF com filename dinâmico
  - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 7. Implementar tratamento de falhas e fallback


  - Implementar captura de exceções do Puppeteer
  - Implementar logging detalhado de erros
  - Implementar fallback para retorno de HTML quando Puppeteer falha
  - Configurar headers apropriados para resposta HTML de fallback
  - _Requisitos: 7.1, 7.2, 7.3, 7.4_

- [x] 8. Implementar logging e tratamento de erros


  - Adicionar logs detalhados em cada etapa do processo
  - Implementar logging de parâmetros de entrada
  - Implementar logging de dados de autenticação
  - Implementar logging de quantidade de registros encontrados
  - Implementar logging de tamanho do HTML gerado
  - Implementar logging de erros com detalhes
  - Implementar respostas JSON apropriadas para diferentes tipos de erro
  - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 9. Integrar com frontend existente


  - Identificar e modificar o card "Relatório de Cashbacks" na página `/reports`
  - Implementar função para fazer POST para `/api/reports/cashback/pdf`
  - Implementar envio de `selectedFields`, `startDate` e `endDate` na requisição
  - Implementar criação de blob e abertura em nova aba para resposta PDF
  - Implementar exibição de mensagens de erro apropriadas
  - Implementar indicador de loading durante o processo
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Criar testes unitários para o service
  - Criar testes para função `getCashbackReportData` com diferentes filtros
  - Criar testes para função `generateReportHTML` com diferentes combinações de campos
  - Criar testes para mapeamento de campos e formatação de dados
  - Criar testes para cenários de erro e tratamento de exceções
  - _Requisitos: Todos os requisitos de funcionalidade_

- [ ] 11. Criar testes de integração
  - Criar testes para integração com banco de dados
  - Criar testes para geração de PDF com Puppeteer
  - Criar testes end-to-end do fluxo completo
  - Criar testes de autenticação e autorização
  - _Requisitos: Todos os requisitos de funcionalidade_

- [x] 12. Otimização e ajustes finais



  - Implementar otimizações de performance para queries do banco
  - Implementar configurações otimizadas do Puppeteer
  - Implementar limpeza adequada de recursos
  - Testar com datasets grandes e ajustar conforme necessário
  - Verificar e ajustar tratamento de caracteres especiais e acentos
  - _Requisitos: Todos os requisitos de performance e segurança_