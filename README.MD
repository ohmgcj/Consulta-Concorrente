# Projeto de Consulta Técnica de Reguladores (Uso Interno)

## 📌 Visão Geral
Projeto desenvolvido como iniciativa técnica para apoiar atividades internas do setor de Garantia, automatizando a consulta de imagens técnicas de produtos para referência em testes internos.  

O objetivo é reduzir pesquisas manuais, mapeando códigos internos para códigos equivalentes de produtos concorrentes, retornando imagens técnicas de forma segura.

---

## 🎯 Finalidade
- Apoiar testes técnicos internos
- Reduzir trabalho manual
- Garantir consistência nas referências técnicas
- Uso **exclusivamente interno**, sem divulgação externa

---

## 🔍 Origem e Natureza dos Dados
- Dados e imagens utilizados:
  - Publicamente acessíveis no site do concorrente
  - Podem ser obtidos manualmente
  - Sem login ou autenticação
- O projeto **não altera dados externos** nem envia informações

---

## ⚙️ Funcionamento Técnico
- Mapeamento de códigos internos → códigos do concorrente  
- Consulta via endpoints públicos simulados (HTTP GET)  
- Apenas leitura, sem bypass de autenticação  
- Automação reduz tempo de pesquisa manual

---

## 🧪 Estrutura de Dados
Os dados de mapeamento são armazenados em um arquivo de referência JSON com a seguinte lógica:

```json
[
  {
    "meu_codigo": 30135,
    "codigo_api": "IK9849"
  },
  {
    "meu_codigo": 30136,
    "codigo_api": "IK9840"
  }
]
```

Referenciando um código qualquer "meu_código" com os códigos do concorrente  "codigo_api"


---

## 🧪 Escopo de Uso
- Uso **interno e restrito**
- Suporte a testes técnicos do setor de Garantia
- Não é destinado a: redistribuição externa, marketing ou exposição pública

---

## ✅ Boas Práticas
- Limitar volume de imagens armazenadas
- Documentar origem e propósito
- Revisão futura caso haja alterações no site externo

---

## 👤 Autoria e Desenvolvimento
**Desenvolvimento técnico:**  
Caio Alves Godoy (Jesus)  
Projeto desenvolvido como iniciativa técnica para apoio a atividades internas do setor de Garantia, focando em automação, consumo de APIs e documentação segura.
