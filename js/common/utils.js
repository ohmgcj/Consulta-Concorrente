// js/common/utils.js
export function formatCurrency(value) {
  if (!value) return '-';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
