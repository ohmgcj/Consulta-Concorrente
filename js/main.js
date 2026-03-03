// js/main.js
import * as BackendAPI from "./api/backend.api.js";
import * as IkroUI from "./ui/ikro.ui.js";
import * as NotusUI from "./ui/notus.ui.js";
import { showElement, hideElement } from "./common/dom.js";
import { searchHistory } from "./common/utils.js";

let products = [];
let codeMapping = [];
let notusProducts = [];
let notusMapping = [];

// Estado das lacunas de mapeamento (Gaps Analysis)
let gapsState = {
  pagina: 1,
  itemsPorPagina: 10,
  codigo: '',
  categoria: '',
  ordenar: 'codigo'
};

// =====================================================================
// FUNÇÕES AUXILIARES DE FETCH COM RETRY
// =====================================================================

/**
 * Faz requisição com retry automático (para quando servidor está inicializando)
 * @async
 * @param {string} url - URL a requisitar
 * @param {number} maxRetries - Máximo de tentativas
 * @returns {Promise<any>} JSON da resposta
 * @throws {Error} Se falhar após todas tentativas
 */
async function fetchWithRetry(url, maxRetries = 3) {
  const delayMs = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      
      if (res.ok) {
        return await res.json();
      }
      
      if (res.status === 503 && attempt < maxRetries) {
        console.warn(`[FETCH] Servidor inicializando (${url}) - tentativa ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}

async function loadIkroData() {
  IkroUI.showIkroStatus("Carregando base de dados...");
  try {
    const [prod, mapping] = await Promise.all([
      BackendAPI.fetchProducts(),
      BackendAPI.fetchMapping(),
    ]);
    products = prod;
    codeMapping = mapping;
    IkroUI.showIkroStatus("Pronto para consulta.");
  } catch (err) {
    IkroUI.showIkroStatus("Erro ao carregar dados.");
    console.error(err);
  }
}

async function loadNotusData() {
  NotusUI.showNotusStatus("Carregando catálogo NOTUS...");
  try {
    const [notusData, notusMap] = await Promise.all([
      fetchWithRetry('/api/notus'),
      BackendAPI.fetchNotusMapping(),
    ]);
    notusProducts = notusData;
    notusMapping = notusMap;
    NotusUI.showNotusStatus("Pronto para consulta.");
  } catch (err) {
    NotusUI.showNotusStatus("Erro ao carregar dados.");
    console.error(err);
  }
}

// =====================================================================
// FUNÇÕES DE UI: SPINNER E HISTÓRICO
// =====================================================================

/**
 * Mostra/esconde o spinner de carregamento
 */
function showLoadingSpinner(show = true) {
  const spinner = document.getElementById("result-loading-spinner");
  const content = document.getElementById("result-content");
  
  if (show) {
    spinner.classList.remove("hidden");
    content.classList.add("hidden");
  } else {
    spinner.classList.add("hidden");
    content.classList.remove("hidden");
  }
}

/**
 * Renderiza o histórico de buscas
 */
function renderSearchHistory() {
  const history = searchHistory.get();
  const container = document.getElementById("search-history-container");
  const historyList = document.getElementById("search-history");
  
  if (history.length === 0) {
    container.classList.add("hidden");
    return;
  }
  
  container.classList.remove("hidden");
  historyList.innerHTML = "";
  
  history.forEach(code => {
    const badge = document.createElement("button");
    badge.className = "px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 border border-gray-300 font-medium";
    badge.textContent = code;
    badge.addEventListener("click", () => {
      // Refaz a busca
      const currentTab = document.getElementById("search-tab-ikro").classList.contains("border-b-[#cd9931]");
      if (currentTab) {
        document.getElementById("searchInput").value = code;
        buscarProdutoIkro();
      } else {
        document.getElementById("notusSearchInput").value = code;
        buscarProdutoNotus();
      }
    });
    historyList.appendChild(badge);
  });
}

/**
 * Limpa o histórico de buscas
 */
function clearSearchHistory() {
  searchHistory.clear();
  renderSearchHistory();
}

function buscarProdutoIkro() {
  const searchInput = document.getElementById("searchInput");
  const resultContainer = document.getElementById("result-container");
  const userInput = searchInput.value.trim();
  if (!userInput) return;

  // Mostra container
  showElement("result-container");
  showLoadingSpinner(true);

  // Adiciona ao histórico
  searchHistory.add(userInput);
  renderSearchHistory();

  // Busca imediatamente (sem delay)
  let searchTerm = userInput;
  const mappingEntry = codeMapping.find(
    (item) => String(item.meu_codigo) === userInput,
  );
  if (mappingEntry) {
    searchTerm = mappingEntry.codigo_api;
  }

  const foundProduct = products.find((product) => {
    const attrs = product.attributes;
    return (
      attrs.refer_interna === searchTerm ||
      attrs.refer_item_assoc_1 === searchTerm ||
      attrs.refer_item_assoc_2 === searchTerm ||
      attrs.refer_item_assoc_3 === searchTerm ||
      attrs.refer_item_assoc_4 === searchTerm ||
      attrs.refer_item_assoc_5 === searchTerm ||
      (attrs.imagem &&
        Array.isArray(attrs.imagem) &&
        attrs.imagem.some((img) => img.referencia === searchTerm))
    );
  });

  if (!foundProduct) {
    showLoadingSpinner(false);
    hideElement("result-container");
    IkroUI.showIkroStatus("Produto não encontrado.");
    return;
  }

  // Renderiza produto imediatamente
  IkroUI.renderIkroProduct(foundProduct.attributes);
  showLoadingSpinner(false);
  IkroUI.showIkroStatus("");

  // Carrega aplicações em background (sem bloquear UI)
  const appElem = document.getElementById("product-application");
  appElem.innerHTML = "<li class='text-gray-400 animate-pulse'>Carregando aplicações...</li>";

  // Garante que grupo e item são strings numéricas
  const grupo = String(foundProduct.grupo || "").trim();
  const item = String(foundProduct.item || "").trim();

  console.log("[DEBUG] foundProduct keys:", Object.keys(foundProduct));
  console.log("[DEBUG] grupo:", grupo, "item:", item);

  if (!grupo || !item) {
    appElem.innerHTML = "<li class='text-gray-400'>Sem aplicações cadastradas.</li>";
    return;
  }

  BackendAPI.fetchApplications(grupo, item)
    .then((data) => {
      console.log("[DEBUG] Dados de aplicações recebidos:", data);
      appElem.innerHTML = "";
      
      // Trata estrutura { detalhe, aplicacao }
      const apps = (data && data.aplicacao) ? data.aplicacao : (Array.isArray(data) ? data : []);
      
      if (apps && apps.length > 0) {
        apps.forEach((app) => {
          const li = document.createElement("li");
          // Trata ambas as estruturas: com .attributes ou direto
          const marca = app.attributes?.marca_aplic || app.marca_aplic || "-";
          const aplicacao = app.attributes?.aplicacao || app.aplicacao || "-";
          li.textContent = `${marca} – ${aplicacao}`;
          appElem.appendChild(li);
        });
      } else {
        appElem.innerHTML = "<li class='text-gray-400'>Sem aplicações cadastradas.</li>";
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar aplicações:", err);
      appElem.innerHTML = "<li class='text-gray-400'>Sem aplicações disponíveis.</li>";
    });
}

/**
 * Busca produto NOTUS por código (próprio ou mapeado)
 * Se o código for da empresa, converte usando notus.mapping.json
 */
function buscarProdutoNotus() {
  const searchInput = document.getElementById("notusSearchInput");
  const userInput = searchInput.value.trim();
  if (!userInput) return;

  // Mostra container
  showElement("result-container");
  showLoadingSpinner(true);

  // Adiciona ao histórico
  searchHistory.add(userInput);
  renderSearchHistory();

  // Busca imediatamente (sem delay)
  let searchCode = userInput;
  
  // Primeiro, tenta encontrar direto no NOTUS
  let foundProduct = notusProducts.find((product) =>
    String(product.codigo).toLowerCase() === userInput.toLowerCase()
  );

  // Se não encontrar, procura no mapeamento (código da empresa)
  if (!foundProduct) {
    const mappingEntry = notusMapping.find(
      (item) => String(item.Produto).toLowerCase() === userInput.toLowerCase()
    );
    
    if (mappingEntry) {
      searchCode = mappingEntry["Código de Conversão"];
      foundProduct = notusProducts.find((product) =>
        String(product.codigo).toLowerCase() === searchCode.toLowerCase()
      );
    }
  }

  if (!foundProduct) {
    showLoadingSpinner(false);
    hideElement("result-container");
    NotusUI.showNotusStatus("Produto não encontrado.");
    return;
  }

  // Renderiza produto imediatamente
  NotusUI.renderNotusProduct(foundProduct);
  showLoadingSpinner(false);
  NotusUI.showNotusStatus("");
}

// =====================================================================
// FUNÇÕES PARA GAPS DE MAPEAMENTO (Gap Analysis)
// =====================================================================

/**
 * Carrega e renderiza os gaps de mapeamento
 */
async function carregarGaps() {
  try {
    const resultado = await BackendAPI.fetchGapsAnalysis(gapsState);
    NotusUI.renderGapsAnalysisTable(resultado);
    
    // Adicionar listeners de paginação
    window.addEventListener('gaps-paginate', (e) => {
      gapsState.pagina = e.detail.pagina;
      carregarGaps();
    });
  } catch (err) {
    console.error("Erro ao carregar gaps:", err);
    const container = document.getElementById('gaps-container');
    if (container) {
      container.innerHTML = '<p class="text-red-500">Erro ao carregar gaps de mapeamento.</p>';
    }
  }
}

/**
 * Renderiza e configura filtros de gaps
 */
function configurarFiltrosGaps() {
  NotusUI.renderGapsAnalysisFilters((filtros) => {
    gapsState = { ...gapsState, ...filtros };
    carregarGaps();
  });
}

/**
 * Mostra a seção de gaps de mapeamento
 */
function mostrarGaps() {
  const gapsSection = document.getElementById('gaps-section');
  if (gapsSection) {
    showElement('gaps-section');
    configurarFiltrosGaps();
    carregarGaps();
  }
}

// Inicializa eventos e dados IKRO e NOTUS

document.addEventListener("DOMContentLoaded", async () => {
  // Carrega dados de ambos os provedores
  await Promise.all([loadIkroData(), loadNotusData()]);

  // Renderiza histórico de buscas
  renderSearchHistory();

  // --- EVENTOS DE HISTÓRICO ---
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearSearchHistory);
  }

  // --- EVENTOS IKRO ---
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  searchButton.addEventListener("click", buscarProdutoIkro);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarProdutoIkro();
  });

  // --- EVENTOS NOTUS ---
  const notusSearchButton = document.getElementById("notusSearchButton");
  const notusSearchInput = document.getElementById("notusSearchInput");
  notusSearchButton.addEventListener("click", buscarProdutoNotus);
  notusSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarProdutoNotus();
  });

  // --- LÓGICA DE ABAS ---
  const tabIkro = document.getElementById("search-tab-ikro");
  const tabNotus = document.getElementById("search-tab-notus");
  const ikroCard = document.getElementById("ikro-search-card");
  const notusCard = document.getElementById("notus-search-card");

  tabIkro.addEventListener("click", () => {
    showElement("ikro-search-card");
    hideElement("notus-search-card");
    tabIkro.classList.add("text-[#cd9931]", "border-b-[#cd9931]");
    tabIkro.classList.remove("text-gray-500", "border-transparent");
    tabNotus.classList.remove("text-[#cd9931]", "border-b-[#cd9931]");
    tabNotus.classList.add("text-gray-500", "border-transparent");
  });

  tabNotus.addEventListener("click", () => {
    showElement("notus-search-card");
    hideElement("ikro-search-card");
    tabNotus.classList.add("text-[#cd9931]", "border-b-[#cd9931]");
    tabNotus.classList.remove("text-gray-500", "border-transparent");
    tabIkro.classList.remove("text-[#cd9931]", "border-b-[#cd9931]");
    tabIkro.classList.add("text-gray-500", "border-transparent");
    
    // Mostrar gaps de mapeamento quando aba NOTUS for clicada
    mostrarGaps();
  });

  // --- EVENTOS DE EXPORTAÇÃO DE GAPS ---
  const gapsExportAllBtn = document.getElementById("gaps-export-all");
  const gapsExportPendingBtn = document.getElementById("gaps-export-pending");

  if (gapsExportAllBtn) {
    gapsExportAllBtn.addEventListener("click", () => {
      BackendAPI.exportarGapsAnalysisCSV('');
    });
  }

  if (gapsExportPendingBtn) {
    gapsExportPendingBtn.addEventListener("click", () => {
      BackendAPI.exportarGapsAnalysisCSV('');
    });
  }
});
