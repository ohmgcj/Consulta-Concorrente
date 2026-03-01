#!/bin/bash
# 🚀 GUIA COMPLETO: DEPLOY NO RAILWAY
# ════════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 IKRO API TEST - DEPLOY RAILWAY                        ║"
echo "║     Guia Passo a Passo                                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# ════════════════════════════════════════════════════════════
# PASSO 1: PREPARAR REPOSITÓRIO GIT
# ════════════════════════════════════════════════════════════

echo ""
echo "📋 PASSO 1: Verificar Git"
echo "────────────────────────────────────────────────────────"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Git não inicializado"
    echo "Execute:"
    echo "  git init"
    echo "  git remote add origin https://github.com/SEU_USER/seu-repo.git"
    echo ""
    exit 1
fi

echo "✅ Repositório Git: OK"
echo "   Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "   Remote: $(git config --get remote.origin.url 2>/dev/null || 'não configurado')"

# ════════════════════════════════════════════════════════════
# PASSO 2: VERIFICAR DEPENDÊNCIAS
# ════════════════════════════════════════════════════════════

echo ""
echo "📦 PASSO 2: Verificar Dependências"
echo "────────────────────────────────────────────────────────"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js não instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm não instalado"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"

# Verificar dependências instaladas
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências..."
    npm install
fi

# ════════════════════════════════════════════════════════════
# PASSO 3: VERIFICAR .env
# ════════════════════════════════════════════════════════════

echo ""
echo "🔐 PASSO 3: Verificar Configurações"
echo "────────────────────────────────────────────────────────"

if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado"
    echo "   Copiar de .env.example? (não contém valores reais)"
else
    echo "✅ .env configurado"
    echo "   NODE_ENV: $(grep '^NODE_ENV' .env | cut -d'=' -f2)"
    echo "   PORT: $(grep '^PORT' .env | cut -d'=' -f2)"
fi

# ════════════════════════════════════════════════════════════
# PASSO 4: TESTAR LOCALMENTE
# ════════════════════════════════════════════════════════════

echo ""
echo "🧪 PASSO 4: Testar Localmente"
echo "────────────────────────────────────────────────────────"

echo "Para testar sua aplicação localmente:"
echo ""
echo "  npm start"
echo ""
echo "Depois acesse: http://localhost:3000"
echo ""
read -p "Já testou localmente? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Teste primeiro: npm start"
    exit 1
fi

# ════════════════════════════════════════════════════════════
# PASSO 5: PREPARAR PARA PUSH
# ════════════════════════════════════════════════════════════

echo ""
echo "📤 PASSO 5: Git Push"
echo "────────────────────────────────────────────────────────"

echo "Arquivos que serão enviados:"
git status --short | head -20

echo ""
read -p "Deseja fazer commit e push agora? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    git add .
    git commit -m "chore: prepare for railway deployment" || true
    git push origin main --force-with-lease || git push origin $(git rev-parse --abbrev-ref HEAD)
    echo "✅ Code pushed!"
fi

# ════════════════════════════════════════════════════════════
# PASSO 6: CONFIGURAR RAILWAY
# ════════════════════════════════════════════════════════════

echo ""
echo "🚂 PASSO 6: Railway Setup"
echo "────────────────────────────────────────────────────────"

echo ""
echo "Você precisa:"
echo "  1. Criar conta em https://railway.app"
echo "  2. Conectar com GitHub"
echo "  3. Selecionar este repositório"
echo "  4. Railway fará deploy automático!"
echo ""

if ! command -v railway &> /dev/null; then
    echo "💡 Instalando Railway CLI (opcional)..."
    npm install -g @railway/cli
    
    if command -v railway &> /dev/null; then
        echo ""
        echo "✅ Railway CLI instalado"
        echo ""
        read -p "Deseja fazer login no Railway agora? (s/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            railway login
        fi
    fi
fi

# ════════════════════════════════════════════════════════════
# PASSO 7: INSTRUÇÕES RAILW AY
# ════════════════════════════════════════════════════════════

echo ""
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ PRONTO PARA RAILWAY!                                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📖 PRÓXIMAS INSTRUÇÕES:"
echo ""
echo "1️⃣  Acesse: https://railway.app/dashboard"
echo ""
echo "2️⃣  Clique: + New → New Project"
echo ""
echo "3️⃣  Selecione: Deploy from GitHub → seu-repo"
echo ""
echo "4️⃣  Railway detectará automaticamente Node.js"
echo ""
echo "5️⃣  Vá para Settings da aplicação"
echo ""
echo "6️⃣  Em Variables, adicione (OPCIONAL - Railway detecta automaticamente):"
echo "    • NODE_ENV=production"
echo "    • PORT=3000 (ou deixe vazio)"
echo ""
echo "7️⃣  Deploy será iniciado automaticamente!"
echo ""
echo "8️⃣  Sua URL será: https://seu-app-randomXXXX.railway.app"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""
echo "💡 DICAS ÚTEIS:"
echo ""
echo "   • Ver logs:  railway logs"
echo "   • Teste:     curl https://seu-app.railway.app/health"
echo "   • Redeployar:  git push (automático)"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""
echo "❓ PROBLEMAS?"
echo ""
echo "   Logs:      railway logs --follow"
echo "   Health:    curl https://seu-app.railway.app/health"
echo "   Redeploy:  railway redeploy"
echo ""
