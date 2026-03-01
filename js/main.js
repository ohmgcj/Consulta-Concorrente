// js/main.js
import * as BackendAPI from "./api/backend.api.js";
import * as IkroUI from "./ui/ikro.ui.js";
import * as NotusUI from "./ui/notus.ui.js";
import { showElement, hideElement } from "./common/dom.js";

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
      fetch('/api/notus').then(res => {
        if (!res.ok) throw new Error('Erro ao carregar NOTUS');
        return res.json();
      }),
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

function buscarProdutoIkro() {
  const searchInput = document.getElementById("searchInput");
  const resultContainer = document.getElementById("result-container");
  const userInput = searchInput.value.trim();
  if (!userInput) return;

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
    hideElement("result-container");
    IkroUI.showIkroStatus("Produto não encontrado.");
    return;
  }

  IkroUI.renderIkroProduct(foundProduct.attributes);
  const appElem = document.getElementById("product-application");
  appElem.innerHTML = "<li>Carregando aplicações...</li>";
  BackendAPI.fetchApplications(foundProduct.grupo, foundProduct.item)
    .then((data) => {
      appElem.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach((app) => {
          const attrs = app.attributes;
          const li = document.createElement("li");
          li.textContent = `${attrs.marca_aplic} – ${attrs.aplicacao}`;
          appElem.appendChild(li);
        });
      } else {
        appElem.innerHTML = "<li>Sem aplicações cadastradas.</li>";
      }
    })
    .catch(() => {
      appElem.innerHTML = "<li>Erro ao carregar aplicações.</li>";
    });
  showElement("result-container");
  IkroUI.showIkroStatus("");
}

/**
 * Busca produto NOTUS por código (próprio ou mapeado)
 * Se o código for da empresa, converte usando notus.mapping.json
 */
function buscarProdutoNotus() {
  const searchInput = document.getElementById("notusSearchInput");
  const userInput = searchInput.value.trim();
  if (!userInput) return;

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
    hideElement("result-container");
    NotusUI.showNotusStatus("Produto não encontrado.");
    return;
  }

  NotusUI.renderNotusProduct(foundProduct);
  showElement("result-container");
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
