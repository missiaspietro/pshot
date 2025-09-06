#!/bin/bash

# Script Bash para build e push da imagem Docker
# Build local e push para DockerHub

echo "🚀 Iniciando build e push da imagem Docker..."

# Definir variáveis
IMAGE_NAME="praisetecnologia/praise-shot"
TAG_LATEST="latest"
TAG_DATE=$(date +"%Y-%m-%d-%H%M")

echo "📦 Informações da imagem:"
echo "- Nome: $IMAGE_NAME"
echo "- Tag Latest: $TAG_LATEST"
echo "- Tag Data: $TAG_DATE"

# Verificar se Docker está rodando
echo "🔍 Verificando se Docker está rodando..."
if ! docker version >/dev/null 2>&1; then
    echo "❌ Docker não está rodando ou não está instalado"
    exit 1
fi
echo "✅ Docker está rodando"

# Limpar builds anteriores (opcional)
echo "🧹 Limpando imagens antigas..."
docker image prune -f

# Build da imagem
echo "🔨 Iniciando build da imagem..."
echo "Comando: docker build -t ${IMAGE_NAME}:${TAG_LATEST} -t ${IMAGE_NAME}:${TAG_DATE} ."

if ! docker build -t "${IMAGE_NAME}:${TAG_LATEST}" -t "${IMAGE_NAME}:${TAG_DATE}" .; then
    echo "❌ Erro no build da imagem"
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Verificar tamanho da imagem
echo "📊 Informações da imagem criada:"
docker images "${IMAGE_NAME}:${TAG_LATEST}"

# Testar a imagem localmente (opcional)
echo "🧪 Testando imagem localmente..."
echo "Iniciando container de teste na porta 3001..."

if TEST_CONTAINER=$(docker run -d -p 3001:3000 --name praise-shot-test "${IMAGE_NAME}:${TAG_LATEST}"); then
    echo "✅ Container de teste iniciado: $TEST_CONTAINER"
    echo "🌐 Teste local disponível em: http://localhost:3001"
    
    # Aguardar um pouco para o container inicializar
    echo "⏳ Aguardando container inicializar..."
    sleep 10
    
    # Testar se está respondendo
    if curl -f -s http://localhost:3001 >/dev/null; then
        echo "✅ Container está respondendo corretamente!"
    else
        echo "⚠️ Container pode não estar respondendo corretamente"
    fi
    
    # Parar e remover container de teste
    echo "🛑 Parando container de teste..."
    docker stop praise-shot-test >/dev/null
    docker rm praise-shot-test >/dev/null
    echo "✅ Container de teste removido"
else
    echo "⚠️ Não foi possível iniciar container de teste, mas continuando..."
fi

# Push para DockerHub
echo "📤 Fazendo push para DockerHub..."

# Verificar se está logado no DockerHub
echo "🔐 Verificando login no DockerHub..."
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "⚠️ Você pode não estar logado no DockerHub"
    echo "Execute: docker login"
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operação cancelada"
        exit 1
    fi
fi

# Push da tag latest
echo "📤 Fazendo push da tag latest..."
if ! docker push "${IMAGE_NAME}:${TAG_LATEST}"; then
    echo "❌ Erro no push da tag latest"
    exit 1
fi
echo "✅ Push da tag latest concluído!"

# Push da tag com data
echo "📤 Fazendo push da tag com data..."
if ! docker push "${IMAGE_NAME}:${TAG_DATE}"; then
    echo "❌ Erro no push da tag com data"
    exit 1
fi
echo "✅ Push da tag com data concluído!"

# Resumo final
echo ""
echo "🎉 BUILD E PUSH CONCLUÍDOS COM SUCESSO!"
echo ""
echo "📦 Imagens disponíveis no DockerHub:"
echo "- ${IMAGE_NAME}:${TAG_LATEST}"
echo "- ${IMAGE_NAME}:${TAG_DATE}"
echo ""
echo "🔗 Links úteis:"
echo "- DockerHub: https://hub.docker.com/r/praisetecnologia/praise-shot"
echo "- Pull command: docker pull ${IMAGE_NAME}:${TAG_LATEST}"
echo ""
echo "🚀 Próximos passos:"
echo "1. Atualizar o serviço em produção"
echo "2. Verificar se a correção do webhook funcionou"
echo "3. Testar geração de QR codes"
echo ""

# Mostrar informações da imagem final
echo "📊 Informações finais da imagem:"
docker images "${IMAGE_NAME}" | head -3

echo "✅ Script concluído!"