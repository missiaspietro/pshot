#!/bin/bash

# Script para build e push da imagem Docker do PraiseShot

# Configurações
IMAGE_NAME="praisetecnologia/praiseshot"
VERSION="latest"

echo "🚀 Iniciando build da imagem Docker..."

# Build da imagem
echo "📦 Fazendo build da imagem..."
docker build -t ${IMAGE_NAME}:${VERSION} .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Push da imagem (opcional)
    read -p "Deseja fazer push da imagem para o registry? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 Fazendo push da imagem..."
        docker push ${IMAGE_NAME}:${VERSION}
        
        if [ $? -eq 0 ]; then
            echo "✅ Push concluído com sucesso!"
            echo "🎉 Imagem disponível em: ${IMAGE_NAME}:${VERSION}"
        else
            echo "❌ Erro no push da imagem"
            exit 1
        fi
    fi
else
    echo "❌ Erro no build da imagem"
    exit 1
fi

echo "🏁 Processo concluído!"