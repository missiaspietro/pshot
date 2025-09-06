# Tests for Robots Store Access Control

Este diretório contém testes abrangentes para o sistema de controle de acesso baseado em loja na página de robôs.

## Estrutura dos Testes

### 1. `bot-service.test.ts` - Testes Unitários
Testa as funcionalidades do serviço de bots e utilitários de controle de acesso:

- **accessControlUtils**: Funções utilitárias para verificação de permissões
  - `isSuperAdmin()`: Verifica se usuário é Super Admin
  - `hasStoreAssigned()`: Verifica se usuário tem loja atribuída
  - `getUserAccessType()`: Determina o tipo de acesso do usuário
  - `canAccessRobots()`: Verifica se usuário pode acessar robôs
  - `getNoAccessMessage()`: Retorna mensagem apropriada para usuários sem acesso

- **botService**: Métodos do serviço de bots
  - `getBotsByUserAccess()`: Busca bots baseado no nível de acesso do usuário

### 2. `robots-page.test.tsx` - Testes de Integração
Testa a página de robôs com diferentes cenários de usuário:

- **Super Admin Access**: Verifica se Super Admins veem todos os robôs da empresa
- **Store User Access**: Verifica se usuários regulares veem apenas robôs da sua loja
- **No Access Scenarios**: Testa cenários onde usuários não têm acesso
- **Statistics Calculations**: Verifica se estatísticas refletem apenas robôs visíveis

### 3. `security.test.ts` - Testes de Segurança
Testa aspectos de segurança e isolamento de dados:

- **Data Isolation Between Stores**: Garante que usuários não vejam dados de outras lojas
- **Access Control Validation**: Valida regras de controle de acesso
- **Edge Cases and Security Boundaries**: Testa casos extremos e limites de segurança
- **Method Security**: Verifica segurança dos métodos de busca

## Executando os Testes

### Todos os testes
```bash
npm test
```

### Testes em modo watch
```bash
npm run test:watch
```

### Testes com cobertura
```bash
npm run test:coverage
```

### Apenas testes de segurança
```bash
npm run test:security
```

## Cenários de Teste Cobertos

### Usuários Super Admin
- ✅ Podem ver todos os robôs da empresa
- ✅ Não podem ver robôs de outras empresas
- ✅ Têm badge "Super Admin" na interface
- ✅ Veem descrição geral da empresa

### Usuários Regulares com Loja
- ✅ Veem apenas robôs da sua loja
- ✅ Não veem robôs de outras lojas da mesma empresa
- ✅ Veem descrição específica da loja
- ✅ Estatísticas refletem apenas seus robôs

### Usuários sem Loja
- ✅ Não têm acesso aos robôs
- ✅ Veem mensagem para configurar loja
- ✅ Estatísticas mostram zero

### Casos de Segurança
- ✅ Isolamento de dados entre lojas
- ✅ Isolamento de dados entre empresas
- ✅ Validação de parâmetros maliciosos
- ✅ Tratamento de valores null/undefined
- ✅ Filtros aplicados no backend e frontend

## Cobertura de Requisitos

Os testes cobrem todos os requisitos da especificação:

- **Requirement 1**: Usuários não Super Admin veem apenas robôs da sua loja
- **Requirement 2**: Super Admins veem todos os robôs da empresa
- **Requirement 3**: Implementação segura com filtros no backend
- **Requirement 4**: Estatísticas refletem apenas robôs visíveis

## Configuração

### Dependências de Teste
- Jest: Framework de testes
- React Testing Library: Testes de componentes React
- Jest DOM: Matchers adicionais para DOM

### Mocks
- Supabase Client: Mockado para simular diferentes cenários de dados
- Auth Context: Mockado para simular diferentes tipos de usuário
- Fetch API: Mockado para simular respostas da API

### Arquivos de Configuração
- `jest.config.js`: Configuração principal do Jest
- `jest.setup.js`: Setup global para testes
- `package.json`: Scripts de teste

## Executando Testes Específicos

### Testar apenas controle de acesso
```bash
npm test -- --testNamePattern="Access Control"
```

### Testar apenas segurança
```bash
npm test -- --testPathPattern="security"
```

### Testar com verbose output
```bash
npm test -- --verbose
```

## Adicionando Novos Testes

Ao adicionar novos testes, siga estas diretrizes:

1. **Testes Unitários**: Adicione em `bot-service.test.ts` para lógica de negócio
2. **Testes de Integração**: Adicione em `robots-page.test.tsx` para comportamento da UI
3. **Testes de Segurança**: Adicione em `security.test.ts` para validações de segurança

### Exemplo de Novo Teste
```typescript
it('should handle new scenario', async () => {
  // Arrange
  const user = { /* user data */ }
  
  // Act
  const result = await botService.getBotsByUserAccess(user)
  
  // Assert
  expect(result).toEqual(expectedResult)
})
```