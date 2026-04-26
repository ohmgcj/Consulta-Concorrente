// js/common/utils.js
export function formatCurrency(value) {
  if (!value) return '-';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
/**
 * Gerencia histórico de buscas no localStorage
 * Mantém as últimas 5 buscas
 */
export const searchHistory = {
  KEY: 'ikro_search_history',
  MAX_ITEMS: 5,

  /**
   * Adiciona uma busca ao histórico
   * @param {string} code - Código buscado
   */
  add(code) {
    if (!code || code.trim() === '') return;
    const history = this.get();
    const cleaned = code.trim().toUpperCase();
    
    // Remove duplicatas (coloca no topo)
    const filtered = history.filter(item => item !== cleaned);
    
    // Adiciona no início
    const updated = [cleaned, ...filtered].slice(0, this.MAX_ITEMS);
    localStorage.setItem(this.KEY, JSON.stringify(updated));
  },

  /**
   * Retorna histórico completo
   * @returns {Array<string>}
   */
  get() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Limpa o histórico
   */
  clear() {
    localStorage.removeItem(this.KEY);
  }
};