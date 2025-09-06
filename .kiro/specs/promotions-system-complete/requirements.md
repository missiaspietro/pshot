# Sistema Completo de Relatórios de Promoções

## Introdução

Implementação completa do sistema de relatórios de promoções, incluindo API para buscar dados, geração de PDF, sistema de configurações criptografadas e integração com o modal de preview. O sistema deve seguir os mesmos padrões dos outros relatórios existentes.

## Requisitos

### Requisito 1: API de Dados de Promoções

**User Story:** Como usuário do sistema, eu quero que o modal de promoções busque dados reais da tabela "Relatorio Envio de Promoções", filtrados pela empresa do usuário logado, para visualizar informações precisas sobre campanhas promocionais.

#### Acceptance Criteria

1. WHEN o usuário abrir o modal de promoções THEN o sistema SHALL buscar dados da tabela "Relatorio Envio de Promoções" via API
2. WHEN a API receber uma requisição THEN o sistema SHALL filtrar dados pela empresa/rede do usuário autenticado
3. WHEN o usuário selecionar campos específicos THEN o sistema SHALL retornar apenas os campos solicitados
4. WHEN o usuário aplicar filtros de data THEN o sistema SHALL filtrar registros pelo campo "Data_Envio"
5. IF o usuário não tiver permissão THEN o sistema SHALL retornar erro 403 com mensagem apropriada

### Requisito 2: Geração de PDF de Promoções

**User Story:** Como usuário, eu quero gerar relatórios em PDF das promoções enviadas, para compartilhar e arquivar informações sobre campanhas promocionais.

#### Acceptance Criteria

1. WHEN o usuário clicar em "Gerar PDF" no modal de promoções THEN o sistema SHALL criar um PDF com os dados filtrados
2. WHEN o PDF for gerado THEN o sistema SHALL usar template similar aos outros relatórios
3. WHEN o PDF estiver pronto THEN o sistema SHALL abrir o arquivo em nova aba do navegador
4. WHEN houver erro na geração THEN o sistema SHALL mostrar mensagem de erro clara
5. IF não houver dados THEN o sistema SHALL desabilitar o botão de gerar PDF

### Requisito 3: Sistema de Configurações Criptografadas

**User Story:** Como usuário, eu quero salvar configurações de filtros para promoções de forma segura, para reutilizar combinações específicas de campos e filtros.

#### Acceptance Criteria

1. WHEN o usuário salvar uma configuração THEN o sistema SHALL criptografar os dados antes de armazenar
2. WHEN a configuração for salva THEN o sistema SHALL adicionar o sufixo "(Promoções)" ao nome
3. WHEN o usuário carregar configurações THEN o sistema SHALL descriptografar e aplicar os filtros
4. WHEN o sistema exibir configurações THEN o sistema SHALL mostrar apenas configurações com sufixo "(Promoções)"
5. WHEN o usuário excluir uma configuração THEN o sistema SHALL remover apenas configurações do tipo promoções

### Requisito 4: Integração com Sistema de Autenticação

**User Story:** Como sistema, eu preciso garantir que apenas usuários autenticados e autorizados possam acessar dados de promoções da sua empresa.

#### Acceptance Criteria

1. WHEN uma requisição for feita THEN o sistema SHALL validar a sessão do usuário
2. WHEN o usuário for validado THEN o sistema SHALL obter a empresa/rede do usuário
3. WHEN os dados forem buscados THEN o sistema SHALL filtrar apenas registros da empresa do usuário
4. WHEN houver erro de autenticação THEN o sistema SHALL retornar erro 401
5. IF o usuário não tiver permissão para promoções THEN o sistema SHALL retornar erro 403

### Requisito 5: Consistência com Outros Relatórios

**User Story:** Como desenvolvedor, eu quero que o sistema de promoções siga os mesmos padrões dos outros relatórios, para manter consistência na arquitetura e experiência do usuário.

#### Acceptance Criteria

1. WHEN implementar APIs THEN o sistema SHALL seguir o mesmo padrão de estrutura dos outros relatórios
2. WHEN gerar PDFs THEN o sistema SHALL usar o mesmo sistema de templates
3. WHEN gerenciar configurações THEN o sistema SHALL usar o mesmo sistema de criptografia
4. WHEN tratar erros THEN o sistema SHALL usar os mesmos padrões de error handling
5. WHEN fazer logs THEN o sistema SHALL seguir o mesmo padrão de logging dos outros serviços