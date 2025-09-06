# Implementation Plan - Sistema Completo de Promoções

## Tarefas do Prompt Original

**IMPORTANTE:** Fazer uma tarefa de cada vez, não misturar implementações.

### ✅ TAREFA 1: Modal com Dados Reais (JÁ IMPLEMENTADO)
- [x] Modal puxa dados da tabela "Relatorio Envio de Promoções"
- [x] Filtra pela empresa do usuário logado (campo "Rede")
- [x] Mostra apenas campos marcados nos checkboxes
- [x] Implementado tratamento de erros e loading

### TAREFA 2: Sistema de Configurações para Promoções

- [ ] 2.1. **CORRIGIR BOTÃO SALVAR CONFIGURAÇÃO (CRÍTICO)**
  - Localizar botão "Salvar Configuração" no card de promoções
  - Substituir `{/* TODO: Implementar quando necessário */ }` por função real
  - Adicionar estado `isPromotionsSaveModalOpen` se não existir
  - Conectar botão ao modal de salvamento
  - Testar se modal abre ao clicar no botão

- [ ] 2.2. Implementar hook e estados para configurações de promoções
  - Adicionar hook `useFilterConfigurations` para promoções
  - Criar filtro para configurações com sufixo "(Promoções)"
  - Implementar estados para expansão da lista de configurações
  - Adicionar logs de debug para análise de configurações

- [ ] 2.3. Implementar funções de manipulação de configurações
  - Criar função `handleSavePromotionsConfiguration` com sufixo "(Promoções)"
  - Implementar função `handleLoadPromotionsConfiguration` com validação
  - Adicionar função `handleDeletePromotionsConfiguration` com segurança
  - Validar campos específicos para promoções

- [ ] 2.4. Integrar modal de salvamento
  - Adicionar componente `SaveConfigurationModal` para promoções
  - Configurar props específicas para tipo "promoções"
  - Implementar validação de nome duplicado
  - Testar fluxo completo de salvamento

- [ ] 2.5. Integrar lista de configurações salvas
  - Adicionar componente `SavedConfigurationsList` para promoções
  - Implementar seção expansível para configurações
  - Configurar botões de carregar e excluir
  - Testar carregamento e aplicação de configurações

### ✅ TAREFA 3: Correção do Filtro de Configurações de Aniversários (CONCLUÍDA)

- [x] 3.1. Corrigir filtro de configurações de aniversários
  - Localizar filtro atual que está incorreto
  - Substituir lógica para usar apenas `config.name.includes('(Aniversários)')`
  - Remover lógica incorreta que inclui configurações de outros tipos
  - Testar se apenas configurações de aniversários aparecem

- [x] 3.2. Adicionar validação na função de carregamento
  - Implementar verificação rigorosa do sufixo "(Aniversários)"
  - Adicionar log de warning para configurações incompatíveis
  - Implementar retorno antecipado para tipos incorretos
  - Testar carregamento apenas de configurações válidas

- [x] 3.3. Verificar função de exclusão
  - Garantir que exclusão só opera em configurações de aniversários
  - Adicionar validação de tipo antes de executar exclusão
  - Implementar proteção contra exclusão de outros tipos
  - Testar exclusão apenas de configurações corretas

### TAREFA 4: Rota PDF para Promoções

- [ ] 4.1. Criar serviço de PDF para promoções
  - Criar arquivo `lib/promotions-pdf-service.ts`
  - Implementar classe `PromotionsPdfService`
  - Adicionar detecção automática de layout (portrait/landscape)
  - Implementar formatação específica para dados de promoções

- [ ] 4.2. Implementar template HTML com tema amarelo
  - Criar template HTML com cor primária #f59e0b
  - Implementar CSS responsivo baseado no número de campos
  - Adicionar cabeçalho e rodapé com informações do relatório
  - Configurar formatação para dados de promoções

- [ ] 4.3. Criar rota PDF principal
  - Criar arquivo `app/api/reports/promotions/pdf/route.ts`
  - Implementar método POST com validação de entrada
  - Adicionar autenticação via cookie `ps_session`
  - Integrar com serviço de PDF de promoções

- [ ] 4.4. Implementar autenticação e autorização
  - Validar cookie de sessão do usuário
  - Buscar dados do usuário na tabela `users`
  - Verificar acesso aos dados da empresa
  - Filtrar dados apenas da empresa do usuário

- [ ] 4.5. Adicionar geração de PDF com Puppeteer
  - Configurar Puppeteer com opções otimizadas
  - Implementar detecção automática de orientação
  - Adicionar timeout de 30 segundos
  - Implementar fallback HTML quando Puppeteer falhar

- [ ] 4.6. Testar rota PDF completa
  - Testar geração de PDF com dados reais
  - Verificar se tema amarelo está aplicado
  - Testar orientação automática (portrait/landscape)
  - Validar fallback HTML em caso de erro

## Ordem de Execução

1. **COMEÇAR COM TAREFA 2.1** - Corrigir botão salvar (crítico)
2. **CONTINUAR COM TAREFA 3.1** - Corrigir filtro de aniversários
3. **IMPLEMENTAR TAREFA 4** - Rota PDF completa
4. **FINALIZAR TAREFA 2** - Sistema completo de configurações

## Critérios de Aceitação

### Para Cada Tarefa:
- [ ] Implementação completa sem quebrar funcionalidades existentes
- [ ] Testes com dados reais do ambiente
- [ ] Logs de debug para troubleshooting
- [ ] Validação de segurança implementada

### Para o Sistema Completo:
- [ ] Botão "Salvar Configuração" funciona no card de promoções
- [ ] Configurações são salvas criptografadas com sufixo "(Promoções)"
- [ ] Card de aniversários mostra apenas suas próprias configurações
- [ ] Rota PDF gera relatórios com tema amarelo e layout responsivo
- [ ] Todos os sistemas funcionam sem interferir uns nos outros

## Notas Importantes

1. **UMA TAREFA POR VEZ**: Não misturar implementações
2. **TESTAR IMEDIATAMENTE**: Validar cada tarefa antes de prosseguir
3. **MANTER COMPATIBILIDADE**: Não quebrar funcionalidades existentes
4. **SEGUIR PADRÕES**: Usar mesma estrutura dos outros cards
5. **DOCUMENTAR MUDANÇAS**: Registrar alterações para referência