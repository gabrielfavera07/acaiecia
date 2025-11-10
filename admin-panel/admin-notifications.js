// ===== GERENCIAMENTO DE NOTIFICAÇÕES PUSH NO ADMIN =====

let pushSubscriptions = [];

// ===== CARREGAR SUBSCRIPTIONS DO GITHUB =====
async function loadPushSubscriptions() {
    try {
        const apiUrl = 'https://api.github.com/repos/gabrielfavera07/acaiecia/contents/products_with_prices.json';
        const cacheBuster = new Date().getTime();

        const response = await fetch(`${apiUrl}?ref=main&t=${cacheBuster}`, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar dados');

        const data = await response.json();
        pushSubscriptions = data.push_subscriptions || [];

        updateSubscribersCount();
        console.log(`✅ ${pushSubscriptions.length} inscritos carregados`);
    } catch (error) {
        console.error('Erro ao carregar subscriptions:', error);
        pushSubscriptions = [];
        updateSubscribersCount();
    }
}

// ===== ATUALIZAR CONTADOR DE INSCRITOS =====
function updateSubscribersCount() {
    const count = pushSubscriptions.length;
    const subscribersCountEl = document.getElementById('subscribers-count');
    const modalSubscribersCountEl = document.getElementById('modal-subscribers-count');

    if (subscribersCountEl) {
        subscribersCountEl.textContent = count;
    }

    if (modalSubscribersCountEl) {
        modalSubscribersCountEl.textContent = count;
    }
}

// ===== ABRIR MODAL DE NOTIFICAÇÕES =====
window.openNotificationsModal = function() {
    const modal = document.getElementById('notifications-modal');
    modal.classList.add('active');

    // Atualizar contador no modal
    updateSubscribersCount();

    // Resetar formulário
    document.getElementById('notification-title').value = '';
    document.getElementById('notification-message').value = '';
    document.getElementById('notification-image').value = '';
    document.getElementById('notification-url').value = '/';

    updatePreview();
};

// ===== FECHAR MODAL DE NOTIFICAÇÕES =====
window.closeNotificationsModal = function() {
    const modal = document.getElementById('notifications-modal');
    modal.classList.remove('active');
};

// ===== ATUALIZAR PRÉ-VISUALIZAÇÃO =====
function updatePreview() {
    const title = document.getElementById('notification-title').value || 'Título da notificação';
    const message = document.getElementById('notification-message').value || 'Mensagem da notificação aparecerá aqui...';
    const imageUrl = document.getElementById('notification-image').value;

    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-message').textContent = message;

    const previewImage = document.getElementById('preview-image');
    if (imageUrl) {
        previewImage.src = imageUrl;
        previewImage.style.display = 'block';
    } else {
        previewImage.style.display = 'none';
    }
}

// ===== CONTADORES DE CARACTERES =====
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('notification-title');
    const messageInput = document.getElementById('notification-message');
    const imageInput = document.getElementById('notification-image');

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            const count = titleInput.value.length;
            document.getElementById('title-counter').textContent = `${count}/50 caracteres`;
            updatePreview();
        });
    }

    if (messageInput) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            document.getElementById('message-counter').textContent = `${count}/150 caracteres`;
            updatePreview();
        });
    }

    if (imageInput) {
        imageInput.addEventListener('input', updatePreview);
    }

    // Carregar subscriptions ao iniciar
    loadPushSubscriptions();

    // Recarregar a cada 30 segundos
    setInterval(loadPushSubscriptions, 30000);
});

// ===== ENVIAR NOTIFICAÇÃO PUSH =====
window.sendPushNotification = async function() {
    const title = document.getElementById('notification-title').value.trim();
    const message = document.getElementById('notification-message').value.trim();
    const imageUrl = document.getElementById('notification-image').value.trim();
    const targetUrl = document.getElementById('notification-url').value.trim();

    // Validações
    if (!title) {
        alert('⚠️ Por favor, preencha o título da notificação');
        return;
    }

    if (!message) {
        alert('⚠️ Por favor, preencha a mensagem da notificação');
        return;
    }

    if (pushSubscriptions.length === 0) {
        alert('⚠️ Não há inscritos para receber a notificação');
        return;
    }

    if (!confirm(`Enviar notificação para ${pushSubscriptions.length} inscritos?`)) {
        return;
    }

    const sendBtn = document.getElementById('send-notification-btn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        // Preparar dados da notificação
        const notificationData = {
            title: title,
            body: message,
            icon: '/IMAGENS COM NOME E SEPARADAS POR PASTA/logo.png',
            badge: '/IMAGENS COM NOME E SEPARADAS POR PASTA/logo.png',
            image: imageUrl || undefined,
            data: {
                url: targetUrl || '/'
            }
        };

        // Enviar para Netlify Function (no site principal)
        const response = await fetch('https://acaiecia.netlify.app/.netlify/functions/send-push-notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notification: notificationData,
                subscriptions: pushSubscriptions
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao enviar notificações');
        }

        const result = await response.json();

        // Debug: mostrar erros se houver
        if (result.errors && result.errors.length > 0) {
            console.error('🚨 ERROS DETALHADOS:', result.errors);
            const firstError = result.errors[0];
            alert(`❌ Erro ao enviar:\n${firstError.error}\nStatus: ${firstError.statusCode}\nDetalhes: ${firstError.body || 'N/A'}`);
        }

        if (result.successCount > 0) {
            showMessage(`✅ Notificação enviada com sucesso para ${result.successCount} de ${result.totalCount} inscritos!`, 'success');
            closeNotificationsModal();
        } else {
            showMessage(`❌ Falha ao enviar para todos os ${result.totalCount} inscritos. Verifique o console.`, 'error');
        }

    } catch (error) {
        console.error('Erro ao enviar notificações:', error);
        showMessage(`❌ Erro ao enviar notificações: ${error.message}`, 'error');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Notificação';
    }
};

// ===== FECHAR MODAL AO CLICAR FORA =====
document.addEventListener('DOMContentLoaded', () => {
    const notificationsModal = document.getElementById('notifications-modal');
    if (notificationsModal) {
        notificationsModal.addEventListener('click', (e) => {
            if (e.target === notificationsModal) {
                closeNotificationsModal();
            }
        });
    }
});
