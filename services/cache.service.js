// =================================================================
// services/cache.service.js
// Gerencia cache dos dados em memória
// =================================================================

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

  // Setter para cache de produtos NOTUS
  setNotusProducts(data) {
    this.cache.notusProducts = data;
    this.status.notusProducts = true;
    console.log("[CACHE] Produtos NOTUS armazenados em memória");
  }

  // Getter para cache de produtos NOTUS
  getNotusProducts() {
    return this.cache.notusProducts;
  }

  // Setter para cache de reguladores
  setReguladores(data) {
    this.cache.reguladores = data;
    this.status.reguladores = true;
    console.log("[CACHE] Reguladores armazenados em memória");
  }

  // Getter para cache de reguladores
  getReguladores() {
    return this.cache.reguladores;
  }

  // Verifica se cache está pronto
  isReady(key = "reguladores") {
    return this.status[key] === true;
  }

  // Limpar cache específico
  clear(key = "reguladores") {
    this.cache[key] = null;
    this.status[key] = false;
    console.log(`[CACHE] Cache '${key}' limpo`);
  }

  // Limpar tudo
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
