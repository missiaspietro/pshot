# INSTRUÇÕES URGENTES - Upload PraiseShot para GitHub

## 🚨 EXECUTE ESTES COMANDOS EXATAMENTE NESTA ORDEM:

### 1. Abra PowerShell como Administrador
Clique com botão direito no PowerShell e selecione "Executar como Administrador"

### 2. Execute os comandos um por vez:

```powershell
# Navegar para o projeto
cd "c:\Users\jaque\OneDrive\Documentos\Projetos Windsurf\praiseshot"

# Limpar Git anterior
Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue

# Configurar Git
git config --global user.name "Moises Missias"
git config --global user.email "moisesmissias@gmail.com"

# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit: PraiseShot - Sistema completo"

# Branch principal
git branch -M main

# Adicionar repositório remoto
git remote add origin https://github.com/moisesmissias/wjs5praiseshot.git

# PUSH FORÇADO
git push -u origin main --force
```

## 🔑 SE DER ERRO DE AUTENTICAÇÃO:

1. **Vá para GitHub.com**
2. **Settings → Developer settings → Personal access tokens → Tokens (classic)**
3. **Generate new token (classic)**
4. **Marque todas as opções de 'repo'**
5. **Copie o token gerado**
6. **Use o token como senha quando o Git pedir**

## 🎯 ALTERNATIVA RÁPIDA - GitHub CLI:

Se tiver o GitHub CLI instalado:
```bash
gh repo create wjs5praiseshot --public --source=. --remote=origin --push
```

## 📋 VERIFICAÇÃO:

Após executar, acesse: **https://github.com/moisesmissias/wjs5praiseshot**

Deve mostrar todos os arquivos do projeto!

## ⚠️ PROBLEMAS COMUNS:

- **"remote origin already exists"**: Execute `git remote remove origin` primeiro
- **"Authentication failed"**: Use Token de Acesso Pessoal
- **"Repository not found"**: Verifique se o repositório existe no GitHub

## 🆘 ÚLTIMA ALTERNATIVA - GitHub Desktop:

1. Baixe GitHub Desktop
2. Login com sua conta
3. "Add an Existing Repository" 
4. Selecione a pasta do projeto
5. Publish repository
