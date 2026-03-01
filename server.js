// =================================================================
// server.js
// Servidor Express: Roteamento, Orquestração e Cache
// Conecta frontend (js/api/backend.api.js) com providers externos
// =================================================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Imports dos providers e serviços
import * as ikroProvider from "./providers/ikro.provider.js";
import * as notusProvider from "./providers/notus.provider.js";
import cacheService from "./services/cache.service.js";
import mappingService from "./services/mapping.service.js";

// --- CONFIGURAÇÕES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

/**
 * Inicializa cache populando dados de APIs externas
 * Executado no startup do servidor
 * @async
 * @throws {Error} Se falhar buscar dados de IKRO ou NOTUS
 */
async function initializeCache() {
  try {
    const reguladores = await ikroProvider.fetchIkroReguladores();
    cacheService.setReguladores(reguladores);
    // Inicializa cache NOTUS
    const notusProducts = await notusProvider.fetchNotusProducts();
    cacheService.setNotusProducts(notusProducts);
  } catch (error) {
    console.error("[SERVER] ERRO ao inicializar cache:", error.message);
  }
}

// --- ROTAS IKRO ---

/**
 * GET /api/reguladores
 * Retorna lista de reguladores do cache (populado no startup)
 * @route GET /api/reguladores
 * @returns {Array} Array de reguladores IKRO ou erro 503 se cache não pronto
 */
app.get("/api/reguladores", (req, res) => {
  if (cacheService.isReady("reguladores")) {
    res.json(cacheService.getReguladores());
  } else {
    res.status(503).json({
      message: "O servidor está preparando os dados. Tente novamente em alguns segundos.",
    });
  }
});

/**
 * GET /api/regulador-detalhes
 * Busca detalhes + aplicações de um regulador específico
 * @route GET /api/regulador-detalhes?grupo=40201&item=0001
 * @param {string} grupo - Código do grupo (obrigatório, dígitos)
 * @param {string} item - Código do item (obrigatório, dígitos)
 * @returns {Object} {detalhe: Array, aplicacao: Array}
 */
app.get("/api/regulador-detalhes", async (req, res) => {
  const { grupo, item } = req.query;

  if (!grupo || !item) {
    return res.status(400).json({ message: "Grupo e item são obrigatórios" });
  }

  // Validação básica: grupo e item devem ser strings numéricas
  if (!/^\d+$/.test(grupo) || !/^\d+$/.test(item)) {
    return res.status(400).json({ message: "Grupo e item devem conter apenas dígitos" });
  }

  try {
    const data = await ikroProvider.fetchIkroDetalheEAplicacao(grupo, item);
    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error.message);
    res.status(500).json({ message: "Erro ao buscar dados externos" });
  }
});

// --- ROTAS PARA NOTUS ---
// Busca mapeamento NOTUS por código
app.get("/api/notus/mapping", (req, res) => {
  const codigo = req.query.codigo;
  if (!codigo) {
    return res.status(400).json({ message: "Código é obrigatório" });
  }
  // Busca pelo campo "Código de Conversão"
  const mapping = mappingService.getMappingByProvider("notus");
  const item = mapping.find((m) => String(m["Código de Conversão"]) === String(codigo));
  if (item) {
    return res.json(item);
  } else {
    return res.status(404).json({ message: "Não encontrado" });
  }
});

// Busca todos os produtos NOTUS
app.get("/api/notus", async (req, res) => {
  try {
    const products = await notusProvider.fetchNotusProducts();
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos NOTUS", error.message);
    res.status(500).json({ message: "Erro ao buscar dados NOTUS" });
  }
});

// Busca produtos NOTUS com filtros
app.get("/api/notus/search", async (req, res) => {
  try {
    const filters = req.query;
    const filtered = await notusProvider.searchNotusProducts(filters);
    res.json(filtered);
  } catch (error) {
    console.error("Erro ao buscar produtos NOTUS com filtros", error.message);
    res.status(500).json({ message: "Erro ao buscar dados NOTUS" });
  }
});

// Produtos NOTUS mapeados (apenas opções que você tem código)
app.get("/api/notus/mapped", async (req, res) => {
  try {
    const products = await notusProvider.fetchNotusProductsMapped();
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos mapeados", error.message);
    res.status(500).json({ message: "Erro ao buscar produtos mapeados" });
  }
});

// Lacunas: produtos que NOTUS tem mas você NÃO tem código/mapeamento
// Busca produto NOTUS pelo código interno (referência de mapeamento)
app.get("/api/notus/by-mapping", (req, res) => {
  const codigoInterno = req.query.codigo;
  if (!codigoInterno) {
    return res.status(400).json({ message: "Código interno é obrigatório" });
  }
  // Busca mapeamento
  const mapping = mappingService.getMappingByProvider("notus");
  const mapItem = mapping.find(m => String(m.Produto) === String(codigoInterno));
  if (!mapItem) {
    return res.status(404).json({ message: "Não encontrado no mapping" });
  }
  // Busca produto NOTUS pelo código de conversão
  const notusProducts = cacheService.getNotusProducts();
  if (!notusProducts) {
    return res.status(503).json({ message: "Produtos NOTUS não carregados" });
  }
  const produto = notusProducts.find(p => String(p.codigo) === String(mapItem["Código de Conversão"]));
  if (produto) {
    return res.json(produto);
  } else {
    return res.status(404).json({ message: "Produto NOTUS não encontrado" });
  }
});
app.get("/api/notus/gap", async (req, res) => {
  try {
    const gapProducts = await notusProvider.fetchNotusProductsGap();
    res.json(gapProducts);
  } catch (error) {
    console.error("Erro ao analisar lacunas", error.message);
    res.status(500).json({ message: "Erro ao analisar lacunas" });
  }
});

// Info sobre mapeamentos disponíveis
app.get("/api/mappings/info", (req, res) => {
  const providers = mappingService.getAvailableProviders();
  const info = {};
  
  providers.forEach((provider) => {
    const mapping = mappingService.getMappingByProvider(provider);
    info[provider] = {
      totalItems: mapping.length,
    };
  });

  res.json(info);
});

// --- SERVIR ARQUIVOS ESTÁTICOS E INICIAR ---
app.use(express.static(__dirname));

app.listen(PORT, async () => {
  console.log(`Servidor rodando! Acesse a aplicação em http://localhost:${PORT}`);
  await initializeCache();
});
