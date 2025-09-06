# Implementation Plan

- [x] 1. Remover conexão atual do gráfico "Pesquisas Enviadas"


  - Localizar e comentar/remover useEffect que chama pesquisa-enviada-service
  - Definir estado vazio para pesquisasEnviadas
  - Verificar se não há erros de console
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Remover conexão atual do gráfico "Aniversários Gerais"



  - Localizar e comentar/remover useEffect que chama birthday-report-service
  - Definir estado vazio para birthdayReportData
  - Verificar se não há erros de console
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Implementar nova conexão para gráfico "Pesquisas Enviadas"


  - Criar função fetchPesquisasEnviadas inline no componente
  - Implementar query com filtro de 6 meses e empresa do usuário
  - Processar dados agrupando por mês e loja
  - Conectar ao estado pesquisasEnviadas
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Implementar nova conexão para gráfico "Aniversários Gerais"


  - Criar função fetchAniversariosGerais inline no componente
  - Implementar query com filtro de 6 meses, empresa e mensagem_entrege='sim'
  - Processar dados agrupando por loja
  - Conectar ao estado birthdayReportData
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Testar e validar as novas conexões



  - Verificar se os gráficos carregam dados corretamente
  - Validar filtros de data e empresa
  - Confirmar que não há erros de console
  - Testar com diferentes cenários (com/sem dados)
  - _Requirements: 3.1-3.4, 4.1-4.5_