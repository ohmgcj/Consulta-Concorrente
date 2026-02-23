// Busca produto Notus na API usando Código de Conversão do mapeamento
export async function fetchNotusProductByProduto(produto) {
  // Busca código de conversão no mapeamento
  const codigoConversao = mappingService.findCodigoConversaoByProduto("notus", produto);
  if (!codigoConversao) {
    console.warn(`[NOTUS] Código de conversão não encontrado para produto: ${produto}`);
    return null;
  }
  // Busca produto na API
  try {
    const products = await fetchNotusProducts();
    // Busca pelo campo correspondente
    const found = products.find((p) => String(p.codigo) === String(codigoConversao));
    if (!found) {
      console.warn(`[NOTUS] Produto não encontrado na API para código: ${codigoConversao}`);
    }
    return found || null;
  } catch (error) {
    console.error("[NOTUS] ERRO ao buscar produto por código de conversão:", error.message);
    throw error;
  }
}
import axios from "axios";
import mappingService from "../services/mapping.service.js";

const NOTUS_URL = "https://catalogo.notus.ind.br/conversor/produtos.json";

// Carrega todos os produtos da NOTUS
export async function fetchNotusProducts() {
  console.log("[NOTUS] Iniciando carregamento de produtos...");

  try {
    const response = await axios.get(NOTUS_URL);
    console.log(`[NOTUS] ${response.data.length} produtos carregados.`);
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
      return allProducts;
    }

    // Filtra apenas produtos que têm mapeamento
    const mapped = allProducts.filter((product) =>
      mapping.some((m) => String(m.notus_id) === String(product.id))
    );

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

    const mappedIds = new Set(mapping.map((m) => String(m.notus_id)));
    const gapProducts = allProducts.filter((product) => !mappedIds.has(String(product.id)));

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