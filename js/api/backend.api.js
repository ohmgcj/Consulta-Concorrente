// =================================================================
// js/api/backend.api.js
// Cliente HTTP para comunicação com o backend (servidor Express)
// Abstrai chamadas REST para endpoints /api/*
// =================================================================

/**
 * Busca lista de produtos reguladores do IKRO (em cache no servidor)
 * @async
 * @returns {Promise<Array>} Array de produtos com estrutura IKRO
 * @throws {Error} Se falhar a requisição ao servidor
 * @example
 * const products = await fetchProducts();
 */
export async function fetchProducts() {
  const res = await fetch('/api/reguladores');
  if (!res.ok) throw new Error('Erro ao buscar produtos IKRO');
  return res.json();
}

/**
 * Busca mapeamento local entre códigos internos e códigos IKRO
 * @async
 * @returns {Promise<Array>} Array de objetos: [{meu_codigo, codigo_api}, ...]
 * @throws {Error} Se falhar a requisição ao servidor
 * @example
 * const mapping = await fetchMapping();
 */
export async function fetchMapping() {
  const res = await fetch('/mappings/ikro.mapping.json');
  if (!res.ok) throw new Error('Erro ao buscar mapeamento IKRO');
  return res.json();
}

/**
 * Busca mapeamento local entre códigos internos e códigos NOTUS
 * @async
 * @returns {Promise<Array>} Array de objetos: [{Produto, "Código de Conversão"}, ...]
 * @throws {Error} Se falhar a requisição ao servidor
 * @example
 * const mapping = await fetchNotusMapping();
 * // mapping[0] => {Produto: "EV101001", "Código de Conversão": "EL-20736.0"}
 */
export async function fetchNotusMapping() {
  const res = await fetch('/mappings/notus.mapping.json');
  if (!res.ok) throw new Error('Erro ao buscar mapeamento NOTUS');
  return res.json();
}

/**
 * Busca detalhes e aplicações de um produto específico
 * @async
 * @param {string} grupo - Código do grupo (ex: "40201")
 * @param {string} item - Código do item (ex: "0001")
 * @returns {Promise<Object>} Objeto {detalhe: Array, aplicacao: Array}
 * @throws {Error} Se não encontrar o produto ou falhar requisição
 * @example
 * const data = await fetchApplications("40201", "0001");
 * // data.detalhe[0].attributes.alternador
 * // data.aplicacao[0].attributes.marca_aplic
 */
export async function fetchApplications(grupo, item) {
  const res = await fetch(`/api/regulador-detalhes?grupo=${grupo}&item=${item}`);
  if (!res.ok) throw new Error('Erro ao buscar aplicações IKRO');
  return res.json();
}
