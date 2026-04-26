# 📦 Guia de Deploy no Vercel

Seu projeto foi reestruturado para funcionar com **Vercel** (serverless) ao invés de Railway.

## ✅ Mudanças Importantes (v2)

**APIs agora funcionam sob demanda** - Não há mais espera por cache inicial!
- ✅ Fetch direto das APIs IKRO/NOTUS quando solicitado
- ✅ Zero tempo de espera (sem 503 Service Unavailable)
- ✅ Compatível com Vercel serverless

## ✅ Nova Estrutura

```
seu-projeto/
├── api/                          # Backend (serverless)
│   ├── index.js                  # Servidor Express (renomeado de server.js)
│   ├── providers/
│   │   ├── ikro.provider.js
│   │   └── notus.provider.js
│   └── services/
│       ├── cache.service.js
│       ├── gap-analysis.service.js
│       ├── gap-tracking.service.js
│       └── mapping.service.js
├── public/                       # Frontend (estático)
│   ├── index.html
│   ├── js/
│   │   ├── main.js
│   │   ├── api/
│   │   │   └── backend.api.js
│   │   ├── common/
│   │   │   ├── dom.js
│   │   │   └── utils.js
│   │   └── ui/
│   │       ├── ikro.ui.js
│   │       └── notus.ui.js
│   └── mappings/
│       ├── ikro.mapping.json
│       └── notus.mapping.json
├── vercel.json                   # Configuração Vercel
├── package.json
└── .env.local                    # Variáveis de ambiente
```

---

## � Como Debugar no Vercel (Acesso aos Logs)

### **Via Dashboard Web**

1. Acesse [vercel.com](https://vercel.com)
2. Selecione seu projeto **"Consulta-Concorrente"**
3. Clique em **"Deployments"** (tab no topo)
4. Selecione o deployment mais recente
5. Clique em **"Logs"** ou **"Function Logs"**
6. Filtre por:
   - `[API]` - logs das requisições
   - `[MAPPING]` - logs de mapeamentos
   - `Error` - apenas erros

### **Via CLI (Tempo Real)**

```bash
# Instalar se não tiver
npm install -g vercel

# Ver logs em tempo real
vercel logs https://seu-projeto.vercel.app --follow

# Ou com nome do projeto
vercel logs --follow
```

### **Via Postman/Insomnia (Testar APIs)**

```bash
# Teste local primeiro
curl http://localhost:3000/api/reguladores

# Depois em produção
curl https://seu-projeto.vercel.app/api/reguladores
```

---

### Opção A: via CLI (recomendado)

1. **Instale o Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login no Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

### Opção B: via GitHub (automático)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New" → "Project"**
3. Selecione **"Import Git Repository"**
4. Selecione seu repositório `Consulta-Concorrente`
5. Clique em **"Deploy"** (Vercel detecta automaticamente!)

---

## 🔑 Passo 2: Configurar Variáveis de Ambiente

No painel do Vercel, acesse **Settings → Environment Variables** e adicione:

```
IKRO_API_BASE = https://adm.ikro.com.br/api
REQUEST_TIMEOUT = 15000
NODE_ENV = production
```

---

## ✨ Passo 3: Testar Localmente (opcional)

Para testar a estrutura Vercel localmente:

```bash
# Instalar dependências
npm install

# Rodar localmente (simula Vercel)
vercel dev
```

Acesse: `http://localhost:3000`

---

## 🌐 Resultado Final

Após deploy no Vercel, você terá:

- **Frontend**: `https://seu-projeto.vercel.app/`
- **API**: `https://seu-projeto.vercel.app/api/reguladores`
- **Estáticos**: `https://seu-projeto.vercel.app/public/mappings/`

---

## ⚙️ O que mudou no código?

### `api/index.js` - Arquitetura Serverless

**ANTES:** Tentava carregar tudo na inicialização
```javascript
// ❌ Não funciona em Vercel
await initializeCache()  // timeout!
```

**AGORA:** Fetch under-demand (mais rápido)
```javascript
// ✅ Funciona em Vercel
app.get("/api/reguladores", async (req, res) => {
  const reguladores = await ikroProvider.fetchIkroReguladores();
  res.json(reguladores);
});
```

**Vantagens:**
- ✅ Zero tempo de inicialização
- ✅ Sem 503 Service Unavailable
- ✅ Escalável (cada requisição é independente)
- ✅ Funciona em cold starts

---

## 🛑 Problemas Comuns

### "Cannot find module 'providers'"
- ✅ Já resolvido! Paths estão corretos em `api/index.js`

### "Erro 404 ao carregar dados"
- Verificar se variáveis de ambiente estão configuradas no Vercel
- Verificar se IKRO/NOTUS APIs estão acessíveis

### "CORS error"
- Se APIs externas bloquearem requests do Vercel, você pode:
  - Usar um proxy CORS: `https://corsproxy.io/?URL`
  - Ou manter o projeto em Railway (como estava)

---

## 📝 Próximos Passos

1. ✅ Commit e push (já feito!)
2. ⏭️ Deploy no Vercel (escolha Opção A ou B acima)
3. ⏭️ Testar em produção
4. ⏭️ Atualizar seu README com novo domínio

---

## 💬 Dúvidas?

Se precisar voltar para Railway, é fácil! Os arquivos estão lá. Ou se houver problemas no Vercel, podemos ajustar.

**Boa sorte! 🚀**
