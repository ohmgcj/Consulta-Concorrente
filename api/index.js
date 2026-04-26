// =================================================================
// api/index.js
// Servidor Express: Roteamento, Orquestração e Cache
// Conecta frontend com providers externos
// Adaptado para Vercel Serverless
// =================================================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Imports dos providers e serviços
import * as ikroProvider from "./providers/ikro.provider.js";
import * as notusProvider from "./providers/notus.provider.js";
import cacheService from "./services/cache.service.js";
import mappingService from "./services/mapping.service.js";
import gapAnalysisService from "./services/gap-analysis.service.js";

// --- CONFIGURAÇÕES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware para aceitar JSON
app.use(express.json());

// --- ROTAS IKRO ---

/**
 * GET /api/reguladores
 * Busca lista de reguladores diretamente da API IKRO
 * (Com cache em memória para múltiplas requisições na mesma função)
 * @route GET /api/reguladores
 * @returns {Array} Array de reguladores IKRO
 */
app.get("/api/reguladores", async (req, res) => {
  try {
    console.log("[API-REQ] GET /api/reguladores");
    
    // Se já tem em cache nesta execução, retorna rápido
    if (cacheService.isReady("reguladores")) {
      const data = cacheService.getReguladores();
      console.log(`[API] ✅ Reguladores: ${data.length} itens (do cache)`);
      return res.json(data);
    }
    
    // Se não, busca da API
    console.log("[API] Buscando reguladores da API IKRO...");
    const reguladores = await ikroProvider.fetchIkroReguladores();
    cacheService.setReguladores(reguladores);
    
    console.log(`[API] ✅ Reguladores: ${reguladores.length} itens retornados`);
    res.json(reguladores);
  } catch (error) {
    console.error("[API] ❌ Erro ao buscar reguladores:", error.message);
    res.status(500).json({ 
      message: "Erro ao buscar reguladores",
      error: error.message
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
    console.log("[API-REQ] GET /api/notus");
    
    if (cacheService.isReady("notusProducts")) {
      const data = cacheService.getNotusProducts();
      console.log(`[API] ✅ NOTUS: ${data.length} itens (do cache)`);
      return res.json(data);
    }
    
    console.log("[API] Buscando produtos NOTUS da API...");
    const notusProducts = await notusProvider.fetchNotusProducts();
    cacheService.setNotusProducts(notusProducts);
    
    console.log(`[API] ✅ NOTUS: ${notusProducts.length} itens retornados`);
    res.json(notusProducts);
  } catch (error) {
    console.error("[API] ❌ Erro ao buscar NOTUS:", error.message);
    res.status(500).json({ 
      message: "Erro ao buscar produtos NOTUS",
      error: error.message
    });
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

/**
 * GET /api/notus/gaps-analysis
 * Retorna lacunas de mapeamento (produtos NOTUS não mapeados)
 * @route GET /api/notus/gaps-analysis?pagina=1&itemsPorPagina=10&codigo=AQ&ordenar=codigo
 * @param {number} pagina - Página (default: 1)
 * @param {number} itemsPorPagina - Itens por página (default: 10)
 * @param {string} codigo - Filtro de busca por código ou descrição
 * @param {string} categoria - Filtro por categoria/linha
 * @param {string} ordenar - Ordenação: 'codigo', 'descricao', 'preco' (default: 'codigo')
 * @returns {Object} {itens, total, paginas, pagina, itemsPorPagina, stats}
 */
app.get("/api/notus/gaps-analysis", async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const itemsPorPagina = parseInt(req.query.itemsPorPagina) || 10;
    const codigo = req.query.codigo || '';
    const categoria = req.query.categoria || '';
    const ordenar = req.query.ordenar || 'codigo';

    // IMPORTANTE: Analisar gaps com dados atualizados
    console.log("[API] Analisando gaps de mapeamento NOTUS...");
    const notusProducts = await notusProvider.fetchNotusProducts();
    const notusMapping = mappingService.getMappingByProvider('notus');
    gapAnalysisService.analisarGaps(notusProducts, notusMapping);

    const filtros = { codigo, categoria, ordenar };
    const resultado = gapAnalysisService.obterGaps(pagina, itemsPorPagina, filtros);
    const stats = gapAnalysisService.obterEstatisticas();

    console.log(`[API] ✅ Gaps retornados: ${resultado.total} itens`);
    res.json({
      ...resultado,
      stats
    });
  } catch (error) {
    console.error("[API] ❌ Erro ao analisar gaps:", error.message);
    res.status(500).json({ 
      message: "Erro ao analisar lacunas",
      error: error.message
    });
  }
});

/**
 * GET /api/notus/gaps-export
 * Exporta lacunas em formato CSV
 * @route GET /api/notus/gaps-export
 * @route GET /api/notus/gaps-export?categoria=Motores
 * @param {string} categoria - Filtro de categoria (opcional)
 * @returns {string} CSV
 */
app.get("/api/notus/gaps-export", (req, res) => {
  const categoria = req.query.categoria || null;
  const csv = gapAnalysisService.exportarCSV(categoria);
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="notus-gaps-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
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

// --- SERVIR ARQUIVOS ESTÁTICOS ---
// Em Vercel, a pasta 'public' é servida como raiz
app.use(express.static(path.join(__dirname, '../public')));

// Fallback para SPA: redireciona rotas não encontradas para index.html
app.use((req, res) => {
  // Não serve index.html para rotas /api, apenas para frontend
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).json({ message: "Rota não encontrada" });
  }
});

let cacheReady = false;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor rodando. APIs sob demanda.",
    environment: NODE_ENV
  });
});

// Para desenvolvimento local
if (NODE_ENV === 'development') {
  console.log(`\n[SERVER] ========================================`);
  console.log(`[SERVER] Iniciando em ${NODE_ENV}`);
  console.log(`[SERVER] Porta: ${PORT}`);
  console.log(`[SERVER] URL: http://localhost:${PORT}`);
  console.log(`[SERVER] ========================================\n`);
  
  app.listen(PORT, () => {
    console.log(`[SERVER] ✅ Servidor pronto para requisições\n`);
  });
}

// Exportar para Vercel
export default app;
