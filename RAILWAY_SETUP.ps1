# 🚀 GUIA COMPLETO: DEPLOY NO RAILWAY (Windows PowerShell)
# ════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 IKRO API TEST - DEPLOY RAILWAY                        ║" -ForegroundColor Cyan
Write-Host "║     Guia Passo a Passo para Windows                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ════════════════════════════════════════════════════════════
# PASSO 1: VERIFICAR PRÉ-REQUISITOS
# ════════════════════════════════════════════════════════════

Write-Host "📋 PASSO 1: Verificar Pré-requisitos" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

# Verificar Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git não encontrado. Instale em: https://git-scm.com" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git: $(git --version)" -ForegroundColor Green

# Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $(node -v)" -ForegroundColor Green
Write-Host "✅ npm: $(npm -v)" -ForegroundColor Green

# ════════════════════════════════════════════════════════════
# PASSO 2: PREPARAR DEPENDÊNCIAS
# ════════════════════════════════════════════════════════════

Write-Host "`n📦 PASSO 2: Instalar Dependências" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

if (-not (Test-Path "node_modules" -PathType Container)) {
    Write-Host "📥 Instalando dependências..." -ForegroundColor Cyan
    npm install
    Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules já existe" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════
# PASSO 3: VERIFICAR .env
# ════════════════════════════════════════════════════════════

Write-Host "`n🔐 PASSO 3: Configurar Ambiente" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

if (-not (Test-Path ".env" -PathType Leaf)) {
    Write-Host "⚠️  .env não encontrado - criando a partir de .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example" -PathType Leaf) {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env criado!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ .env já existe" -ForegroundColor Green
    $nodeEnv = Select-String -Path ".env" -Pattern "^NODE_ENV" | ForEach-Object { $_.Line.Split('=')[1] }
    $port = Select-String -Path ".env" -Pattern "^PORT" | ForEach-Object { $_.Line.Split('=')[1] }
    Write-Host "   NODE_ENV=$nodeEnv" -ForegroundColor Gray
    Write-Host "   PORT=$port" -ForegroundColor Gray
}

# ════════════════════════════════════════════════════════════
# PASSO 4: TESTAR LOCALMENTE
# ════════════════════════════════════════════════════════════

Write-Host "`n🧪 PASSO 4: Testar Localmente" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "Execute: npm start" -ForegroundColor Cyan
Write-Host "Depois abra: http://localhost:3000" -ForegroundColor Cyan

$testInput = Read-Host "`nJá testou e tudo funciona? (s/n)"
if ($testInput -ne "s" -and $testInput -ne "S") {
    Write-Host "❌ Teste antes de fazer deploy!" -ForegroundColor Red
    exit 1
}

# ════════════════════════════════════════════════════════════
# PASSO 5: GIT SETUP
# ════════════════════════════════════════════════════════════

Write-Host "`n📤 PASSO 5: Configurar Git" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

$gitStatus = git status 2>&1
if ($gitStatus -like "*fatal*") {
    Write-Host "⚠️  Repositório Git não inicializado" -ForegroundColor Yellow
    Write-Host "Execute:" -ForegroundColor Cyan
    Write-Host "  git init" -ForegroundColor Gray
    Write-Host "  git remote add origin https://github.com/SEU_USER/seu-repo.git" -ForegroundColor Gray
    Write-Host "  git add ." -ForegroundColor Gray
    Write-Host "  git commit -m 'Initial commit'" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Repositório Git OK" -ForegroundColor Green
Write-Host "   Branch: $(git rev-parse --abbrev-ref HEAD)" -ForegroundColor Gray

# Mostrar mudanças
Write-Host "`n📝 Mudanças a fazer push:" -ForegroundColor Cyan
git status --short | Select-Object -First 10

$confirmPush = Read-Host "`nDeseja fazer commit e push? (s/n)"
if ($confirmPush -eq "s" -or $confirmPush -eq "S") {
    git add .
    git commit -m "chore: prepare for railway deployment" -ErrorAction SilentlyContinue
    git push origin main 2>$null || (git push origin (git rev-parse --abbrev-ref HEAD))
    Write-Host "✅ Code enviado para GitHub!" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════
# PASSO 6: INSTALAR RAILWAY CLI
# ════════════════════════════════════════════════════════════

Write-Host "`n🚂 PASSO 6: Railways CLI (Opcional)" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    $installRailway = Read-Host "Instalar Railway CLI? (s/n)"
    if ($installRailway -eq "s" -or $installRailway -eq "S") {
        Write-Host "📥 Instalando Railway CLI..." -ForegroundColor Cyan
        npm install -g @railway/cli
        Write-Host "✅ Railway CLI instalado!" -ForegroundColor Green
        
        $loginRailway = Read-Host "Fazer login no Railway agora? (s/n)"
        if ($loginRailway -eq "s" -or $loginRailway -eq "S") {
            railway login
        }
    }
} else {
    Write-Host "✅ Railway CLI já está instalado" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════
# RESUMO FINAL
# ════════════════════════════════════════════════════════════

Write-Host "`n`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ PRONTO PARA RAILROAD!                                 ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📖 PRÓXIMAS INSTRUÇÕES:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Acesse: https://railway.app/dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  Clique em + New → New Project" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Selecione: Deploy from GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Conecte seu GitHub e escolha este repositório" -ForegroundColor Yellow
Write-Host ""
Write-Host "5️⃣  Railway detectará Node.js automaticamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "6️⃣  Deploy será iniciado! ✨" -ForegroundColor Yellow
Write-Host ""
Write-Host "7️⃣  Sua URL será: https://seu-app-randomXXXX.railway.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 DICAS ÚTEIS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Ver logs:" -ForegroundColor Gray
Write-Host "     railway logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Testar health check:" -ForegroundColor Gray
Write-Host "     curl https://seu-app.railway.app/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Redeployar (git push automático):" -ForegroundColor Gray
Write-Host "     git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Forçar redeploy no Railway:" -ForegroundColor Gray
Write-Host "     railway redeploy" -ForegroundColor Cyan
Write-Host ""
