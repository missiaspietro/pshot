# Implementation Plan

- [ ] 1. Corrigir autenticação e carregamento de lojas


  - Substituir busca no localStorage pelo contexto de autenticação
  - Implementar tratamento de erro adequado para usuário não encontrado
  - Adicionar logs informativos ao invés de logs de erro
  - Testar carregamento de lojas com dados do contexto de autenticação
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Implementar controle condicional do aviso de seleção de loja
  - Adicionar estado `showStoreError` para controlar exibição do aviso
  - Modificar lógica para mostrar aviso apenas após tentativa de criação sem loja selecionada
  - Implementar função de validação que define quando mostrar o aviso
  - Fazer o aviso desaparecer imediatamente quando loja for selecionada
  - Resetar estado do aviso após criação bem-sucedida de promoção
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Implementar textarea de descrição com altura fixa e scroll
  - Adicionar classes CSS para altura fixa e desabilitar redimensionamento
  - Configurar overflow-y: auto para scroll vertical automático
  - Definir altura fixa de 120px para a textarea
  - Testar comportamento com textos de diferentes tamanhos
  - Verificar se scroll aparece apenas quando necessário
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Implementar tratamento de erros melhorado
  - Adicionar função para tratar erro de autenticação sem logs de erro
  - Implementar mensagens de erro user-friendly
  - Adicionar fallback para quando usuário não possui Rede definida
  - Testar todos os cenários de erro possíveis
  - _Requirements: 1.3, 1.4_

- [ ] 5. Testes e validação das correções
  - Testar carregamento da página sem erros no console
  - Validar comportamento do aviso de seleção de loja
  - Verificar funcionamento da textarea com textos longos
  - Testar fluxo completo de criação de promoção
  - Confirmar que todos os problemas foram resolvidos
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_