// =================================================================
// providers/ikro.provider.js
// Responsável apenas por buscar dados da IKRO
// =================================================================

import axios from "axios";

// URLs base da IKRO
const URLS = {
  BASE: "https://adm.ikro.com.br/api",
  REGULADORES: "https://adm.ikro.com.br/api/produtos?filters[descr_linha][$eq]=REGULADORES%20DE%20TENS%C3%83O",
  DETALHES: "https://adm.ikro.com.br/api/produto-conjuntos",
  APLICACAO: "https://adm.ikro.com.br/api/aplicacao-produtos",
};

// Função auxiliar para buscar com paginação
async function fetchWithPagination(baseUrl) {
  let products = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const url = `${baseUrl}&pagination[page]=${page}&pagination[pageSize]=100&populate=imagem`;
    const response = await axios.get(url);

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

// Busca reguladores com paginação
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

// Busca detalhes de um produto específico
export async function fetchIkroDetalhes(grupo, item) {
  console.log(`[IKRO] Buscando detalhes para grupo=${grupo}, item=${item}`);

  try {
    const url = `${URLS.DETALHES}?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;
    const response = await axios.get(url);
    return response.data?.data || [];
  } catch (error) {
    console.error("[IKRO] ERRO ao buscar detalhes:", error.message);
    throw error;
  }
}

// Busca aplicações de um produto específico
export async function fetchIkroAplicacao(grupo, item) {
  console.log(`[IKRO] Buscando aplicações para grupo=${grupo}, item=${item}`);

  try {
    const url = `${URLS.APLICACAO}?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;
    const response = await axios.get(url);
    return response.data?.data || [];
  } catch (error) {
    console.error("[IKRO] ERRO ao buscar aplicações:", error.message);
    throw error;
  }
}

// Busca detalhes e aplicações simultaneamente
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