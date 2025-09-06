# Requirements Document

## Introduction

Esta spec implementa a funcionalidade completa do relatório de promoções, incluindo API para buscar dados da tabela "Relatorio Envio de Promoções", sistema de configurações específico para promoções, e correções nos filtros de configurações dos outros cards para evitar conflitos.

## Requirements

### Requirement 1

**User Story:** Como usuário, eu quero que o modal de promoções busque dados reais do banco de dados baseado nos checkboxes selecionados e filtrado pela empresa do usuário logado

#### Acceptance Criteria

1. WHEN o usuário clicar no botão "Ver" do card de promoções THEN o modal deve abrir e buscar dados da tabela "Relatorio Envio de Promoções"
2. WHEN a API for chamada THEN deve filtrar os dados pela empresa/rede do usuário logado (campo "Rede" da tabela de promoções)
3. WHEN os dados forem retornados THEN devem incluir apenas os campos selecionados nos checkboxes
4. IF o usuário não tiver empresa/rede definida THEN deve retornar erro de autorização
5. WHEN houver dados THEN devem ser exibidos na tabela paginada do modal
6. WHEN não houver dados THEN deve exibir mensagem "Nenhum dado encontrado"

### Requirement 2

**User Story:** Como usuário, eu quero salvar configurações específicas para o card de promoções que não conflitem com outros cards

#### Acceptance Criteria

1. WHEN o usuário clicar em "Salvar" no card de promoções THEN deve abrir modal para nomear a configuração
2. WHEN a configuração for salva THEN deve incluir o sufixo "(Promoções)" no nome automaticamente
3. WHEN as configurações forem listadas THEN deve mostrar apenas configurações com sufixo "(Promoções)"
4. WHEN uma configuração for carregada THEN deve aplicar apenas aos checkboxes do card de promoções
5. WHEN uma configuração for excluída THEN deve remover apenas da lista de promoções

### Requirement 3

**User Story:** Como usuário, eu quero que o card de aniversários não pegue configurações de outros cards incorretamente

#### Acceptance Criteria

1. WHEN o card de aniversários listar configurações THEN deve mostrar apenas configurações com sufixo "(Aniversários)"
2. WHEN o card de aniversários carregar uma configuração THEN deve aplicar apenas aos seus próprios checkboxes
3. WHEN o card de aniversários salvar uma configuração THEN deve incluir o sufixo "(Aniversários)" automaticamente
4. IF uma configuração não tiver o sufixo correto THEN não deve aparecer na lista do card

### Requirement 4

**User Story:** Como desenvolvedor, eu quero APIs estruturadas para buscar dados de promoções e gerar PDFs

#### Acceptance Criteria

1. WHEN criar a API /api/reports/promotions THEN deve seguir o mesmo padrão das outras APIs
2. WHEN a API for chamada THEN deve autenticar o usuário via cookie de sessão
3. WHEN buscar dados THEN deve filtrar pela empresa/rede do usuário na tabela "Relatorio Envio de Promoções"
4. WHEN criar a API /api/reports/promotions/pdf THEN deve gerar PDF com os dados filtrados
5. WHEN houver erro THEN deve retornar mensagens de erro estruturadas
6. WHEN não houver dados THEN deve retornar array vazio com sucesso

### Requirement 5

**User Story:** Como usuário, eu quero que todos os cards tenham filtros de configuração isolados e funcionais

#### Acceptance Criteria

1. WHEN qualquer card salvar configuração THEN deve incluir sufixo identificador único
2. WHEN qualquer card listar configurações THEN deve filtrar apenas suas próprias configurações
3. WHEN qualquer card carregar configuração THEN deve validar se pertence ao card correto
4. WHEN houver configurações de outros cards THEN não devem aparecer na lista
5. WHEN excluir configuração THEN deve afetar apenas o card correspondente

### Requirement 6

**User Story:** Como usuário, eu quero que o sistema de autenticação funcione corretamente para promoções

#### Acceptance Criteria

1. WHEN a API buscar dados THEN deve obter email do cookie de sessão ps_session
2. WHEN buscar usuário THEN deve consultar tabela users com email e sistema "Praise Shot"
3. WHEN determinar empresa THEN deve priorizar campo "rede", depois "empresa"
4. WHEN filtrar dados THEN deve usar empresa do usuário no campo "Rede" da tabela de promoções
5. IF usuário não tiver empresa/rede THEN deve retornar erro 400
6. IF usuário não for encontrado THEN deve retornar erro 401

### Requirement 7

**User Story:** Como usuário, eu quero que o sistema seja otimizado para performance com grandes volumes de dados

#### Acceptance Criteria

1. WHEN buscar dados THEN deve limitar resultados a 1000 registros para evitar timeout
2. WHEN ordenar dados THEN deve ordenar por Data_Envio descendente
3. WHEN incluir campo Id THEN deve sempre incluir para identificação única
4. WHEN validar dados THEN deve garantir que todos pertencem à empresa correta
5. WHEN houver erro de timeout THEN deve retornar mensagem clara ao usuário