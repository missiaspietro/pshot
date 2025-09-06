# PraiseShot

Sistema de gestão empresarial desenvolvido em Next.js com integração ao Supabase.

## 📋 Funcionalidades

- **Sistema de Autenticação**: Login seguro com diferentes níveis de usuário (Super Admin, Administrador, Padrão)
- **Gestão de Usuários**: Criação e gerenciamento de usuários com controle de permissões
- **Relatórios**: 
  - Aniversários com exportação para Excel e PDF
  - Promoções com filtros avançados
  - Cashback detalhado
  - Pesquisas/Surveys personalizáveis
- **Dashboard**: Visualização de dados em tempo real com gráficos
- **Sistema de Permissões**: Controle granular de acesso por funcionalidade
- **Multi-empresa**: Suporte a múltiplas empresas e lojas

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide React
- **Backend**: Next.js API Routes
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Formulários**: React Hook Form + Zod
- **Exportação**: XLSX, PDFKit, Puppeteer
- **Gráficos**: Recharts

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/moisesmissias/wjs5praiseshot.git
cd wjs5praiseshot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

5. Acesse http://localhost:3000

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
praiseshot/
├── app/                    # App Router (Next.js 13+)
│   ├── (dashboard)/       # Grupo de rotas do dashboard
│   ├── (protected)/       # Rotas protegidas
│   ├── api/               # API Routes
│   └── birthday/          # Páginas de aniversários
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI reutilizáveis
│   └── charts/           # Componentes de gráficos
├── contexts/             # Contextos React
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
├── services/             # Serviços de API
└── styles/               # Estilos globais
```

## 🔐 Níveis de Usuário

- **Super Admin**: Acesso total ao sistema, pode gerenciar usuários e ver dados de todas as lojas
- **Administrador**: Pode gerenciar usuários padrão da sua loja
- **Padrão**: Acesso limitado às funcionalidades básicas da sua loja

## 🛠️ Configuração do Banco de Dados

O projeto utiliza Supabase como banco de dados. As principais tabelas incluem:

- `users`: Usuários do sistema
- `bots`: Configurações de lojas/bots
- `surveys`: Pesquisas criadas
- `Relatorio Envio de Promoções`: Dados de promoções
- `Relatorio Cashback`: Dados de cashback
- `aniversarios`: Dados de aniversários

## 📝 Scripts Disponíveis

- `npm run dev`: Executa em modo desenvolvimento
- `npm run build`: Gera build de produção
- `npm run start`: Executa build de produção
- `npm run lint`: Executa linting do código

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da Praise Sistemas.

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.