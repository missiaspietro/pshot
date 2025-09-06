# Requirements Document

## Introduction

O sistema de promoções está apresentando um problema onde o campo "rede" está sendo preenchido incorretamente com o valor da "sub_rede" do usuário. Isso causa inconsistências na filtragem e criação de promoções, pois o sistema deveria usar o campo "rede" real do usuário, não a "sub_rede".

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero que as promoções sejam filtradas e criadas usando o campo "rede" correto, para que eu veja apenas as promoções da minha rede real.

#### Acceptance Criteria

1. WHEN um usuário acessa a tela de promoções THEN o sistema SHALL filtrar as promoções usando o campo "rede" do usuário, não "sub_rede"
2. WHEN um usuário cria uma nova promoção THEN o sistema SHALL salvar a promoção com o campo "Rede" preenchido com o valor correto da rede do usuário
3. WHEN o sistema carrega as lojas disponíveis THEN o sistema SHALL filtrar as lojas usando o campo "rede" correto do usuário

### Requirement 2

**User Story:** Como um desenvolvedor, eu quero que a lógica de mapeamento de campos seja consistente em todo o sistema, para que não haja confusão entre "rede" e "sub_rede".

#### Acceptance Criteria

1. WHEN o sistema determina a rede do usuário THEN o sistema SHALL usar a seguinte prioridade: rede > empresa > sub_rede
2. WHEN o sistema salva uma promoção THEN o campo "Rede" SHALL ser preenchido com o valor do campo "rede" do usuário
3. WHEN o sistema filtra dados THEN o sistema SHALL usar consistentemente o campo "rede" para filtros de rede

### Requirement 3

**User Story:** Como um usuário, eu quero que o campo "Sub_Rede" seja usado apenas para informações complementares, não como filtro principal de rede.

#### Acceptance Criteria

1. WHEN uma promoção é criada THEN o campo "Sub_Rede" SHALL ser preenchido com o valor da "sub_rede" do usuário (se existir)
2. WHEN o sistema filtra promoções THEN o filtro principal SHALL ser pelo campo "Rede", não "Sub_Rede"
3. IF o usuário não possui campo "rede" definido THEN o sistema SHALL usar "empresa" como fallback, não "sub_rede"