# ⚙️ CONFIGURAÇÃO RAILWAY - RESUMO TÉCNICO

## 🔑 Variáveis de Ambiente Necessárias

Seu projeto está configurado para usar as seguintes variáveis:

| Variável | Valor | Tipo | Obrigatória |
|----------|-------|------|------------|
| `NODE_ENV` | `production` | String | Sim |
| `PORT` | `3000` | Number | Não* |
| `IKRO_API_BASE` | `https://adm.ikro.com.br/api` | URL | Não** |
| `NOTUS_API_URL` | `https://catalogo.notus.ind.br/conversor/produtos.json` | URL | Não** |
| `REQUEST_TIMEOUT` | `15000` | Number (ms) | Não |
| `LOG_LEVEL` | `info` | String | Não |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | String | Não |

**Notas:**
- `*` Railway define PORT automaticamente
- `**` Tem defaults se não forem definidas

---

## ✅ Setup Railway - Passo a Passo

### 1️⃣ Criar Conta

```
1. Acesse: https://railway.app
2. Clique "Sign up" → autentique com GitHub
3. Autorize Railway a acessar seus repositórios
```

### 2️⃣ Criar Novo Projeto

```
1. Dashboard → "+ New Project"
2. Selecione "Deploy from GitHub Repo"
3. Conecte com GitHub (primeira vez)
4. Selecione seu repositório
```

### 3️⃣ Configurar Variáveis (Opcional)

Railway detecta automaticamente, mas você pode customizar:

```
Dashboard → Settings → Variables → Add Variable

NODE_ENV=production
IKRO_API_BASE=https://adm.ikro.com.br/api
NOTUS_API_URL=https://catalogo.notus.ind.br/conversor/produtos.json
```

### 4️⃣ Deploy Automático

```
Railway automaticamente:
1. Detecta Node.js no package.json
2. Lê o package.json scripts.start
3. Executa: npm install && npm start
4. Gera URL única: https://seu-app-random.railway.app
```

---

## 🧪 Teste Antes de Enviar

```bash
# 1. Instale dependências localmente
npm install

# 2. Crie .env (já criado!)
# Verifique se .env existe com variáveis corretas

# 3. Teste localmente
npm start

# 4. Teste a aplicação
# Browser: http://localhost:3000
# Health: http://localhost:3000/health

# 5. Se tudo funcionar, faça push
git add .
git commit -m "chore: prepare for railway"
git push origin main
```

---

## 🔄 Como Atualizar em Produção

Tudo é **automático** via GitHub!

```bash
# Localmente, faça suas mudanças
git add .
git commit -m "feat: sua mudança"
git push origin main

# Railway detecta o push automaticamente
# → Faz pull do novo código
# → npm install (se package.json mudou)
# → npm start (reinicia)
# → ✅ Deploy concluído
```

---

## 📊 Monitoramento em Produção

### Ver Logs

```bash
# Via CLI
railway logs --follow

# Via Dashboard
Railway → seu-projeto → Logs
```

### Health Check

```bash
# Testar se aplicação está rodando
curl https://seu-app.railway.app/health

# Esperado:
# {
#   "status": "UP",
#   "cache": { "reguladores": true, "notusProducts": true },
#   "uptime": 3600
# }
```

### Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Cannot find module" | Dependência não instalada | `npm install` localmente, faça push |
| Timeout ao carregar IKRO | API lenta | Aumentar REQUEST_TIMEOUT no .env |
| Cache vazio | Primeira execução lenta | Esperar 15-20s na primeira requisição |
| Erro 503 | Cache não pronto | Aguardar inicialização |

---

## 🚀 Performance em Railway

| Métrica | Valor |
|---------|-------|
| **RAM** | ~128MB (incluindo Node + Cache) |
| **CPU** | 0.5 vCPU |
| **Disco** | 2GB |
| **Tempo Startup** | 10-20s (primeiro cache) |
| **Requisições/s** | ~100+ (conforme plano) |
| **Limite Free** | $5/mês de crédito |

---

## 🔐 Segurança

### Seus Dados São Seguros Porque:

✅ **APIs Externas:**
- IKRO: Pública (sem token necessário)
- NOTUS: Pública (sem token necessário)
- Apenas requisições GET (leitura)

✅ **Seus Mapeamentos:**
- JSON local (não enviado para internet)
- Apenas no seu servidor Railway

✅ **Em Produção:**
- HTTPS automático via Railway
- Railway gerencia certificados SSL/TLS
- Firewall integrado

---

## 📝 Logs Importantes para Debug

No terminal, veja estes logs:

```
[SERVER] Iniciando em production
[SERVER] Porta: 3000
[IKRO] Iniciando carregamento de reguladores...
[IKRO] XXX reguladores carregados.
[NOTUS] Iniciando carregamento de produtos...
[NOTUS] XXX produtos carregados.
[GAP-ANALYSIS] XX lacunas encontradas
```

Se não ver isso, há erro na inicialização.

---

## Próximos Passos

1. ✅ **Arquivo .env criado** - configurado com URLs públicas
2. ✅ **server.js atualizado** - usa dotenv
3. ✅ **providers atualizados** - usam variáveis de ambiente
4. 📤 **Fazer git push** - seu código para GitHub
5. 🚂 **Railway deploy** - conectar repositório
6. ✨ **Sua app online!** - em https://seu-app.railway.app

---

## 📞 Suporte Rápido

**Tudo funciona localmente mas falha em Railway?**

```bash
# Ver logs em tempo real
railway logs --follow

# Forçar rebuild
railway redeploy

# Verificar variáveis
railway env list

# SSH no container (debug)
railway shell
```

---

**Versão:** 1.0.0  
**Última atualização:** 01/03/2026  
**Status:** ✅ Pronto para Deploy
