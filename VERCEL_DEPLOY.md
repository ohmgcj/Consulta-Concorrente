# 📦 Guia de Deploy no Vercel

Seu projeto foi reestruturado para funcionar com **Vercel** (serverless) ao invés de Railway.

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

## 🚀 Passo 1: Conectar ao Vercel

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

### `api/index.js` (era `server.js`)

✅ **Agora exporta o app Express** para Vercel:
```javascript
export default app;
```

✅ **Paths ajustados**:
- Arquivos estáticos: `../public` ao invés de `.`
- Providers/services: `./providers` e `./services` (mesmo nível)

✅ **Inicialização lazy** (sob demanda):
- Cache inicia na primeira requisição, não no startup
- Evita timeouts em serverless

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
