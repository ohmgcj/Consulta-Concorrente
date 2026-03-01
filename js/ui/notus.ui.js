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
