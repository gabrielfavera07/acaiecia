// Netlify Function para salvar push subscriptions no GitHub
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const subscription = JSON.parse(event.body);
        const githubToken = process.env.PUSH_GITHUB_TOKEN;

        if (!githubToken) {
            throw new Error('PUSH_GITHUB_TOKEN não configurado');
        }

        const GITHUB_CONFIG = {
            owner: 'gabrielfavera07',
            repo: 'acaiecia',
            branch: 'main',
            filePath: 'products_with_prices.json'
        };

        // 1. Buscar arquivo atual do GitHub
        const fileUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
        const cacheBuster = new Date().getTime();

        const getResponse = await fetch(`${fileUrl}?ref=${GITHUB_CONFIG.branch}&t=${cacheBuster}`, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getResponse.ok) {
            throw new Error('Erro ao buscar arquivo do GitHub');
        }

        const fileData = await getResponse.json();
        const currentSha = fileData.sha;

        // Decodificar conteúdo
        const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

        // 2. Adicionar/atualizar subscription
        if (!content.push_subscriptions) {
            content.push_subscriptions = [];
        }

        const existingIndex = content.push_subscriptions.findIndex(
            sub => sub.endpoint === subscription.endpoint
        );

        if (existingIndex >= 0) {
            content.push_subscriptions[existingIndex] = subscription;
        } else {
            content.push_subscriptions.push(subscription);
        }

        // 3. Fazer commit
        const newContent = JSON.stringify(content, null, 2);
        const base64Content = Buffer.from(newContent).toString('base64');

        const updateResponse = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `📱 Nova inscrição de push notification - ${new Date().toLocaleString('pt-BR')}`,
                content: base64Content,
                sha: currentSha,
                branch: GITHUB_CONFIG.branch
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Erro ao salvar subscription');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Subscription salva com sucesso' })
        };

    } catch (error) {
        console.error('Erro:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Erro ao salvar subscription' })
        };
    }
};
