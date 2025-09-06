# Requirements Document

## Introduction

O botão "Salvar" no card de "Relatório de Promoções" na página de relatórios não está funcionando porque o modal de salvamento de configurações não está sendo renderizado. O usuário clica no botão mas nada acontece, pois embora o estado `isPromotionsSaveModalOpen` seja definido como `true`, o componente `SaveConfigurationModal` correspondente não existe na renderização.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero que o botão "Salvar" no card de Relatório de Promoções abra o pop-up de nomeação de configuração, para que eu possa salvar minhas configurações de checkbox personalizadas.

#### Acceptance Criteria

1. WHEN o usuário clica no botão "Salvar" no card de Relatório de Promoções THEN o sistema SHALL abrir o modal de salvamento de configuração
2. WHEN o modal é aberto THEN o sistema SHALL permitir que o usuário digite um nome para a configuração
3. WHEN o usuário confirma o salvamento THEN o sistema SHALL salvar a configuração com os campos selecionados
4. WHEN o salvamento é bem-sucedido THEN o sistema SHALL fechar o modal e mostrar a configuração na lista de configurações salvas
5. IF o usuário não selecionou nenhum campo THEN o botão "Salvar" SHALL estar desabilitado
6. IF o usuário atingiu o limite máximo de configurações THEN o botão "Salvar" SHALL estar desabilitado

### Requirement 2

**User Story:** Como um desenvolvedor, eu quero que o modal de salvamento de promoções seja consistente com os outros modais de salvamento já implementados, para que a experiência do usuário seja uniforme em todo o sistema.

#### Acceptance Criteria

1. WHEN o modal de promoções é renderizado THEN o sistema SHALL usar o mesmo componente `SaveConfigurationModal` usado pelos outros relatórios
2. WHEN o modal é aberto THEN o sistema SHALL passar as mesmas props que os outros modais (isOpen, onClose, onSave, isNameDuplicate, isSaving)
3. WHEN o usuário interage com o modal THEN o sistema SHALL ter o mesmo comportamento dos outros modais de salvamento