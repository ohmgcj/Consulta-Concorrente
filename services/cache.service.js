// =================================================================
// services/cache.service.js
// Gerencia cache em memória dos dados
// Implementa padrão Singleton
// =================================================================

/**
 * Serviço de Cache em Memória
 * Singleton que gerencia dados cacheados do backend
 */
class CacheService {
  constructor() {
    this.cache = {
      reguladores: null,
      notusProducts: null,
    }
    this.status = {
      reguladores: false,
      notusProducts: false,
    }
  }

  /**
   * Armazena produtos NOTUS em cache
   * @param {Array} data - Array de produtos NOTUS
   */
  setNotusProducts(data) {
    this.cache.notusProducts = data;
    this.status.notusProducts = true;
    console.log("[CACHE] Produtos NOTUS armazenados em memória");
  }

  /**
   * Recupera produtos NOTUS do cache
   * @returns {Array|null} Produtos ou null se não carregados
   */
  getNotusProducts() {
    return this.cache.notusProducts;
  }

  /**
   * Armazena reguladores IKRO em cache
   * @param {Array} data - Array de reguladores
   */
  setReguladores(data) {
    this.cache.reguladores = data;
    this.status.reguladores = true;
    console.log("[CACHE] Reguladores armazenados em memória");
  }

  /**
   * Recupera reguladores IKRO do cache
   * @returns {Array|null} Reguladores ou null se não carregados
   */
  getReguladores() {
    return this.cache.reguladores;
  }

  /**
   * Verifica se uma chave de cache está pronta
   * @param {string} key - Nome da chave ("reguladores" ou "notusProducts")
   * @returns {boolean} true se cache está carregado
   */
  isReady(key = "reguladores") {
    return this.status[key] === true;
  }

  /**
   * Limpa cache específico
   * @param {string} key - Chave a limpar
   */
  clear(key = "reguladores") {
    this.cache[key] = null;
    this.status[key] = false;
    console.log(`[CACHE] Cache '${key}' limpo`);
  }

  /**
   * Limpa todo o cache
   */
  clearAll() {
    Object.keys(this.cache).forEach((key) => {
      this.cache[key] = null;
      this.status[key] = false;
    });
    console.log("[CACHE] Todo cache limpo");
  }
}

// Exportar singleton
export default new CacheService();
