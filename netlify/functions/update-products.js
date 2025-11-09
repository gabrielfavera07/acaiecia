// Netlify Function para atualizar products_with_prices.json no GitHub
exports.handler = async (event, context) => {
    // Permitir apenas POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_OWNER = 'gabrielfavera07';
        const GITHUB_REPO = 'acaiecia';
        const FILE_PATH = 'products_with_prices.json';

        if (!GITHUB_TOKEN) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'GitHub token not configured' })
            };
        }

        // Parse o corpo da requisição
        const { products } = JSON.parse(event.body);

        if (!products) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Products data not provided' })
            };
        }

        const jsonContent = JSON.stringify(products, null, 2);

        // Passo 1: Obter o SHA atual do arquivo
        const getFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
        
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let fileSha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            fileSha = fileData.sha;
        }

        // Passo 2: Fazer commit do arquivo atualizado
        const commitData = {
            message: `Atualização de preços - ${new Date().toLocaleString('pt-BR')}`,
            content: Buffer.from(jsonContent).toString('base64'),
            branch: 'main'
        };

        if (fileSha) {
            commitData.sha = fileSha;
        }

        const commitResponse = await fetch(getFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitData)
        });

        if (!commitResponse.ok) {
            const errorText = await commitResponse.text();
            return {
                statusCode: commitResponse.status,
                body: JSON.stringify({ error: 'GitHub commit failed', details: errorText })
            };
        }

        const commitResult = await commitResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Commit realizado com sucesso',
                commit: commitResult.commit
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
