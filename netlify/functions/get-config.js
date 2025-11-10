// Netlify Function para fornecer configurações de forma segura
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Retornar apenas a chave pública VAPID (seguro expor)
        // O token do GitHub NÃO deve ser exposto ao cliente
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                VAPID_PUBLIC_KEY: process.env.PUSH_PUBLIC_KEY || '',
                // NÃO incluir PUSH_GITHUB_TOKEN ou PUSH_PRIVATE_KEY aqui!
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro ao obter configurações' })
        };
    }
};
