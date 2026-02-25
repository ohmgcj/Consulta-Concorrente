import axios from "axios";
import mappingService from "../services/mapping.service.js";

const NOTUS_URL = "https://catalogo.notus.ind.br/conversor/produtos.json";
import cacheService from "../services/cache.service.js";

// Carrega todos os produtos da NOTUS
export async function fetchNotusProducts() {
  // Verifica cache
  if (cacheService.isReady("notusProducts")) {
    return cacheService.getNotusProducts();
  }

  console.log("[NOTUS] Iniciando carregamento de produtos...");
  try {
    const response = await axios.get(NOTUS_URL);
    console.log(`[NOTUS] ${response.data.length} produtos carregados.`);
    cacheService.setNotusProducts(response.data);
    return response.data;
  } catch (error) {
    console.error("[NOTUS] ERRO ao buscar produtos:", error.message);
    throw error;
  }
}

// Busca produtos NOTUS mapeados para meus códigos
export async function fetchNotusProductsMapped() {
  console.log("[NOTUS] Buscando produtos mapeados...");

  try {
    const allProducts = await fetchNotusProducts();
    const mapping = mappingService.getMappingByProvider("notus");

    if (mapping.length === 0) {
      console.warn("[NOTUS] Nenhum mapeamento encontrado para NOTUS");
      return [];
    }

    // Cria um Set com todos os códigos de conversão do mapping
    const mappedCodes = new Set(mapping.map(m => String(m["Código de Conversão"])));

    // Filtra apenas produtos que têm mapeamento pelo campo 'codigo'
    const mapped = allProducts.filter(product => mappedCodes.has(String(product.codigo)));

    console.log(`[NOTUS] ${mapped.length} produtos mapeados de ${allProducts.length}`);
    return mapped;
  } catch (error) {
    console.error("[NOTUS] ERRO ao buscar produtos mapeados:", error.message);
    throw error;
  }
}

// Encontra lacunas: produtos que NOTUS tem mas você não tem mapeamento
export async function fetchNotusProductsGap() {
  console.log("[NOTUS] Analisando lacunas de catálogo...");

  try {
    const allProducts = await fetchNotusProducts();
    const mapping = mappingService.getMappingByProvider("notus");

    // Cria um Set com todos os códigos de conversão do mapping
    const mappedCodes = new Set(mapping.map(m => String(m["Código de Conversão"])));

    // Filtra produtos que NÃO têm mapeamento pelo campo 'codigo'
    const gapProducts = allProducts.filter(product => !mappedCodes.has(String(product.codigo)));

    console.log(`[NOTUS] ${gapProducts.length} produtos sem mapeamento de ${allProducts.length}`);
    return gapProducts;
  } catch (error) {
    console.error("[NOTUS] ERRO ao analisar lacunas:", error.message);
    throw error;
  }
}

// Busca produto NOTUS específico por ID
export async function fetchNotusProductById(id) {
  console.log(`[NOTUS] Buscando produto ID ${id}...`);

  try {
    const products = await fetchNotusProducts();
    return products.find((p) => String(p.id) === String(id));
  } catch (error) {
    console.error("[NOTUS] ERRO ao buscar produto por ID:", error.message);
    throw error;
  }
}

// Busca produtos NOTUS por filtros múltiplos
export async function searchNotusProducts(filters = {}) {
  console.log("[NOTUS] Buscando produtos com filtros...", filters);

  try {
    const products = await fetchNotusProducts();

    return products.filter((product) => {
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue; // Pula filtros vazios
        if (String(product[key]) !== String(value)) return false;
      }
      return true;
    });
  } catch (error) {
    console.error("[NOTUS] ERRO ao buscar com filtros:", error.message);
    throw error;
  }
}