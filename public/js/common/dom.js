// js/common/dom.js
export function showElement(id) {
  document.getElementById(id).classList.remove('hidden');
}
export function hideElement(id) {
  document.getElementById(id).classList.add('hidden');
}
