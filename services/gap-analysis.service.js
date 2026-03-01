// =================================================================
// services/gap-analysis.service.js
// Analisa lacunas: produtos NOTUS não mapeados
// Compara TODOS os produtos com os mapeados
// =================================================================

/**
 * Serviço de Análise de Lacunas
 * Singleton que calcula oportunidades de desenvolvimento
 */
class GapAnalysisService {
  constructor() {
    this.allNotusProducts = [];
    this.mappedCodes = new Set();
    this.gaps = [];
  }

  /**
   * Analisa os gaps comparando todos os produtos NOTUS com o mapeamento
   * @param {Array} notusProducts - Todos os produtos do NOTUS
   * @param {Array} notusMapping - Mapeamento atual (Código de Conversão)
   */
  analisarGaps(notusProducts, notusMapping) {
    this.allNotusProducts = notusProducts || [];
    
    // Extrair todos os códigos mapeados
    this.mappedCodes = new Set(
      (notusMapping || []).map(m => String(m["Código de Conversão"]).toLowerCase())
    );

    // Filtrar produtos NOTUS que NÃO estão mapeados
    this.gaps = this.allNotusProducts
      .filter(produto => !this.mappedCodes.has(String(produto.codigo).toLowerCase()))
      .map(produto => ({
        codigo_notus: produto.codigo,
        descricao: produto.descricao || '',
        linha: produto.linha || '',
        grupo: produto.grupo || '',
        categoria: produto.categoria || '',
        preco: produto.preco_bruto || 0
      }));

    console.log(`[GAP-ANALYSIS] ${this.gaps.length} lacunas encontradas em ${notusProducts.length} produtos`);
  }

  /**
   * Obtém gaps com suporte a paginação e filtros
   * @param {number} pagina - Número da página (começa em 1)
   * @param {number} itemsPorPagina - Itens por página (default: 10)
   * @param {Object} filtros - {codigo: '', categoria: '', ordenar: 'codigo'} (opcional)
   * @returns {Object} {itens: Array, total: number, paginas: number, pagina: number}
   */
  obterGaps(pagina = 1, itemsPorPagina = 10, filtros = {}) {
    let items = [...this.gaps];

    // Filtro de busca por código
    if (filtros.codigo) {
      const searchTerm = filtros.codigo.toLowerCase();
      items = items.filter(gap => 
        gap.codigo_notus.toLowerCase().includes(searchTerm) ||
        gap.descricao.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por categoria/linha
    if (filtros.categoria) {
      items = items.filter(gap => 
        gap.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()) ||
        gap.linha.toLowerCase().includes(filtros.categoria.toLowerCase())
      );
    }

    // Ordenação
    if (filtros.ordenar === 'descricao') {
      items.sort((a, b) => a.descricao.localeCompare(b.descricao));
    } else if (filtros.ordenar === 'preco') {
      items.sort((a, b) => a.preco - b.preco);
    } else {
      // Default: alfabético por código
      items.sort((a, b) => a.codigo_notus.localeCompare(b.codigo_notus));
    }

    // Paginação
    const total = items.length;
    const paginas = Math.ceil(total / itemsPorPagina);
    const paginaValidada = Math.max(1, Math.min(pagina, paginas || 1));
    const inicio = (paginaValidada - 1) * itemsPorPagina;
    const fim = inicio + itemsPorPagina;

    return {
      itens: items.slice(inicio, fim),
      total,
      paginas,
      pagina: paginaValidada,
      itemsPorPagina
    };
  }

  /**
   * Obtém estatísticas gerais
   * @returns {Object} {total: number, porcentagem: number, mapeados: number}
   */
  obterEstatisticas() {
    return {
      totalNotus: this.allNotusProducts.length,
      totalMapeados: this.mappedCodes.size,
      totalLacunas: this.gaps.length,
      percentualCobertura: this.allNotusProducts.length > 0 
        ? Math.round((this.mappedCodes.size / this.allNotusProducts.length) * 100)
        : 0
    };
  }

  /**
   * Exporta gaps em formato CSV
   * @param {string} categoria - Filtro de categoria (opcional)
   * @returns {string} CSV formatado
   */
  exportarCSV(categoria = null) {
    let items = this.gaps;
    
    if (categoria) {
      items = items.filter(gap => 
        gap.categoria.toLowerCase().includes(categoria.toLowerCase()) ||
        gap.linha.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    const headers = ['Código NOTUS', 'Descrição', 'Linha', 'Grupo', 'Categoria', 'Preço'];
    const rows = items.map(gap => [
      gap.codigo_notus,
      `"${gap.descricao}"`,
      gap.linha,
      gap.grupo,
      gap.categoria,
      gap.preco
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Limpa todos os gaps
   */
  limpar() {
    this.allNotusProducts = [];
    this.mappedCodes.clear();
    this.gaps = [];
  }
}

export default new GapAnalysisService();
