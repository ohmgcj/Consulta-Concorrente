// =================================================================
// services/gap-tracking.service.js
// Rastreia lacunas de mapeamento (produtos NOTUS não mapeados)
// Acumula dados de buscas não encontradas
// =================================================================

/**
 * Serviço de Rastreamento de Lacunas
 * Singleton que gerencia produtos NOTUS sem mapeamento
 */
class GapTrackingService {
  constructor() {
    // Map para armazenar lacunas: chave = codigo_notus, valor = objeto gap
    this.gaps = new Map();
  }

  /**
   * Registra uma lacuna quando um código NOTUS não é encontrado
   * @param {string} codigoNotus - Código NOTUS não encontrado
   * @param {Object} produtoInfo - Informações adicionais do produto (opcional)
   */
  registrarLacuna(codigoNotus, produtoInfo = {}) {
    const codigo = String(codigoNotus).toLowerCase().trim();
    
    if (this.gaps.has(codigo)) {
      // Lacuna já existe: atualizar frequência e data
      const gap = this.gaps.get(codigo);
      gap.buscas_totais++;
      gap.ultima_busca = new Date().toISOString();
      gap.status = gap.status || 'pendente';
    } else {
      // Nova lacuna
      this.gaps.set(codigo, {
        codigo_notus: codigoNotus,
        descricao: produtoInfo.descricao || '',
        primeira_busca: new Date().toISOString(),
        ultima_busca: new Date().toISOString(),
        buscas_totais: 1,
        status: 'pendente' // pendente, revisada, mapeada
      });
    }
  }

  /**
   * Obtém todas as lacunas com suporte a paginação e filtros
   * @param {number} pagina - Número da página (começa em 1)
   * @param {number} itemsPorPagina - Itens por página (default: 10)
   * @param {Object} filtros - {status: 'pendente', ordenar: 'data'} (opcional)
   * @returns {Object} {itens: Array, total: number, paginas: number, pagina: number}
   */
  obterLacunas(pagina = 1, itemsPorPagina = 10, filtros = {}) {
    let items = Array.from(this.gaps.values());

    // Aplicar filtro de status
    if (filtros.status && filtros.status !== 'todos') {
      items = items.filter(gap => gap.status === filtros.status);
    }

    // Aplicar filtro de busca por código
    if (filtros.codigo) {
      const searchTerm = filtros.codigo.toLowerCase();
      items = items.filter(gap => 
        gap.codigo_notus.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenação
    if (filtros.ordenar === 'frequencia') {
      items.sort((a, b) => b.buscas_totais - a.buscas_totais);
    } else if (filtros.ordenar === 'data') {
      items.sort((a, b) => new Date(b.ultima_busca) - new Date(a.ultima_busca));
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
   * Atualiza o status de uma lacuna
   * @param {string} codigoNotus - Código da lacuna
   * @param {string} novoStatus - Novo status (pendente, revisada, mapeada)
   */
  atualizarStatus(codigoNotus, novoStatus) {
    const codigo = String(codigoNotus).toLowerCase().trim();
    if (this.gaps.has(codigo)) {
      const gap = this.gaps.get(codigo);
      gap.status = novoStatus;
      return true;
    }
    return false;
  }

  /**
   * Obtém uma lacuna específica
   * @param {string} codigoNotus - Código da lacuna
   * @returns {Object|null} Objeto gap ou null
   */
  obterLacuna(codigoNotus) {
    const codigo = String(codigoNotus).toLowerCase().trim();
    return this.gaps.get(codigo) || null;
  }

  /**
   * Obtém estatísticas gerais
   * @returns {Object} {total: number, pendentes: number, revisadas: number, mapeadas: number}
   */
  obterEstatisticas() {
    const values = Array.from(this.gaps.values());
    return {
      total: values.length,
      pendentes: values.filter(g => g.status === 'pendente').length,
      revisadas: values.filter(g => g.status === 'revisada').length,
      mapeadas: values.filter(g => g.status === 'mapeada').length
    };
  }

  /**
   * Exporta lacunas em formato CSV
   * @param {string} status - Filtro de status (opcional)
   * @returns {string} CSV formatado
   */
  exportarCSV(status = null) {
    let items = Array.from(this.gaps.values());
    
    if (status) {
      items = items.filter(gap => gap.status === status);
    }

    const headers = ['Código NOTUS', 'Descrição', 'Buscas', 'Status', 'Primeira Busca', 'Última Busca'];
    const rows = items.map(gap => [
      gap.codigo_notus,
      `"${gap.descricao}"`,
      gap.buscas_totais,
      gap.status,
      new Date(gap.primeira_busca).toLocaleString('pt-BR'),
      new Date(gap.ultima_busca).toLocaleString('pt-BR')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Limpa todas as lacunas (útil para testes)
   */
  limpar() {
    this.gaps.clear();
  }
}

export default new GapTrackingService();
