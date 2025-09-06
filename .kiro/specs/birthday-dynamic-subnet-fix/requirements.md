# Requirements Document

## Introduction

O sistema de aniversários atualmente exibe um valor fixo "bababibi" no campo Sub-rede na interface do usuário, mas as mensagens de aniversário são filtradas corretamente pela sub-rede do usuário logado. Este problema cria inconsistência visual e confunde os usuários, pois o valor exibido não corresponde à realidade dos dados sendo filtrados.

## Requirements

### Requirement 1

**User Story:** Como um usuário logado no sistema, eu quero ver a minha sub-rede real exibida no campo "Sub-rede" da página de aniversários, para que eu tenha clareza sobre qual sub-rede está sendo usada para filtrar as mensagens.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de aniversários THEN o sistema SHALL exibir a sub-rede real do usuário logado no campo "Sub-rede"
2. WHEN o usuário não possui sub-rede definida THEN o sistema SHALL exibir a empresa do usuário como fallback
3. WHEN o usuário não está logado THEN o sistema SHALL exibir "Não definida" ou ocultar o campo

### Requirement 2

**User Story:** Como um desenvolvedor, eu quero remover todos os valores hardcoded relacionados à sub-rede "bababibi", para que o sistema seja completamente dinâmico e baseado nos dados reais do usuário.

#### Acceptance Criteria

1. WHEN o código é analisado THEN não SHALL existir nenhuma referência hardcoded ao valor "bababibi"
2. WHEN as mensagens são filtradas THEN o sistema SHALL usar exclusivamente a sub-rede do usuário logado
3. WHEN a interface é renderizada THEN todos os campos de sub-rede SHALL exibir valores dinâmicos

### Requirement 3

**User Story:** Como um usuário, eu quero que o sistema mantenha a consistência entre o valor exibido na interface e os dados realmente utilizados para filtrar as mensagens, para que eu tenha confiança na precisão das informações apresentadas.

#### Acceptance Criteria

1. WHEN a página de aniversários é carregada THEN o valor exibido no campo "Sub-rede" SHALL corresponder exatamente ao valor usado para filtrar as mensagens
2. WHEN o usuário muda de sessão THEN o campo "Sub-rede" SHALL ser atualizado automaticamente
3. WHEN há erro ao carregar dados do usuário THEN o sistema SHALL exibir uma mensagem de erro apropriada