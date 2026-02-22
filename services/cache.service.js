// =================================================================
// services/cache.service.js
// Gerencia cache dos dados em memória
// =================================================================

class CacheService {
  constructor() {
    this.cache = {
      reguladores: null,
    };
    this.status = {
      reguladores: false, // flag para indicar se o cache está pronto
    };
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
