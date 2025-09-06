# Requisitos - Implementação Completa do Sistema de Promoções

## Introdução

Este documento define os requisitos para implementar completamente o sistema de promoções baseado no prompt original, incluindo modal com dados reais, sistema de configurações criptografadas, correção do filtro de aniversários e criação da rota PDF.

**TAREFAS DO PROMPT ORIGINAL:**
1. Modal de promoções puxar dados reais baseado nos checkboxes, filtrado por empresa
2. Sistema de configurações salvas criptografadas na coluna `config_filtros_relatorios` com sufixo "(Promoções)"
3. Correção do filtro de configurações de aniversários (está puxando configurações de pesquisas)
4. Criação da rota PDF para promoções

## Requisitos

### Requisito 1 - Modal de Promoções com Dados Reais (JÁ IMPLEMENTADO)

**User Story:** Como usuário do sistema, quero que o modal de promoções mostre dados reais baseados nos campos selecionados e filtrados pela minha empresa.

#### Critérios de Aceitação
1. ✅ QUANDO o usuário abrir o modal ENTÃO DEVE buscar dados da tabela "Relatorio Envio de Promoções"
2. ✅ QUANDO os dados forem buscados ENTÃO DEVE filtrar pela empresa do usuário logado (campo "Rede")
3. ✅ QUANDO os campos forem selecionados ENTÃO DEVE mostrar apenas os campos marcados nos checkboxes
4. ✅ QUANDO não houver dados ENTÃO DEVE mostrar mensagem "Nenhum dado encontrado"
5. ✅ QUANDO houver erro ENTÃO DEVE mostrar mensagem de erro com opção de retry

### Requisito 2 - Sistema de Configurações para Promoções

**User Story:** Como usuário do sistema, quero salvar configurações de campos para promoções, para reutilizar filtros frequentemente usados.

#### Critérios de Aceitação
1. QUANDO o usuário clicar em "Salvar Configuração" ENTÃO DEVE abrir modal de salvamento
2. QUANDO a configuração for salva ENTÃO DEVE adicionar sufixo "(Promoções)" automaticamente
3. QUANDO a configuração for salva ENTÃO DEVE ser criptografada na coluna `config_filtros_relatorios`
4. QUANDO configurações forem listadas ENTÃO DEVE mostrar apenas configurações com "(Promoções)"
5. QUANDO configurações forem carregadas ENTÃO DEVE aplicar campos selecionados

### Requisito 3 - Correção do Filtro de Configurações de Aniversários

**User Story:** Como usuário do sistema, quero que o card de aniversários mostre apenas suas próprias configurações, não configurações de outros tipos de relatório.

#### Critérios de Aceitação
1. QUANDO o card de aniversários carregar configurações ENTÃO DEVE mostrar apenas configurações com "(Aniversários)"
2. QUANDO configurações forem filtradas ENTÃO NÃO DEVE mostrar configurações de pesquisas
3. QUANDO configurações forem carregadas ENTÃO DEVE validar se são do tipo correto
4. QUANDO configurações forem excluídas ENTÃO DEVE confirmar que são do tipo aniversários
5. QUANDO houver erro de tipo ENTÃO DEVE mostrar log de warning

### Requisito 4 - Rota PDF para Promoções

**User Story:** Como usuário do sistema, quero gerar relatórios de promoções em PDF, para visualizar e compartilhar dados de forma profissional.

#### Critérios de Aceitação
1. QUANDO o usuário clicar em "Gerar PDF" ENTÃO DEVE chamar rota `/api/reports/promotions/pdf`
2. QUANDO a rota receber dados ENTÃO DEVE validar autenticação e campos selecionados
3. QUANDO o PDF for gerado ENTÃO DEVE usar tema amarelo (#f59e0b) para combinar com o card
4. QUANDO houver muitos campos ENTÃO DEVE usar orientação paisagem automaticamente
5. QUANDO o Puppeteer falhar ENTÃO DEVE retornar HTML como fallback