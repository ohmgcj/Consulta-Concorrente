// =================================================================
// server.js
// Roteamento e configuração Express
// =================================================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Imports dos providers e serviços
import * as ikroProvider from "./providers/ikro.provider.js";
import cacheService from "./services/cache.service.js";

// --- CONFIGURAÇÕES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// --- FUNÇÃO PARA BUSCAR E CACHEAR OS REGULADORES ---
async function initializeCache() {
  try {
    const reguladores = await ikroProvider.fetchIkroReguladores();
    cacheService.setReguladores(reguladores);
  } catch (error) {
    console.error("[SERVER] ERRO ao inicializar cache:", error.message);
  }
}

// --- ROTA PARA O FRONTEND PEGAR OS REGULADORES ---
app.get("/api/reguladores", (req, res) => {
  if (cacheService.isReady("reguladores")) {
    res.json(cacheService.getReguladores());
  } else {
    res.status(503).json({
      message: "O servidor está preparando os dados. Tente novamente em alguns segundos.",
    });
  }
});

// --- ROTA PARA DETALHES + APLICAÇÃO (com parâmetros na URL) ---
app.get("/api/regulador/:grupo/:item", async (req, res) => {
  const { grupo, item } = req.params;

  try {
    const data = await ikroProvider.fetchIkroDetalheEAplicacao(grupo, item);
    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar detalhes/aplicação", error.message);
    res.status(500).json({ message: "Erro ao buscar dados externos" });
  }
});

// --- ROTA PARA DETALHES + APLICAÇÃO (com query string) ---
app.get("/api/regulador-detalhes", async (req, res) => {
  const { grupo, item } = req.query;

  if (!grupo || !item) {
    return res.status(400).json({ message: "Grupo e item são obrigatórios" });
  }

  try {
    const data = await ikroProvider.fetchIkroDetalheEAplicacao(grupo, item);
    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error.message);
    res.status(500).json({ message: "Erro ao buscar dados externos" });
  }
});

// --- SERVIR ARQUIVOS ESTÁTICOS E INICIAR ---
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Servidor rodando! Acesse a aplicação em http://localhost:${PORT}`);
  initializeCache();
});
