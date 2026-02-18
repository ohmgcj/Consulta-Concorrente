// =================================================================
// server.js - Versão com controle de cache
// =================================================================
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURAÇÕES E CACHE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

let regulatorsCache = [];
let isCacheReady = false; // <-- NOSSA NOVA TRAVA/FLAG

// --- FUNÇÃO PARA BUSCAR E CACHEAR OS REGULADORES ---
async function fetchAndCacheRegulators() {
    // ... (esta função continua exatamente a mesma de antes)
    console.log('[Cache] Iniciando carregamento de "Reguladores de Tensão"...');
    let products = [];
    let page = 1;
    let pageCount = 1;
    // API DE EXEMPLO
    const baseUrl = 'https://adm.ikro.com.br/api/produtos?filters[descr_linha][$eq]=REGULADORES%20DE%20TENS%C3%83O';
    try {
        while (page <= pageCount) {
            const fetchUrl = `${baseUrl}&pagination[page]=${page}&pagination[pageSize]=100&populate=imagem`;
            console.log(`[Cache] Buscando página ${page} de ${pageCount}...`);
            const response = await axios.get(fetchUrl);
            if (response.data?.data?.length > 0) {
                products.push(...response.data.data);
            }
            if (page === 1) {
                pageCount = response.data?.meta?.pagination?.pageCount || 1;
            }
            page++;
        }
        regulatorsCache = products;
        isCacheReady = true; // <-- AVISA QUE O CACHE ESTÁ PRONTO!
        console.log(`[Cache] Carregamento concluído! ${regulatorsCache.length} reguladores em memória.`);
    } catch (error) {
        console.error('[Cache] ERRO FATAL ao carregar produtos da API:', error.message);
    }
}

// --- ROTA PARA O FRONTEND PEGAR OS DADOS ---
app.get('/api/reguladores', (req, res) => {
    if (isCacheReady) {
        // Se o cache estiver pronto, envia os dados
        res.json(regulatorsCache);
    } else {
        // Se não, envia um status 503 (Serviço Indisponível) e uma mensagem
        res.status(503).json({ message: 'O servidor está preparando os dados. Tente novamente em alguns segundos.' });
    }
});

// --- ROTA PARA DETALHES + APLICAÇÃO ---
app.get('/api/regulador/:grupo/:item', async (req, res) => {
    const { grupo, item } = req.params;

    try {
        // fetch detalhes
        const detalheUrl = `https://adm.ikro.com.br/api/produto-conjuntos?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;
        const aplicacaoUrl = `https://adm.ikro.com.br/api/aplicacao-produtos?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;

        const [detalheResp, aplicacaoResp] = await Promise.all([
            axios.get(detalheUrl),
            axios.get(aplicacaoUrl)
        ]);

        const detalheData = detalheResp.data?.data || [];
        const aplicacaoData = aplicacaoResp.data?.data || [];

        res.json({
            detalhe: detalheData,
            aplicacao: aplicacaoData
        });
    } catch (e) {
        console.error("Erro ao buscar detalhes/aplicação", e.message);
        res.status(500).json({ message: "Erro ao buscar dados externos" });
    }
});

// --- DETALHE + APLICAÇÃO DO PRODUTO ---
app.get('/api/regulador-detalhes', async (req, res) => {
    const { grupo, item } = req.query;
    // desenvolvido por godoy.js caio "jesus" godoy
    if (!grupo || !item) {
        return res.status(400).json({ message: 'Grupo e item são obrigatórios' });
    }

    try {
        const detalheUrl = `https://adm.ikro.com.br/api/produto-conjuntos?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;
        const aplicacaoUrl = `https://adm.ikro.com.br/api/aplicacao-produtos?filters[wpro_grupo][$eq]=${grupo}&filters[wpro_item][$eq]=${item}`;

        const [detalheResp, aplicacaoResp] = await Promise.all([
            axios.get(detalheUrl),
            axios.get(aplicacaoUrl)
        ]);

        res.json({
            detalhe: detalheResp.data?.data || [],
            aplicacao: aplicacaoResp.data?.data || []
        });

    } catch (error) {
        console.error('Erro ao buscar detalhes:', error.message);
        res.status(500).json({ message: 'Erro ao buscar dados externos' });
    }
});



// --- SERVIR ARQUIVOS ESTÁTICOS E INICIAR ---
app.use(express.static(__dirname));
app.listen(PORT, () => {
    console.log(`Servidor rodando! Acesse a aplicação em http://localhost:${PORT}`);
    fetchAndCacheRegulators();
});