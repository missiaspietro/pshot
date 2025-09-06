# Deploy do PraiseShot

Este documento contém as instruções para fazer o deploy do sistema PraiseShot usando Docker e Portainer.

## Pré-requisitos

- Docker instalado
- Acesso ao registry Docker (praisetecnologia)
- Portainer configurado com Traefik
- Rede `network_public` criada no Docker Swarm

## Variáveis de Ambiente

⚠️ **IMPORTANTE**: Nunca use valores hardcoded em produção. Sempre use variáveis de ambiente.

### Configuração Segura

1. **Copie o arquivo de exemplo**:
   ```bash
   cp .env.docker .env
   ```

2. **Configure as variáveis obrigatórias**:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_SUPABASE_URL` - URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase
   - `NEXT_PUBLIC_WEBHOOK_URL` - URL do webhook
   - `NEXTAUTH_URL` - URL da aplicação
   - `NEXTAUTH_SECRET` - Chave secreta forte para autenticação
   - `ENCRYPTION_SECRET` - Chave forte para criptografia

### Boas Práticas de Segurança

- Use chaves secretas com pelo menos 32 caracteres
- Nunca commite arquivos `.env` no Git
- Rotacione chaves regularmente
- Use diferentes chaves para cada ambiente (dev/staging/prod)

## Build da Imagem

### No Windows (PowerShell)
```powershell
.\build-docker.ps1
```

### No Linux/Mac
```bash
./build-docker.sh
```

### Manual
```bash
# Build da imagem
docker build -t praisetecnologia/praiseshot:latest .

# Push para o registry
docker push praisetecnologia/praiseshot:latest
```

## Deploy no Portainer

1. **Acesse o Portainer**
2. **Vá para Stacks**
3. **Clique em "Add Stack"**
4. **Cole o conteúdo do `docker-compose.yml`**
5. **Configure as variáveis de ambiente se necessário**
6. **Clique em "Deploy the stack"**

## Configuração do Traefik

O sistema está configurado para usar:
- **URL**: https://pshot.praisechat.com.br
- **Porta**: 3000
- **SSL**: Automático via Let's Encrypt
- **Headers de Segurança**: Configurados
- **Compressão**: Habilitada

## Verificação do Deploy

Após o deploy, verifique:

1. **Status do Container**
   ```bash
   docker service ls
   docker service logs praiseshot_praiseshot
   ```

2. **Acesso à Aplicação**
   - Acesse: https://pshot.praisechat.com.br
   - Verifique se o login está funcionando
   - Teste as principais funcionalidades

3. **Logs da Aplicação**
   ```bash
   docker service logs -f praiseshot_praiseshot
   ```

## Troubleshooting

### Problemas Comuns

1. **Erro 500 - Variáveis de ambiente**
   - Verifique se todas as variáveis estão configuradas
   - Confirme se as chaves do Supabase estão corretas

2. **Erro de conexão com Supabase**
   - Verifique a URL do Supabase
   - Confirme se as chaves têm as permissões corretas

3. **Problemas de SSL/Traefik**
   - Verifique se o domínio está apontando para o servidor
   - Confirme se o Traefik está funcionando

### Comandos Úteis

```bash
# Ver logs do serviço
docker service logs praiseshot_praiseshot

# Escalar o serviço
docker service scale praiseshot_praiseshot=2

# Atualizar o serviço
docker service update --image praisetecnologia/praiseshot:latest praiseshot_praiseshot

# Remover o stack
docker stack rm praiseshot
```

## Atualizações

Para atualizar o sistema:

1. Faça o build da nova versão
2. Faça o push para o registry
3. No Portainer, vá para o stack e clique em "Update the stack"
4. Ou use o comando: `docker service update --image praisetecnologia/praiseshot:latest praiseshot_praiseshot`

## Monitoramento

- **Logs**: Disponíveis via Portainer ou Docker CLI
- **Métricas**: Configuradas via labels do Traefik
- **Health Check**: Automático via Docker Swarm

## Backup

Certifique-se de fazer backup regular:
- Dados do Supabase
- Configurações do sistema
- Logs importantes