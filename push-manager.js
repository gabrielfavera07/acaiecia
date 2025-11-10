// ===== GERENCIADOR DE NOTIFICAÇÕES PUSH =====
// Este arquivo gerencia as subscriptions de push notifications

const PushNotificationManager = {
    // Chave pública VAPID (será obtida das variáveis de ambiente do Netlify)
    vapidPublicKey: null,
    githubToken: null,

    // Inicializar o gerenciador
    async init() {
        console.log('🔔 Inicializando Push Notification Manager');

        // Verificar suporte a notificações
        if (!('Notification' in window)) {
            console.warn('⚠️ Este navegador não suporta notificações');
            return false;
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Este navegador não suporta Service Workers');
            return false;
        }

        if (!('PushManager' in window)) {
            console.warn('⚠️ Este navegador não suporta Push API');
            return false;
        }

        // Obter chaves VAPID e GitHub Token das variáveis de ambiente
        await this.loadConfig();

        // Verificar se já tem permissão e está inscrito
        await this.checkSubscriptionStatus();

        return true;
    },

    // Carregar configurações (VAPID keys e GitHub token)
    async loadConfig() {
        try {
            // Tentar obter do Netlify Functions (se estiver rodando no Netlify)
            const response = await fetch('/.netlify/functions/get-config');
            if (response.ok) {
                const config = await response.json();
                this.vapidPublicKey = config.VAPID_PUBLIC_KEY;
                this.githubToken = config.PUSH_GITHUB_TOKEN;
                console.log('✅ Configuração carregada do Netlify');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível carregar configuração do Netlify, usando fallback');
            // Fallback: usar variáveis de ambiente client-side (não recomendado para produção)
            // Por segurança, a chave pública VAPID pode ser exposta, mas não o token do GitHub
        }
    },

    // Verificar status da subscription
    async checkSubscriptionStatus() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                console.log('✅ Usuário já está inscrito para notificações');
                this.updateUISubscribed(true);
                return true;
            } else {
                console.log('ℹ️ Usuário não está inscrito');
                this.updateUISubscribed(false);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar status da subscription:', error);
            return false;
        }
    },

    // Solicitar permissão e criar subscription
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                console.log('❌ Permissão negada');
                alert('Você precisa permitir notificações para receber atualizações!');
                return false;
            }

            console.log('✅ Permissão concedida');
            await this.subscribe();
            return true;
        } catch (error) {
            console.error('❌ Erro ao solicitar permissão:', error);
            alert('Erro ao solicitar permissão para notificações');
            return false;
        }
    },

    // Criar subscription
    async subscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;

            // Converter a chave pública VAPID para Uint8Array
            const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            console.log('✅ Subscription criada:', subscription);

            // Salvar subscription no GitHub
            await this.saveSubscriptionToGitHub(subscription);

            this.updateUISubscribed(true);
            return subscription;
        } catch (error) {
            console.error('❌ Erro ao criar subscription:', error);
            alert('Erro ao ativar notificações. Tente novamente.');
            return null;
        }
    },

    // Salvar subscription no GitHub JSON via Netlify Function
    async saveSubscriptionToGitHub(subscription) {
        try {
            console.log('💾 Salvando subscription no GitHub...');

            // Obter informações do dispositivo
            const deviceInfo = {
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                keys: {
                    p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                    auth: this.arrayBufferToBase64(subscription.getKey('auth'))
                },
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            // Usar Netlify Function para salvar (mais seguro)
            const response = await fetch('/.netlify/functions/save-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deviceInfo)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar subscription');
            }

            console.log('✅ Subscription salva no GitHub com sucesso!');
            alert('✅ Notificações ativadas com sucesso! Você receberá nossas promoções e novidades.');
        } catch (error) {
            console.error('❌ Erro ao salvar subscription no GitHub:', error);
            // Não mostrar erro ao usuário, pois a subscription foi criada localmente
            console.warn('⚠️ Subscription criada localmente, mas não salva no servidor');
            alert('✅ Notificações ativadas! (Salvo localmente)');
        }
    },

    // Cancelar subscription
    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                // TODO: Remover do GitHub também
                this.updateUISubscribed(false);
                console.log('✅ Subscription cancelada');
                alert('Notificações desativadas');
            }
        } catch (error) {
            console.error('❌ Erro ao cancelar subscription:', error);
        }
    },

    // Atualizar UI baseado no status da subscription
    updateUISubscribed(isSubscribed) {
        const notifyBtn = document.getElementById('enable-notifications-btn');
        if (notifyBtn) {
            if (isSubscribed) {
                notifyBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Desativar Notificações';
                notifyBtn.classList.add('subscribed');
            } else {
                notifyBtn.innerHTML = '<i class="fas fa-bell"></i> Receber Ofertas e Novidades';
                notifyBtn.classList.remove('subscribed');
            }
        }
    },

    // Converter chave VAPID base64 para Uint8Array
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    // Converter ArrayBuffer para Base64
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
};

// Exportar para uso global
window.PushNotificationManager = PushNotificationManager;
