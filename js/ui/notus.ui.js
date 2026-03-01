// js/ui/notus.ui.js
import { formatCurrency } from "../common/utils.js";

/**
 * Renderiza produto NOTUS na tela
 * @param {Object} produto - Objeto produto com estrutura NOTUS
 */
export function renderNotusProduct(produto) {
  document.getElementById('product-title').textContent = produto.codigo;
  document.getElementById('product-line').textContent = produto.linha || '-';
  document.getElementById('product-group').textContent = produto.grupo || '-';
  document.getElementById('product-item').textContent = produto.categoria || '-';
  document.getElementById('product-price').textContent = produto.preco_bruto ? formatCurrency(produto.preco_bruto) : '-';

  // Renderizar descrição como especificação
  const specElem = document.getElementById('product-specification');
  if (produto.descricao) {
    specElem.textContent = produto.descricao;
  } else {
    specElem.textContent = 'Sem descrição.';
  }

  // Limpar aplicações
  const appElem = document.getElementById('product-application');
  appElem.innerHTML = '';
  if (produto.montadora || produto.modelo) {
    const li = document.createElement('li');
    li.textContent = `${produto.montadora} - ${produto.modelo}`;
    appElem.appendChild(li);
  } else {
    appElem.innerHTML = '<li>Sem aplicações cadastradas.</li>';
  }

  // Renderizar imagem
  const imgElem = document.getElementById('product-image');
  const imgPlaceholder = document.getElementById('image-placeholder');
  if (produto.imagem) {
    // Remove './' do início se existir para construir URL correta
    const imagePath = produto.imagem.startsWith('./') 
      ? produto.imagem.substring(2) 
      : produto.imagem;
    imgElem.src = `https://catalogo.notus.ind.br/${imagePath}`;
    imgElem.classList.remove('hidden');
    imgPlaceholder.classList.add('hidden');
  } else {
    imgElem.classList.add('hidden');
    imgPlaceholder.classList.remove('hidden');
  }
}

/**
 * Exibe mensagem de status para NOTUS
 * @param {string} msg - Mensagem a exibir
 */
export function showNotusStatus(msg) {
  document.getElementById('notus-status-message').textContent = msg;
}
// =====================================================================
// FUNCIONALIDADES DE GAPS DE MAPEAMENTO (Oportunidades de Desenvolvimento)
// =====================================================================

/**
 * Renderiza a tabela de gaps com paginação
 * @param {Object} dados - {itens: Array, total: number, paginas: number, pagina: number, stats: Object}
 */
export function renderGapsAnalysisTable(dados) {
  const container = document.getElementById('gaps-container');
  const { itens, total, paginas, pagina, stats } = dados;

  if (total === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-6">Nenhuma lacuna de mapeamento. Catálogo em dia! ✓</p>';
    return;
  }

  // Estatísticas
  const percentual = stats.percentualCobertura || 0;
  const statsHtml = `
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-blue-50 p-3 rounded-lg text-center border-l-4 border-blue-500">
        <div class="text-lg font-bold text-blue-600">${stats.totalNotus}</div>
        <div class="text-xs text-gray-600">Produtos NOTUS</div>
      </div>
      <div class="bg-green-50 p-3 rounded-lg text-center border-l-4 border-green-500">
        <div class="text-lg font-bold text-green-600">${stats.totalMapeados}</div>
        <div class="text-xs text-gray-600">Mapeados</div>
      </div>
      <div class="bg-red-50 p-3 rounded-lg text-center border-l-4 border-red-500">
        <div class="text-lg font-bold text-red-600">${stats.totalLacunas}</div>
        <div class="text-xs text-gray-600">Lacunas</div>
      </div>
      <div class="bg-purple-50 p-3 rounded-lg text-center border-l-4 border-purple-500">
        <div class="text-lg font-bold text-purple-600">${percentual}%</div>
        <div class="text-xs text-gray-600">Cobertura</div>
      </div>
    </div>
  `;

  // Tabela
  const tableHtml = `
    <div class="overflow-x-auto border rounded-lg">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 border-b">
          <tr>
            <th class="px-4 py-2 text-left font-semibold w-20">Código</th>
            <th class="px-4 py-2 text-left font-semibold">Descrição</th>
            <th class="px-4 py-2 text-left font-semibold w-24">Linha</th>
            <th class="px-4 py-2 text-left font-semibold w-24">Grupo</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map((gap, idx) => `
            <tr class="border-b hover:bg-blue-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
              <td class="px-4 py-2 font-mono font-bold text-blue-600">${gap.codigo_notus}</td>
              <td class="px-4 py-2 text-gray-700">${gap.descricao || '—'}</td>
              <td class="px-4 py-2 text-gray-600 text-xs">${gap.linha || '—'}</td>
              <td class="px-4 py-2 text-gray-600 text-xs">${gap.grupo || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Paginação
  const paginationHtml = paginas > 1 ? `
    <div class="flex justify-between items-center mt-4 text-sm">
      <div class="text-gray-600">
        Página <strong>${pagina}</strong> de <strong>${paginas}</strong> (<strong>${total}</strong> lacunas)
      </div>
      <div class="flex gap-2">
        <button class="gap-prev-btn px-3 py-1 border rounded hover:bg-gray-100 transition ${pagina === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${pagina === 1 ? 'disabled' : ''}>
          ← Anterior
        </button>
        <button class="gap-next-btn px-3 py-1 border rounded hover:bg-gray-100 transition ${pagina === paginas ? 'opacity-50 cursor-not-allowed' : ''}" ${pagina === paginas ? 'disabled' : ''}>
          Próximo →
        </button>
      </div>
    </div>
  ` : '';

  container.innerHTML = statsHtml + tableHtml + paginationHtml;

  // Listeners de paginação
  const prevBtn = document.querySelector('.gap-prev-btn');
  const nextBtn = document.querySelector('.gap-next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (pagina > 1) {
        window.dispatchEvent(new CustomEvent('gaps-paginate', { detail: { pagina: pagina - 1 } }));
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (pagina < paginas) {
        window.dispatchEvent(new CustomEvent('gaps-paginate', { detail: { pagina: pagina + 1 } }));
      }
    });
  }
}

/**
 * Renderiza filtros para gaps
 * @param {Function} onFilterChange - Callback com os filtros aplicados
 */
export function renderGapsAnalysisFilters(onFilterChange = null) {
  const container = document.getElementById('gaps-filters');
  
  const html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-gray-50 p-4 rounded-lg border">
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">🔍 Buscar Código ou Descrição</label>
        <input 
          type="text" 
          id="gaps-search-codigo" 
          placeholder="Ex: AQ-10, sensor..."
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">📂 Filtrar por Linha/Categoria</label>
        <input 
          type="text" 
          id="gaps-filter-categoria"
          placeholder="Ex: Motores"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">↕ Ordenar por</label>
        <select id="gaps-ordenar" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm">
          <option value="codigo">Código (A-Z)</option>
          <option value="descricao">Descrição (A-Z)</option>
          <option value="preco">Preço (Menor)</option>
        </select>
      </div>
    </div>
  `;

  container.innerHTML = html;

  if (onFilterChange) {
    const codigoInput = document.getElementById('gaps-search-codigo');
    const categoriaInput = document.getElementById('gaps-filter-categoria');
    const ordenarSelect = document.getElementById('gaps-ordenar');

    const triggerFilter = () => {
      onFilterChange({
        codigo: codigoInput.value,
        categoria: categoriaInput.value,
        ordenar: ordenarSelect.value,
        pagina: 1
      });
    };

    codigoInput.addEventListener('input', triggerFilter);
    categoriaInput.addEventListener('input', triggerFilter);
    ordenarSelect.addEventListener('change', triggerFilter);
  }
}