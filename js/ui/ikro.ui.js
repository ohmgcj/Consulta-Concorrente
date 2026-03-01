// js/ui/ikro.ui.js
import { formatCurrency } from "../common/utils.js";

export function renderIkroProduct(product) {
  document.getElementById("product-title").textContent =
    product.refer_interna || "Produto";
  document.getElementById("product-line").textContent =
    product.descr_linha || "-";
  document.getElementById("product-group").textContent = product.grupo || "-";
  document.getElementById("product-item").textContent = product.item || "-";
  document.getElementById("product-price").textContent = formatCurrency(
    product.preco_bruto,
  );

  const specElem = document.getElementById("product-specification");
  if (product.especificacao && product.especificacao.especificacao) {
    specElem.innerHTML = product.especificacao.especificacao;
  } else {
    specElem.textContent = "Sem especificação.";
  }

  const imgElem = document.getElementById("product-image");
  const imgPlaceholder = document.getElementById("image-placeholder");
  if (
    product.imagem &&
    product.imagem.length > 0 &&
    product.imagem[0].imagem_produto_seq1
  ) {
    imgElem.src = product.imagem[0].imagem_produto_seq1;
    imgElem.classList.remove("hidden");
    imgPlaceholder.classList.add("hidden");
  } else {
    imgElem.classList.add("hidden");
    imgPlaceholder.classList.remove("hidden");
  }
}

export function showIkroStatus(msg) {
  document.getElementById("status-message").textContent = msg;
}
