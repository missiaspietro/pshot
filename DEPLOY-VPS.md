# Deploy na VPS - Praiseshot

## Pré-requisitos

1. **Docker e Docker Compose** instalados na VPS
2. **Traefik** configurado e rodando (para SSL e proxy reverso)
3. **Rede network_public** criada no Docker
4. **DNS** apontando `pshot.praisechat.com.br` para o IP da VPS

## Comandos para Deploy

### 1. Conectar na VPS
```bash
ssh usuario@seu-servidor.com
```

### 2. Criar diretório do projeto
```bash
mkdir -p /opt/pshot
cd /opt/pshot
```

### 3. Fazer upload dos arquivos
Copie os seguintes arquivos para `/opt/pshot/`:
- `docker-compose.yml`
- `deploy.sh`

### 4. Dar permissão ao script
```bash
chmod +x deploy.sh
```

### 5. Executar o deploy
```bash
./deploy.sh
```

## Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose logs -f pshot-app
```

### Reiniciar aplicação
```bash
docker-compose restart pshot-app
```

### Parar aplicação
```bash
docker-compose down
```

### Atualizar aplicação
```bash
docker pull praisetecnologia/pshot:latest
docker-compose up -d
```

### Verificar status
```bash
docker-compose ps
```

## Troubleshooting

### Se der erro 404:
1. Verificar se o container está rodando: `docker-compose ps`
2. Verificar logs: `docker-compose logs pshot-app`
3. Verificar se o Traefik está funcionando
4. Verificar se o DNS está apontando corretamente

### Se der erro de conexão com Supabase:
1. Verificar as variáveis de ambiente no `docker-compose.yml`
2. Testar conectividade: `docker-compose exec pshot-app ping studio.praisesistemas.uk`

### Para debug:
```bash
# Entrar no container
docker-compose exec pshot-app sh

# Ver variáveis de ambiente
docker-compose exec pshot-app env
```

## Estrutura de Arquivos na VPS

```
/opt/pshot/
├── docker-compose.yml
├── deploy.sh
└── DEPLOY-VPS.md
```

## Variáveis de Ambiente

As seguintes variáveis estão configuradas no `docker-compose.yml`:

- `NODE_ENV=production`
- `NEXTAUTH_URL=https://pshot.praisechat.com.br`
- `NEXTAUTH_SECRET=fcvxe9oxp6ppcpn3c4dyi8inf0bjs91xmfd00tpp`
- `NEXT_PUBLIC_SUPABASE_URL=https://studio.praisesistemas.uk`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `NEXT_PUBLIC_WEBHOOK_URL=https://pshot.praisechat.com.br/api/webhook`
- `ENCRYPTION_SECRET=fcvxe9oxp6ppcpn3c4dyi8inf0bjs91xmfd00tpp`