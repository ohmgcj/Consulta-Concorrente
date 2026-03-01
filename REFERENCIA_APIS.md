# 📋 Referência de APIs Externas

> **⚠️ NOTA:** Este arquivo é apenas referência técnica. Não enviar ao repositório.

---

## 🔗 IKRO API

### Arquitetura
- **Tipo:** CMS (Strapi)
- **Estrutura:** Wrapper `data` com array de objetos contendo `attributes`
- **Padrão:** Múltiplos endpoints relacionais (grupo/item como chave natural)

---

### 📍 1. Produtos (Reguladores de Tensão)

```
GET https://adm.ikro.com.br/api/produtos?filters[descr_linha][$eq]=REGULADORES%20DE%20TENS%C3%83O
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 5,
      "attributes": {
        "grupo": "40201",
        "item": "0001",
        "refer_interna": "IK500",
        "descr_linha": "REGULADORES DE TENSÃO",
        "preco_bruto": "20.14",
        "imagem": [
          {
            "id": 1094,
            "grupo": "40201",
            "item": "0001",
            "referencia": "IK500",
            "imagem_produto_seq1": "base64..."
          }
        ],
        "especificacao": {
          "id": 858,
          "wpro_grupo": "40201",
          "wpro_item": "0001",
          "especificacao": "14,6V <br />Campo Positivo <br />..."
        }
      }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageCount": 5, "pageSize": 100 } }
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `grupo` | String | Identificador do grupo |
| `item` | String | Identificador do item (chave composta grupo+item) |
| `refer_interna` | String | Código interno IKRO |
| `preco_bruto` | String | Preço (formato: "20.14") |
| `imagem` | Array | Imagens em base64 |
| `especificacao` | Object | Specs técnicas em HTML |

---

### 📍 2. Detalhes & Alternadores

```
GET https://adm.ikro.com.br/api/produto-conjuntos?filters[wpro_grupo][$eq]={grupo}&filters[wpro_item][$eq]={item}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "wpro_grupo": "40103",
        "wpro_item": "0234",
        "wfor_cod_fabr": "BOSCH",
        "tipo_referencia": "ALTER",
        "alternador": "0.001.410.021/ 041/ 089; ..."
      }
    }
  ]
}
```

| Campo | Descrição |
|-------|-----------|
| `wpro_grupo` + `wpro_item` | Chave natural (relaciona ao produto) |
| `alternador` | String com alternadores compatíveis |

---

### 📍 3. Aplicações Automotivas

```
GET https://adm.ikro.com.br/api/aplicacao-produtos?filters[wpro_grupo][$eq]={grupo}&filters[wpro_item][$eq]={item}
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 2,
      "attributes": {
        "marca_aplic": "AGRALE",
        "wpro_grupo": "40106",
        "wpro_item": "0015",
        "aplicacao": "Motores estacionários M80; M85; ..."
      }
    }
  ]
}
```

| Campo | Descrição |
|-------|-----------|
| `marca_aplic` | Marca do veículo |
| `aplicacao` | Descrição de aplicação (texto livre) |

---

## 🔗 NOTUS API

### Arquitetura
- **Tipo:** Catálogo Estático
- **Estrutura:** Array JSON direto (sem wrapper)
- **Padrão:** Flat, simples consumo

---

### 📍 Catálogo Completo

```
GET https://catalogo.notus.ind.br/conversor/produtos.json
```

**Resposta:**
```json
[
  {
    "id": 1,
    "codigo": "AQ-10028.1",
    "grupo": "CAMINHÃO",
    "categoria": "RADIADOR DE AQUECIMENTO",
    "montadora": "SCANIA",
    "modelo": 112,
    "referenciaoriginal": "1331928 - 283414",
    "codigodebarras": 7898580000000,
    "descricao": "RADIADOR DE AQUECIMENTO PESADO SCANIA 112 TODOS",
    "imagem": "./conversor/ImagensProdutos/AQ-10028.1.webp"
  }
]
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigo` | String | Código NOTUS (chave primária) |
| `grupo` | String | Segmento (CAMINHÃO, ÔNIBUS, etc) |
| `categoria` | String | Tipo de componente |
| `montadora` | String | Marca do veículo |
| `referenciaoriginal` | String | OEM Reference |
| `descricao` | String | Descrição comercial completa |

---

## 🔄 Comparação Estrutural

| Aspecto | IKRO | NOTUS |
|--------|------|-------|
| **Wrapper** | ✅ `data` array | ❌ Array direto |
| **Metadata** | ✅ `attributes` | ❌ Flat |
| **Paginação** | ✅ Suportada | ❌ Arquivo único |
| **Endpoints** | ✅ Múltiplos relacionais | ❌ Um único arquivo |
| **Chave Natural** | `grupo + item` | `codigo` |
| **Estrutura** | CMS (Strapi) | Catálogo estático |
| **Consumo** | Múltiplas requisições | Uma única requisição |

---

## ⚙️ Notas Técnicas

- **IKRO:** Usar paginação com `pageSize=100` para performance
- **IKRO:** Cache recomendado (dados mudam raramente)
- **NOTUS:** Baixar inteiro (mais rápido que múltiplas buscas)
- **NOTUS:** Filtros aplicados client-side ou via backend
