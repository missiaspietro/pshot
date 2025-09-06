# Implementation Plan

- [x] 1. Criar função de normalização de texto


  - Implementar função para corrigir caracteres com acentos corrompidos
  - Adicionar mapeamento de caracteres problemáticos comuns
  - Testar com nomes que contêm acentos
  - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [ ] 2. Aplicar normalização no modal de aniversários
  - Integrar função de normalização no formatCellValue
  - Testar exibição de nomes com acentos


  - Verificar que caracteres especiais aparecem corretamente
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 3. Aplicar normalização no modal de cashback


  - Integrar função de normalização no formatCellValue
  - Testar exibição de nomes com acentos
  - Garantir consistência com modal de aniversários
  - _Requirements: 1.2, 1.3, 1.4_



- [ ] 4. Estilizar cabeçalhos do modal de aniversários
  - Adicionar classe text-gray-600 aos TableHead components
  - Verificar contraste e legibilidade



  - Testar em diferentes temas/backgrounds
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 5. Estilizar cabeçalhos do modal de cashback
  - Adicionar classe text-gray-600 aos TableHead components
  - Garantir consistência com modal de aniversários
  - Verificar contraste e legibilidade
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 6. Testar correções em ambos os modais
  - Verificar nomes com acentos aparecem corretamente
  - Confirmar cabeçalhos têm cor cinza
  - Testar consistência visual entre modais
  - Validar que não há regressões
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_