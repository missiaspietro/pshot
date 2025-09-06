#!/bin/bash

# Script para build e push da imagem Docker para o DockerHub
# Uso: ./docker-build-and-push.sh [tag]

set -e

# Configurações
DOCKER_USERNAME="praisesistemas"
IMAGE_NAME="praise-shot"
DEFAULT_TAG="latest"

# Usar tag fornecida ou padrão
TAG=${1:-$DEFAULT_TAG}
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$TAG"

echo "🚀 Iniciando build e push da imagem Docker"
echo "📦 Imagem: $FULL_IMAGE_NAME"
echo "📅 Data: $(date)"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

# Limpar builds anteriores (opcional)
echo "🧹 Limpando imagens antigas..."
docker system prune -f || true

# Build da imagem
echo "🔨 Construindo imagem Docker..."
docker build \
    --platform linux/amd64 \
    --tag $FULL_IMAGE_NAME \
    --tag "$DOCKER_USERNAME/$IMAGE_NAME:latest" \
    .

if [ $? -ne 0 ]; then
    echo "❌ Falha no build da imagem"
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Verificar se está logado no DockerHub
echo "🔐 Verificando login no DockerHub..."
if ! docker info | grep -q "Username"; then
    echo "⚠️ Não está logado no DockerHub. Fazendo login..."
    docker login
fi

# Push da imagem
echo "📤 Enviando imagem para DockerHub..."
docker push $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo "❌ Falha no push da imagem"
    exit 1
fi

# Push da tag latest se não for a tag padrão
if [ "$TAG" != "latest" ]; then
    echo "📤 Enviando tag latest..."
    docker push "$DOCKER_USERNAME/$IMAGE_NAME:latest"
fi

echo "✅ Imagem enviada com sucesso!"
echo "🐳 Imagem disponível em: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
echo "📋 Para usar a imagem:"
echo "   docker pull $FULL_IMAGE_NAME"
echo "   docker run -p 3000:3000 $FULL_IMAGE_NAME"

# Mostrar informações da imagem
echo "📊 Informações da imagem:"
docker images $FULL_IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo "🎉 Deploy concluído!"