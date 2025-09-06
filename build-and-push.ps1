# Script PowerShell para build e push da imagem Docker
# Build local e push para DockerHub

Write-Host "🚀 Iniciando build e push da imagem Docker..." -ForegroundColor Green

# Definir variáveis
$IMAGE_NAME = "praisetecnologia/praise-shot"
$TAG_LATEST = "latest"
$TAG_DATE = Get-Date -Format "yyyy-MM-dd-HHmm"

Write-Host "📦 Informações da imagem:" -ForegroundColor Cyan
Write-Host "- Nome: $IMAGE_NAME" -ForegroundColor White
Write-Host "- Tag Latest: $TAG_LATEST" -ForegroundColor White
Write-Host "- Tag Data: $TAG_DATE" -ForegroundColor White

# Verificar se Docker está rodando
Write-Host "🔍 Verificando se Docker está rodando..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando ou não está instalado" -ForegroundColor Red
    exit 1
}

# Limpar builds anteriores (opcional)
Write-Host "🧹 Limpando imagens antigas..." -ForegroundColor Yellow
docker image prune -f

# Build da imagem
Write-Host "🔨 Iniciando build da imagem..." -ForegroundColor Yellow
Write-Host "Comando: docker build -t ${IMAGE_NAME}:${TAG_LATEST} -t ${IMAGE_NAME}:${TAG_DATE} ." -ForegroundColor Gray

$buildResult = docker build -t "${IMAGE_NAME}:${TAG_LATEST}" -t "${IMAGE_NAME}:${TAG_DATE}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build da imagem" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Verificar tamanho da imagem
Write-Host "📊 Informações da imagem criada:" -ForegroundColor Cyan
docker images "${IMAGE_NAME}:${TAG_LATEST}"

# Testar a imagem localmente (opcional)
Write-Host "🧪 Testando imagem localmente..." -ForegroundColor Yellow
Write-Host "Iniciando container de teste na porta 3001..." -ForegroundColor Gray

$testContainer = docker run -d -p 3001:3000 --name praise-shot-test "${IMAGE_NAME}:${TAG_LATEST}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container de teste iniciado: $testContainer" -ForegroundColor Green
    Write-Host "🌐 Teste local disponível em: http://localhost:3001" -ForegroundColor Cyan
    
    # Aguardar um pouco para o container inicializar
    Write-Host "⏳ Aguardando container inicializar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Testar se está respondendo
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Container está respondendo corretamente!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Container respondeu com status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Não foi possível testar o container: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Parar e remover container de teste
    Write-Host "🛑 Parando container de teste..." -ForegroundColor Yellow
    docker stop praise-shot-test | Out-Null
    docker rm praise-shot-test | Out-Null
    Write-Host "✅ Container de teste removido" -ForegroundColor Green
} else {
    Write-Host "⚠️ Não foi possível iniciar container de teste, mas continuando..." -ForegroundColor Yellow
}

# Push para DockerHub
Write-Host "📤 Fazendo push para DockerHub..." -ForegroundColor Yellow

# Verificar se está logado no DockerHub
Write-Host "🔐 Verificando login no DockerHub..." -ForegroundColor Yellow
$loginCheck = docker info 2>&1 | Select-String "Username"
if (-not $loginCheck) {
    Write-Host "⚠️ Você pode não estar logado no DockerHub" -ForegroundColor Yellow
    Write-Host "Execute: docker login" -ForegroundColor Cyan
    $continue = Read-Host "Continuar mesmo assim? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Operação cancelada" -ForegroundColor Red
        exit 1
    }
}

# Push da tag latest
Write-Host "📤 Fazendo push da tag latest..." -ForegroundColor Yellow
docker push "${IMAGE_NAME}:${TAG_LATEST}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no push da tag latest" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Push da tag latest concluído!" -ForegroundColor Green

# Push da tag com data
Write-Host "📤 Fazendo push da tag com data..." -ForegroundColor Yellow
docker push "${IMAGE_NAME}:${TAG_DATE}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no push da tag com data" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Push da tag com data concluído!" -ForegroundColor Green

# Resumo final
Write-Host "" -ForegroundColor White
Write-Host "🎉 BUILD E PUSH CONCLUÍDOS COM SUCESSO!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📦 Imagens disponíveis no DockerHub:" -ForegroundColor Cyan
Write-Host "- ${IMAGE_NAME}:${TAG_LATEST}" -ForegroundColor White
Write-Host "- ${IMAGE_NAME}:${TAG_DATE}" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔗 Links úteis:" -ForegroundColor Cyan
Write-Host "- DockerHub: https://hub.docker.com/r/praisetecnologia/praise-shot" -ForegroundColor White
Write-Host "- Pull command: docker pull ${IMAGE_NAME}:${TAG_LATEST}" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Atualizar o serviço em produção" -ForegroundColor White
Write-Host "2. Verificar se a correção do webhook funcionou" -ForegroundColor White
Write-Host "3. Testar geração de QR codes" -ForegroundColor White
Write-Host "" -ForegroundColor White

# Mostrar informações da imagem final
Write-Host "📊 Informações finais da imagem:" -ForegroundColor Cyan
docker images "${IMAGE_NAME}" | Select-Object -First 3

Write-Host "✅ Script concluído!" -ForegroundColor Green