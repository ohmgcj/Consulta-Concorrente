// =================================================================
// providers/ikro.provider.js
// Responsável apenas por buscar dados da IKRO
// Abstrai chamadas HTTP para APIs externas IKRO
// =================================================================

import axios from "axios";

// URLs base da IKRO (via variáveis de ambiente)
const IKRO_BASE = process.env.IKRO_API_BASE || "https://adm.ikro.com.br/api";
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || "15000");

const URLS = {
  BASE: IKRO_BASE,
  REGULADORES: `${IKRO_BASE}/produtos?filters[descr_linha][$eq]=REGULADORES%20DE%20TENS%C3%83O`,
  DETALHES: `${IKRO_BASE}/produto-conjuntos`,
  APLICACAO: `${IKRO_BASE}/aplicacao-produtos`,
};

// Cliente Axios com timeout
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: {
    'User-Agent': 'IkroApiTest/1.0.0'
  }
});

/**
 * Busca com suporte a paginação automática
 * @async
 * @param {string} baseUrl - URL base com filtros
 * @returns {Promise<Array>} Array consolidado de todos os produtos
 * @private
 */
async function fetchWithPagination(baseUrl) {
  let products = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const url = `${baseUrl}&pagination[page]=${page}&pagination[pageSize]=100&populate=imagem`;
    const response = await axiosInstance.get(url);

    if (response.data?.data?.length > 0) {
      products.push(...response.data.data);
    }

    if (page === 1) {
      pageCount = response.data?.meta?.pagination?.pageCount || 1;
    }

    page++;
  }

  return products;
}

/**
 * Busca reguladores de tensão com paginação automática
 * @async
 * @returns {Promise<Array>} Array de reguladores com estrutura IKRO (id, attributes)
 * @throws {Error} Se falhar a requisição com IKRO
 */
export async function fetchIkroReguladores() {
  console.log("[IKRO] Iniciando carregamento de reguladores...");

  try {
    const products = await fetchWithPagination(URLS.REGULADORES);
    console.log(`[IKRO] ${products.length} reguladores carregados.`);
    return products;
  } catch (error) {
    console.error("[IKRO] ERRO ao buscar reguladores:", error.message);
    throw error;
  }
}

/**
 * Busca detalhes de um produto específico (alternadores, referências)
 * @async
 * @param {string} grupo - Código do grupo (ex: "40103")
 * @param {string} item - Código do item (ex: "0234")
 * @returns {Promise<Array>} Array de detalhes com alternadores
 * @throws {Error} Se falhar a requisição
 */
export async function fetchIkroDetalhes(grupo, item) {
  console.log(`[IKRO] Buscando detalhes para grupo=${grupo}, item=${item}`);

  try {
    const url = `${URLS.DETALHES}?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;
    const response = await axiosInstance.get(url);
    return response.data?.data || [];
  } catch (error) {
    console.error("[IKRO] ERRO ao buscar detalhes:", error.message);
    throw error;
  }
}

/**
 * Busca aplicações automotivas de um produto
 * @async
 * @param {string} grupo - Código do grupo (ex: "40201")
 * @param {string} item - Código do item (ex: "0001")
 * @returns {Promise<Array>} Array de aplicações (marca, modelo, motor, etc)
 * @throws {Error} Se falhar a requisição
 */
export async function fetchIkroAplicacao(grupo, item) {
  console.log(`[IKRO] Buscando aplicações para grupo=${grupo}, item=${item}`);

  try {
    const url = `${URLS.APLICACAO}?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;
    const response = await axiosInstance.get(url);
    return response.data?.data || [];
  } catch (error) {
    console.error("[IKRO] ERRO ao buscar aplicações:", error.message);
    throw error;
  }
}

/**
 * Busca detalhes e aplicações simultaneamente (Promise.all)
 * @async
 * @param {string} grupo - Código do grupo
 * @param {string} item - Código do item
 * @returns {Promise<Object>} Objeto {detalhe: Array, aplicacao: Array}
 * @throws {Error} Se qualquer requisição falhar
 */
export async function fetchIkroDetalheEAplicacao(grupo, item) {
  console.log(`[IKRO] Buscando detalhes + aplicações para grupo=${grupo}, item=${item}`);

  try {
    const [detalhe, aplicacao] = await Promise.all([
      fetchIkroDetalhes(grupo, item),
      fetchIkroAplicacao(grupo, item),
    ]);

    return { detalhe, aplicacao };
  } catch (error) {
    console.error("[IKRO] ERRO ao buscar detalhes + aplicações:", error.message);
    throw error;
  }
}