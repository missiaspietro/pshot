# Requirements Document

## Introduction

Esta spec visa melhorar a funcionalidade de geração de PDF para o relatório de pesquisas de satisfação. Atualmente, o sistema já possui a capacidade de gerar PDFs, mas há oportunidades de melhoria na experiência do usuário, qualidade do PDF e robustez do sistema.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema de relatórios, eu quero que o PDF de pesquisas seja gerado com todas as informações exibidas no modal, para que eu tenha um documento completo e bem formatado.

#### Acceptance Criteria

1. WHEN o usuário clica em "Gerar PDF" no modal de pesquisas THEN o sistema SHALL gerar um PDF contendo exatamente os mesmos dados exibidos na tabela do modal
2. WHEN o PDF é gerado THEN ele SHALL incluir cabeçalho com informações do relatório (empresa, período, campos selecionados)
3. WHEN o PDF contém dados THEN os valores SHALL ser formatados corretamente (datas em pt-BR, respostas convertidas para texto legível)
4. WHEN o PDF é gerado THEN ele SHALL ser aberto automaticamente em nova aba do navegador

### Requirement 2

**User Story:** Como um usuário, eu quero que o PDF tenha uma formatação profissional e legível, para que possa ser usado em apresentações e relatórios oficiais.

#### Acceptance Criteria

1. WHEN o PDF é gerado THEN ele SHALL ter layout responsivo que se adapta ao número de colunas selecionadas
2. WHEN há muitas colunas THEN o PDF SHALL ajustar automaticamente o tamanho da fonte e largura das colunas
3. WHEN os dados excedem uma página THEN o sistema SHALL criar páginas adicionais com cabeçalhos repetidos
4. WHEN há texto longo nas células THEN ele SHALL ser truncado com reticências para manter o layout
5. WHEN o PDF é gerado THEN ele SHALL incluir rodapé com número da página e data/hora de geração

### Requirement 3

**User Story:** Como um usuário, eu quero que o sistema trate erros de geração de PDF de forma elegante, para que eu seja informado claramente sobre problemas e possa tentar novamente.

#### Acceptance Criteria

1. WHEN ocorre erro na geração do PDF THEN o sistema SHALL exibir mensagem de erro específica e clara
2. WHEN o Puppeteer falha THEN o sistema SHALL oferecer fallback para HTML visualizável
3. WHEN há timeout na geração THEN o usuário SHALL ser informado e ter opção de tentar novamente
4. WHEN não há dados para gerar PDF THEN o sistema SHALL informar que não há dados suficientes
5. WHEN há erro de rede THEN o sistema SHALL distinguir entre erro de rede e erro de servidor

### Requirement 4

**User Story:** Como um usuário, eu quero feedback visual durante a geração do PDF, para que eu saiba que o processo está em andamento e não clique múltiplas vezes.

#### Acceptance Criteria

1. WHEN o usuário clica em "Gerar PDF" THEN o botão SHALL mostrar estado de loading com spinner
2. WHEN o PDF está sendo gerado THEN o botão SHALL ficar desabilitado para evitar múltiplos cliques
3. WHEN o processo termina THEN o botão SHALL voltar ao estado normal
4. WHEN há progresso na geração THEN o usuário SHALL ver indicação visual do progresso
5. WHEN o PDF é gerado com sucesso THEN o modal SHALL ser fechado automaticamente

### Requirement 5

**User Story:** Como um administrador do sistema, eu quero que a geração de PDF seja otimizada para performance, para que não sobrecarregue o servidor com múltiplas requisições simultâneas.

#### Acceptance Criteria

1. WHEN múltiplos usuários geram PDFs THEN o sistema SHALL gerenciar a fila de processamento
2. WHEN há dados grandes THEN o sistema SHALL otimizar a query e processamento
3. WHEN o PDF é gerado THEN o sistema SHALL limpar recursos temporários automaticamente
4. WHEN há cache disponível THEN o sistema SHALL reutilizar dados já processados quando apropriado
5. WHEN há limite de recursos THEN o sistema SHALL informar o usuário sobre tempo de espera estimado

### Requirement 6

**User Story:** Como um usuário, eu quero que o nome do arquivo PDF seja descritivo e único, para que eu possa organizar facilmente meus relatórios baixados.

#### Acceptance Criteria

1. WHEN o PDF é gerado THEN o nome do arquivo SHALL incluir "relatorio-pesquisas" como prefixo
2. WHEN o PDF é gerado THEN o nome SHALL incluir a data de geração no formato YYYY-MM-DD
3. WHEN há filtros aplicados THEN o nome SHALL incluir informação sobre os filtros
4. WHEN há período específico THEN o nome SHALL incluir as datas do período
5. WHEN o arquivo é baixado THEN ele SHALL ter extensão .pdf correta