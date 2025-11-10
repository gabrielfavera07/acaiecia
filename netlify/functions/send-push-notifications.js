// Netlify Function para enviar notificações push
const webpush = require('web-push');

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
        const { notification, subscriptions } = JSON.parse(event.body);

        // Validações
        if (!notification || !notification.title || !notification.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Dados de notificação inválidos' })
            };
        }

        if (!subscriptions || subscriptions.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Nenhuma subscription fornecida' })
            };
        }

        // Configurar VAPID keys (novos nomes de variáveis)
        const vapidPublicKey = process.env.PUSH_PUBLIC_KEY;
        const vapidPrivateKey = process.env.PUSH_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Chaves PUSH não configuradas' })
            };
        }

        webpush.setVapidDetails(
            'mailto:contato@acaiecia.com.br',
            vapidPublicKey,
            vapidPrivateKey
        );

        // Preparar payload da notificação
        const payload = JSON.stringify(notification);

        // Enviar notificações para todos os inscritos
        const sendPromises = subscriptions.map(async (subscription) => {
            try {
                await webpush.sendNotification(subscription, payload);
                return { success: true, endpoint: subscription.endpoint };
            } catch (error) {
                console.error('Erro ao enviar notificação:', error);
                // Se a subscription expirou (410), remover do array
                if (error.statusCode === 410) {
                    return { success: false, endpoint: subscription.endpoint, expired: true, error: error.message };
                }
                return {
                    success: false,
                    endpoint: subscription.endpoint,
                    error: error.message,
                    statusCode: error.statusCode,
                    body: error.body
                };
            }
        });

        const results = await Promise.allSettled(sendPromises);

        // Contar sucessos e falhas
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failureCount = results.length - successCount;
        const expiredSubscriptions = results
            .filter(r => r.status === 'fulfilled' && r.value.expired)
            .map(r => r.value.endpoint);

        // Coletar erros para debug
        const errors = results
            .filter(r => r.status === 'fulfilled' && !r.value.success)
            .map(r => ({
                endpoint: r.value.endpoint,
                error: r.value.error,
                statusCode: r.value.statusCode,
                body: r.value.body
            }));

        console.log(`✅ ${successCount} notificações enviadas com sucesso`);
        console.log(`❌ ${failureCount} falhas`);
        if (expiredSubscriptions.length > 0) {
            console.log(`🗑️ ${expiredSubscriptions.length} subscriptions expiradas`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                totalCount: subscriptions.length,
                successCount: successCount,
                failureCount: failureCount,
                expiredSubscriptions: expiredSubscriptions,
                errors: errors // Incluir erros para debug
            })
        };

    } catch (error) {
        console.error('Erro:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Erro ao enviar notificações' })
        };
    }
};
