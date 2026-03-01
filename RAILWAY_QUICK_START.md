# 🚀 RAILROAD DEPLOY - COMANDOS COPY & PASTE

## ⚡ Versão Rápida (5 minutos)

```powershell
# 1. Testar localmente
npm start

# Após alguns segundos você verá:
# [NOTUS] XXXX produtos carregados.
# [CACHE] Cache armazenado em memória
# Ctrl+C para parar
```

```powershell
# 2. Enviar para GitHub
git add .
git commit -m "chore: Ready for railroad deployment"
git push origin main
```

```
# 3. Deploy em Railway (Manual)
Acesse: https://railway.app/dashboard
→ New Project
→ Deploy from GitHub Repo
→ Selecione seu repositório
→ Pronto! ✨
```

---

## 📖 Versão Completa com Verificações

```powershell
# Navegar para pasta do projeto
cd "C:\Users\PC\Documents\Program\Ikro api test"

# Verificar Node.js
node -v

# Verificar npm
npm -v

# Limpar cache npm (opcional)
npm cache clean --force

# Instalar dependências
npm install

# Criar .env (se não existir)
Copy-Item ".env.example" ".env" -Force

# Verificar variáveis no .env
Get-Content ".env" | Select-String "NODE_ENV|PORT|IKRO|NOTUS" | head -5

# Testar localmente
npm start

# Aguardar ~20 segundos para cache carregar
# Você verá:
# [NOTUS] 7858 produtos carregados.
# [CACHE] Cache armazenado em memória
# [GAP-ANALYSIS] XXXX lacunas encontradas

# Parar servidor: Ctrl+C
```

Após confirmar que funciona localmente:

```powershell
# Verificar Git status
git status

# Adicionar todas as mudanças
git add .

# Criar commit
git commit -m "chore: configure environment variables for railroad"

# Enviar para GitHub
git push origin main

# Verificar se subiu
git log --oneline | head -3
```

---

## 🚂 Deploy em Railway

**Opção 1: Via Dashboard (Recomendado - mais fácil)**

```
1. Abra: https://railway.app/dashboard
2. Clique: "+ New Project"
3. Selecione: "Deploy from GitHub Repo"
4. Conecte seu GitHub (primeira vez)
5. Selecione este repositório
6. Clique: "Deploy"
7. Aguarde (leva ~5-10 minutos)
8. Sua URL: https://seu-app-XXXXXX.railway.app
```

**Opção 2: Via CLI (mais velocidade)**

```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login

# Fazer deploy (esse comando faz tudo)
railway up

# Ver logs
railway logs --follow

# Sua URL estará no output final
```

---

## ✅ Verificação Pós-Deploy

```powershell
# Após Railway iniciar, testar sua app:

# 1. Health Check
curl https://seu-app-XXXXXX.railway.app/health

# 2. Listar reguladores IKRO
curl https://seu-app-XXXXXX.railway.app/api/reguladores | head -c 500

# 3. Teste no browser
https://seu-app-XXXXXX.railway.app

# 4. Ver logs em tempo real
railway logs --follow
```

---

## 🔧 Variáveis Railway (Automáticas)

Railway detecta tudo automaticamente, mas se precisar adicionar manualmente:

```
Railway Dashboard → Settings → Variables

Adicionar:
NODE_ENV = production
IKRO_API_BASE = https://adm.ikro.com.br/api
NOTUS_API_URL = https://catalogo.notus.ind.br/conversor/produtos.json
REQUEST_TIMEOUT = 15000
```

---

## 🆘 Se Algo der Errado

```powershell
# Ver logs completos
railway logs --follow

# Procure por erro (começaria com ERROR ou erro)

# Forçar novo deploy
railway redeploy

# Listar variáveis
railway env list

# Conectar SSH para debug (avançado)
railway shell
```

---

## 📊 Seu Projeto em Números

| Item | Valor |
|------|-------|
| Porta | 3000 |
| APIs Externas | 2 (IKRO + NOTUS) |
| Produtos Carregados | ~7858 |
| Lacunas Detectadas | ~7334 |
| Tempo Startup | 15-20s |
| RAM Estimado | ~128MB |
| Custo Railway | $5/mês free |

---

## ⏱️ Timeline

```
0min   → npm start (local)
20s    → Cache carregado
5min   → git push
15min  → Deploy em Railway
25min  → App online em produção
```

---

## 📝 Resumo de Arquivos

Criados para você:

- ✅ `.env` - Configurações locais
- ✅ `server.js` - Atualizado com dotenv
- ✅ `providers/ikro.provider.js` - Com variáveis
- ✅ `providers/notus.provider.js` - Com variáveis
- ✅ `RAILWAY_CONFIG.md` - Documentação técnica
- ✅ `RAILWAY_SETUP.ps1` - Script setup automático
- ✅ `RAILWAY_READY.txt` - Este arquivo

---

## 🎯 TL;DR (Ultra Rápido)

```powershell
npm install
npm start
# Aguarde 20s, teste em http://localhost:3000, Ctrl+C

git add .
git commit -m "Ready for production"
git push origin main

# Acesse https://railway.app e conecte seu repo
# Pronto! 🚀
```

---

**Versão:** Railway Ready v1.0  
**Data:** 01/03/2026  
**Status:** ✅ Pronto para Hoje!

Dúvidas? Veja `RAILWAY_CONFIG.md` para documentação completa.
