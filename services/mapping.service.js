// =================================================================
// services/mapping.service.js
// Carrega e gerencia mapeamentos entre sistemas
// =================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPPINGS_DIR = path.join(__dirname, "..", "mappings");

class MappingService {
  constructor() {
    this.mappings = {};
    this.loadAllMappings();
  }

  // Carrega todos os mapeamentos na inicialização
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

  // Buscar mapeamento de um provider específico
  getMappingByProvider(provider) {
    return this.mappings[provider] || [];
  }

  // Buscar item específico pelo "meu_código"
  findByMeuCodigo(provider, meuCodigo) {
    const mapping = this.mappings[provider] || [];
    return mapping.find((item) => String(item.meu_codigo) === String(meuCodigo));
  }

    // Buscar Código de Conversão pelo Produto (Notus)
    findCodigoConversaoByProduto(provider, produto) {
      const mapping = this.mappings[provider] || [];
      const item = mapping.find((m) => String(m.Produto) === String(produto));
      return item ? item["Código de Conversão"] : null;
    }

  // Buscar todos os itens de um provider que correspondem a um código externo
  findByProviderCode(provider, codigoExterno, field = "codigo_api") {
    const mapping = this.mappings[provider] || [];
    return mapping.filter((item) => String(item[field]) === String(codigoExterno));
  }

  // Listar todos os providers disponíveis
  getAvailableProviders() {
    return Object.keys(this.mappings);
  }

  // Recarregar mapeamentos (útil se o arquivo mudar em runtime)
  reloadMappings() {
    this.mappings = {};
    this.loadAllMappings();
  }
}

export default new MappingService();
