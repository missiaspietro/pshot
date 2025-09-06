# Implementation Plan - Correção do Filtro de Empresa em Promoções

## Tarefas de Implementação

- [x] 1. Corrigir validação de empresa no serviço


  - Modificar função `validateCompanyData` para incluir registros com Rede null/undefined
  - Adicionar logs detalhados sobre quantos registros foram incluídos/excluídos
  - Implementar fallback para mostrar todos os registros se não encontrar da empresa específica
  - _Requirements: 1.2, 2.1, 2.2, 4.1, 4.2_




- [ ] 2. Melhorar logs da API de promoções
  - Adicionar logs sobre empresa do usuário e filtros aplicados
  - Logar estatísticas de registros encontrados vs filtrados
  - Implementar mensagens claras quando não há dados
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Implementar opções flexíveis de filtro
  - Criar interface `CompanyValidationOptions` para controlar comportamento
  - Adicionar parâmetro `includeNullCompany` nos filtros
  - Implementar modo estrito vs flexível de validação
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Melhorar tratamento de erros no modal
  - Adicionar mensagens específicas para diferentes cenários de erro
  - Implementar retry automático quando não há dados
  - Melhorar UX quando dados estão carregando
  - _Requirements: 5.3, 5.4_

- [ ] 5. Adicionar testes para validação flexível
  - Criar testes unitários para `validateCompanyData` com diferentes cenários
  - Testar API com usuários de diferentes empresas
  - Testar modal com dados null/undefined
  - _Requirements: 4.3, 4.4_

- [ ] 6. Implementar fallback inteligente
  - Quando não encontrar dados da empresa, tentar incluir registros null
  - Se ainda não houver dados, mostrar todos os registros com aviso
  - Logar claramente qual estratégia foi usada
  - _Requirements: 2.4, 4.1, 4.2_

- [ ] 7. Otimizar performance com novos filtros
  - Manter cache considerando novos parâmetros de filtro
  - Otimizar queries para incluir registros null de forma eficiente
  - Implementar paginação inteligente no modal
  - _Requirements: 1.1, 5.1, 5.2_

- [ ] 8. Documentar mudanças e criar guia de troubleshooting
  - Documentar novo comportamento de filtros
  - Criar guia para debugar problemas de dados vazios
  - Adicionar exemplos de uso da API com diferentes cenários
  - _Requirements: 3.1, 3.2, 3.3_