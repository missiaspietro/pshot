# Script para enviar o projeto PraiseShot para o GitHub
# Execute este script no PowerShell como Administrador

$repoUrl = "https://github.com/moisesmissias/wjs5praiseshot.git"

Write-Host "=== INICIANDO UPLOAD DO PROJETO PRAISESHOT ===" -ForegroundColor Green

# Limpar configuração Git anterior
Write-Host "Limpando configuração Git anterior..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
    Write-Host "Pasta .git removida" -ForegroundColor Green
}

# Configurar Git
Write-Host "Configurando Git..." -ForegroundColor Yellow
git config --global user.name "Moises Missias"
git config --global user.email "moisesmissias@gmail.com"

# Inicializar repositório
Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
git init

# Adicionar todos os arquivos
Write-Host "Adicionando todos os arquivos..." -ForegroundColor Yellow
git add .

# Verificar se há arquivos para commit
$status = git status --porcelain
if ($status) {
    Write-Host "Fazendo commit das alterações..." -ForegroundColor Yellow
    git commit -m "Initial commit: PraiseShot - Sistema de gestão empresarial completo"
    
    # Configurar branch principal
    Write-Host "Configurando branch principal..." -ForegroundColor Yellow
    git branch -M main
    
    # Adicionar repositório remoto
    Write-Host "Adicionando repositório remoto..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    
    # Enviar para GitHub com force
    Write-Host "Enviando para o GitHub..." -ForegroundColor Yellow
    git push -u origin main --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "=== UPLOAD CONCLUÍDO COM SUCESSO! ===" -ForegroundColor Green
        Write-Host "Acesse: https://github.com/moisesmissias/wjs5praiseshot" -ForegroundColor Cyan
    } else {
        Write-Host "ERRO: Falha no push para o GitHub" -ForegroundColor Red
        Write-Host "Verifique suas credenciais de autenticação" -ForegroundColor Red
    }
} else {
    Write-Host "ERRO: Nenhum arquivo para commit" -ForegroundColor Red
}

Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
