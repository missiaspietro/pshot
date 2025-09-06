# Requirements Document

## Introduction

Este documento define os requisitos para corrigir problemas de codificação de caracteres e estilização nos modais de preview de relatórios de aniversários e cashback.

## Requirements

### Requirement 1

**User Story:** Como usuário visualizando dados nos modais de preview, eu quero que nomes com acentos sejam exibidos corretamente, para que eu possa ler as informações sem caracteres corrompidos.

#### Acceptance Criteria

1. WHEN o modal de aniversários exibe dados THEN nomes com acentos como "LUZIA PLÁCIDO DA SILVA" devem aparecer corretamente
2. WHEN o modal de cashback exibe dados THEN nomes com acentos devem aparecer sem caracteres corrompidos (�)
3. WHEN dados são buscados da API THEN a codificação UTF-8 deve ser preservada em toda a cadeia de processamento
4. WHEN dados são exibidos na tabela THEN caracteres especiais portugueses (ã, ç, á, é, í, ó, ú) devem aparecer corretamente

### Requirement 2

**User Story:** Como usuário visualizando os modais de preview, eu quero que os cabeçalhos das colunas tenham cor cinza, para que tenham uma aparência mais sutil e profissional.

#### Acceptance Criteria

1. WHEN o modal de aniversários é aberto THEN os cabeçalhos das colunas (Data de Criação, Cliente, WhatsApp, etc.) devem ter cor cinza
2. WHEN o modal de cashback é aberto THEN os cabeçalhos das colunas devem ter cor cinza
3. WHEN os cabeçalhos são exibidos THEN devem manter boa legibilidade com contraste adequado
4. WHEN o usuário visualiza ambos os modais THEN o estilo dos cabeçalhos deve ser consistente entre eles