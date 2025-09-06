# Script PowerShell para build e push da imagem Docker
Write-Host "Iniciando build e push da imagem Docker..." -ForegroundColor Green

# Definir variaveis
$IMAGE_NAME = "praisetecnologia/praise-shot"
$TAG_LATEST = "latest"
$TAG_DATE = Get-Date -Format "yyyy-MM-dd-HHmm"

Write-Host "Informacoes da imagem:" -ForegroundColor Cyan
Write-Host "- Nome: $IMAGE_NAME" -ForegroundColor White
Write-Host "- Tag Latest: $TAG_LATEST" -ForegroundColor White
Write-Host "- Tag Data: $TAG_DATE" -ForegroundColor White

# Verificar se Docker esta rodando
Write-Host "Verificando se Docker esta rodando..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "Docker esta rodando" -ForegroundColor Green
} catch {
    Write-Host "Docker nao esta rodando ou nao esta instalado" -ForegroundColor Red
    exit 1
}

# Limpar builds anteriores
Write-Host "Limpando imagens antigas..." -ForegroundColor Yellow
docker image prune -f

# Build da imagem
Write-Host "Iniciando build da imagem..." -ForegroundColor Yellow
Write-Host "Comando: docker build -t ${IMAGE_NAME}:${TAG_LATEST} -t ${IMAGE_NAME}:${TAG_DATE} ." -ForegroundColor Gray

docker build -t "${IMAGE_NAME}:${TAG_LATEST}" -t "${IMAGE_NAME}:${TAG_DATE}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build da imagem" -ForegroundColor Red
    exit 1
}

Write-Host "Build concluido com sucesso!" -ForegroundColor Green

# Verificar tamanho da imagem
Write-Host "Informacoes da imagem criada:" -ForegroundColor Cyan
docker images "${IMAGE_NAME}:${TAG_LATEST}"

# Push para DockerHub
Write-Host "Fazendo push para DockerHub..." -ForegroundColor Yellow

# Push da tag latest
Write-Host "Fazendo push da tag latest..." -ForegroundColor Yellow
docker push "${IMAGE_NAME}:${TAG_LATEST}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push da tag latest" -ForegroundColor Red
    exit 1
}

Write-Host "Push da tag latest concluido!" -ForegroundColor Green

# Push da tag com data
Write-Host "Fazendo push da tag com data..." -ForegroundColor Yellow
docker push "${IMAGE_NAME}:${TAG_DATE}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push da tag com data" -ForegroundColor Red
    exit 1
}

Write-Host "Push da tag com data concluido!" -ForegroundColor Green

# Resumo final
Write-Host ""
Write-Host "BUILD E PUSH CONCLUIDOS COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "Imagens disponiveis no DockerHub:" -ForegroundColor Cyan
Write-Host "- ${IMAGE_NAME}:${TAG_LATEST}" -ForegroundColor White
Write-Host "- ${IMAGE_NAME}:${TAG_DATE}" -ForegroundColor White
Write-Host ""
Write-Host "Links uteis:" -ForegroundColor Cyan
Write-Host "- DockerHub: https://hub.docker.com/r/praisetecnologia/praise-shot" -ForegroundColor White
Write-Host "- Pull command: docker pull ${IMAGE_NAME}:${TAG_LATEST}" -ForegroundColor White
Write-Host ""

# Mostrar informacoes da imagem final
Write-Host "Informacoes finais da imagem:" -ForegroundColor Cyan
docker images "${IMAGE_NAME}" | Select-Object -First 3

Write-Host "Script concluido!" -ForegroundColor Green