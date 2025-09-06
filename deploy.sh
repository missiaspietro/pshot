#!/bin/bash

# Script de deploy para VPS
echo "🚀 Iniciando deploy do Praiseshot..."

# Parar e remover container existente se houver
echo "📦 Parando containers existentes..."
docker-compose down

# Fazer pull da imagem mais recente
echo "⬇️ Baixando imagem mais recente..."
docker pull praisetecnologia/praise-shot:latest

# Subir o serviço
echo "🔄 Iniciando serviços..."
docker-compose up -d

# Verificar status
echo "✅ Verificando status dos serviços..."
docker-compose ps

echo "🎉 Deploy concluído!"
echo "📱 Aplicação disponível em: https://pshot.praisechat.com.br"

# Mostrar logs
echo "📋 Últimos logs:"
docker-compose logs --tail=20 pshot-app