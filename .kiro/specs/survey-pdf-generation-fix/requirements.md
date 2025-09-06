# Requirements Document

## Introduction

O sistema possui um modal de preview para relatórios de pesquisas que permite visualizar os dados e gerar um PDF. Atualmente, a funcionalidade "Gerar PDF" não está funcionando corretamente quando o usuário clica no botão dentro do modal. O objetivo é corrigir essa funcionalidade para que o PDF seja gerado com todas as informações que estão sendo exibidas no modal.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero clicar no botão "Gerar PDF" no modal de relatório de pesquisas e ter um PDF gerado com todas as informações que estão sendo exibidas no modal, para que eu possa salvar ou imprimir o relatório.

#### Acceptance Criteria

1. WHEN o usuário abre o modal de relatório de pesquisas THEN o modal deve exibir os dados corretamente
2. WHEN o usuário clica no botão "Gerar PDF" THEN o sistema deve processar a requisição sem erros
3. WHEN a geração do PDF é bem-sucedida THEN o PDF deve ser aberto em uma nova aba do navegador
4. WHEN o PDF é gerado THEN ele deve conter todas as informações que estão sendo exibidas no modal
5. WHEN o PDF é gerado THEN ele deve incluir os campos selecionados pelo usuário
6. WHEN o PDF é gerado THEN ele deve incluir o período de datas selecionado
7. WHEN o PDF é gerado THEN ele deve incluir o total de registros encontrados

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero que o botão "Gerar PDF" mostre feedback visual durante o processamento, para que eu saiba que a ação está sendo executada.

#### Acceptance Criteria

1. WHEN o usuário clica no botão "Gerar PDF" THEN o botão deve mostrar um indicador de carregamento
2. WHEN o PDF está sendo gerado THEN o botão deve ficar desabilitado para evitar múltiplos cliques
3. WHEN o PDF está sendo gerado THEN o texto do botão deve mudar para "Gerando PDF..."
4. WHEN a geração do PDF é concluída THEN o botão deve voltar ao estado normal

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero receber mensagens de erro claras se a geração do PDF falhar, para que eu possa entender o que aconteceu e tentar novamente se necessário.

#### Acceptance Criteria

1. WHEN ocorre um erro na geração do PDF THEN o sistema deve exibir uma mensagem de erro clara
2. WHEN ocorre um erro de rede THEN o sistema deve informar sobre problemas de conectividade
3. WHEN ocorre um erro no servidor THEN o sistema deve informar sobre problemas técnicos
4. WHEN ocorre um erro THEN o usuário deve poder tentar gerar o PDF novamente