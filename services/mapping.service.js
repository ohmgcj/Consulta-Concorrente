// =================================================================
// services/mapping.service.js
// Carrega e gerencia mapeamentos entre sistemas
// Implementa padrão Singleton
// =================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPPINGS_DIR = path.join(__dirname, "..", "mappings");

/**
 * Serviço de Mapeamento
 * Singleton que gerencia mapeamentos entre códigos internos e externos
 */
class MappingService {
  constructor() {
    this.mappings = {};
    this.loadAllMappings();
  }

  /**
   * Carrega todos os arquivos .mapping.json do diretório mappings/
   * Executado na inicialização
   * @private
   */
  loadAllMappings() {
    try {
      const files = fs.readdirSync(MAPPINGS_DIR);
      const mappingFiles = files.filter((f) => f.endsWith(".mapping.json"));

      mappingFiles.forEach((file) => {
        const provider = file.replace(".mapping.json", "");
        const filePath = path.join(MAPPINGS_DIR, file);
        const data = fs.readFileSync(filePath, "utf-8");
        this.mappings[provider] = JSON.parse(data);
        console.log(`[MAPPING] ${provider}.mapping.json carregado (${this.mappings[provider].length} itens)`);
      });
    } catch (error) {
      console.error("[MAPPING] ERRO ao carregar mapeamentos:", error.message);
    }
  }

  /**
   * Busca mapeamento de um provider específico
   * @param {string} provider - Nome do provider ("ikro", "notus", etc)
   * @returns {Array} Array de items mapeados ou array vazio se não encontrar
   */
  getMappingByProvider(provider) {
    return this.mappings[provider] || [];
  }

  /**
   * Busca item específico pelo "meu_código"
   * @param {string} provider - Nome do provider
   * @param {string|number} meuCodigo - Código interno
   * @returns {Object|undefined} Item encontrado ou undefined
   */
  findByMeuCodigo(provider, meuCodigo) {
    const mapping = this.mappings[provider] || [];
    return mapping.find((item) => String(item.meu_codigo) === String(meuCodigo));
  }

  /**
   * Busca todos os items de um provider que correspondem a um código externo
   * @param {string} provider - Nome do provider
   * @param {string|number} codigoExterno - Código a buscar
   * @param {string} field - Campo a comparar (default: "codigo_api")
   * @returns {Array} Items encontrados
   */
  findByProviderCode(provider, codigoExterno, field = "codigo_api") {
    const mapping = this.mappings[provider] || [];
    return mapping.filter((item) => String(item[field]) === String(codigoExterno));
  }

  /**
   * Lista todos os providers com mapeamentos carregados
   * @returns {Array<string>} Nomes dos providers (ex: ["ikro", "notus"])
   */
  getAvailableProviders() {
    return Object.keys(this.mappings);
  }

  /**
   * Recarrega mapeamentos (útil se arquivo mudou em runtime)
   * Limpa cache e recarrega arquivos do disco
   */
  reloadMappings() {
    this.mappings = {};
    this.loadAllMappings();
  }
}

export default new MappingService();
