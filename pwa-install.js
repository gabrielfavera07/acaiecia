// PWA Installation Banner Logic

let deferredPrompt;
let installBannerDismissed = false;

// Detecta se o app está rodando como PWA instalado
function isRunningAsPWA() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = window.navigator.standalone === true;
  const androidApp = document.referrer.includes('android-app://');

  console.log('🔍 PWA Detection Debug:');
  console.log('  - display-mode: standalone?', standalone);
  console.log('  - iOS standalone?', iosStandalone);
  console.log('  - Android app?', androidApp);
  console.log('  - User Agent:', navigator.userAgent);

  return standalone || iosStandalone || androidApp;
}

// Cria o banner de instalação
function createInstallBanner() {
  // Não mostrar se já está instalado ou se foi fechado nesta sessão
  if (isRunningAsPWA() || installBannerDismissed) {
    return;
  }

  // Verifica se o banner já existe
  if (document.getElementById('pwa-install-banner')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'pwa-install-banner';
  banner.innerHTML = `
    <div class="pwa-banner-content">
      <button class="pwa-banner-close" aria-label="Fechar" title="Fechar">
        <i class="fas fa-times"></i>
      </button>
      <div class="pwa-banner-icon">
        <img src="IMAGENS COM NOME E SEPARADAS POR PASTA/logo.png" alt="AÇAÍ & CIA">
      </div>
      <div class="pwa-banner-text">
        <h3>Instale nosso App!</h3>
        <p>Tenha acesso rápido e fácil ao melhor açaí da região! 🍇</p>
      </div>
      <button class="pwa-banner-install-btn">
        <i class="fas fa-download"></i>
        Instalar Agora
      </button>
    </div>
  `;

  document.body.appendChild(banner);

  // Animação de entrada
  setTimeout(() => {
    banner.classList.add('show');
  }, 500);

  // Botão de fechar
  const closeBtn = banner.querySelector('.pwa-banner-close');
  closeBtn.addEventListener('click', () => {
    closeBanner();
  });

  // Botão de instalação
  const installBtn = banner.querySelector('.pwa-banner-install-btn');
  installBtn.addEventListener('click', () => {
    installPWA();
  });
}

// Fecha o banner
function closeBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.remove();
      installBannerDismissed = true;
    }, 300);
  }
}

// Instala o PWA
async function installPWA() {
  if (!deferredPrompt) {
    alert('A instalação não está disponível neste momento. Por favor, tente novamente mais tarde.');
    return;
  }

  // Mostra o prompt de instalação
  deferredPrompt.prompt();

  // Aguarda a escolha do usuário
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('Usuário aceitou a instalação');
    closeBanner();
  } else {
    console.log('Usuário recusou a instalação');
  }

  // Limpa o deferredPrompt
  deferredPrompt = null;
}

// Event listener para o evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o mini-infobar do Chrome
  e.preventDefault();
  
  // Salva o evento para ser usado depois
  deferredPrompt = e;
  
  // Mostra o banner customizado
  createInstallBanner();
});

// Event listener para quando o app é instalado
window.addEventListener('appinstalled', () => {
  console.log('PWA foi instalado com sucesso!');
  closeBanner();
  deferredPrompt = null;
});

// Mostra o banner quando a página carrega (apenas se não estiver instalado)
window.addEventListener('load', () => {
  // Aguarda um pouco antes de mostrar o banner
  setTimeout(() => {
    if (!isRunningAsPWA() && !installBannerDismissed) {
      createInstallBanner();
    }
  }, 2000); // Mostra após 2 segundos
});

// ===== BANNER DE NOTIFICAÇÕES (APENAS NO PWA) =====

// Cria o banner de notificações (só aparece no PWA)
async function createNotificationBanner() {
  console.log('🔔 createNotificationBanner chamado');

  // Só mostrar no PWA
  if (!isRunningAsPWA()) {
    console.log('❌ Não está rodando como PWA');
    return;
  }

  console.log('✅ Está rodando como PWA');

  // Verificar se já existe
  if (document.getElementById('notification-banner')) {
    console.log('⚠️ Banner já existe');
    return;
  }

  // Verificar se já tem permissão de notificação
  if (Notification.permission === 'granted') {
    console.log('🔍 Verificando subscription...');
    // Verifica se está inscrito
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Já está inscrito, não mostrar banner
        console.log('✅ Já está inscrito, não mostrar banner');
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  }

  console.log('📢 Criando banner de notificações...');

  const banner = document.createElement('div');
  banner.id = 'notification-banner';
  banner.className = 'pwa-install-banner';
  banner.innerHTML = `
    <div class="pwa-banner-content">
      <div class="pwa-banner-icon">
        <i class="fas fa-bell" style="font-size: 40px; color: #7b1fa2;"></i>
      </div>
      <div class="pwa-banner-text">
        <h3>Ative as Notificações!</h3>
        <p>Não perca nossas promoções incríveis e novidades! 🎉</p>
      </div>
      <button class="pwa-banner-install-btn" id="notification-banner-btn">
        <i class="fas fa-bell"></i>
        Ativar Agora
      </button>
    </div>
  `;

  document.body.appendChild(banner);
  console.log('✅ Banner adicionado ao DOM');

  // Animação de entrada
  setTimeout(() => {
    banner.classList.add('show');
    console.log('✅ Banner animado (show class adicionada)');
  }, 500);

  // Botão de ativar
  const activateBtn = banner.querySelector('#notification-banner-btn');
  activateBtn.addEventListener('click', async () => {
    console.log('🔔 Botão de ativar clicado');
    if (window.PushNotificationManager) {
      const success = await window.PushNotificationManager.requestPermission();
      if (success) {
        // Fechar banner após ativação bem-sucedida
        console.log('✅ Notificações ativadas, fechando banner');
        closeNotificationBanner();
      }
    }
  });
}

// Fecha o banner de notificações
function closeNotificationBanner() {
  const banner = document.getElementById('notification-banner');
  if (banner) {
    banner.classList.remove('show');
    setTimeout(() => {
      banner.remove();
    }, 300);
  }
}

// Monitorar mudanças na permissão de notificação
function monitorNotificationPermission() {
  if (!isRunningAsPWA()) return;

  // Verificar periodicamente se as notificações foram ativadas
  setInterval(async () => {
    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Notificações ativadas, fechar banner
          closeNotificationBanner();
        }
      } catch (error) {
        // Ignorar erros silenciosamente
      }
    }
  }, 2000);
}

// Inicializar banner de notificações no PWA
window.addEventListener('load', () => {
  console.log('🚀 Página carregada, verificando PWA...');
  console.log('isRunningAsPWA:', isRunningAsPWA());

  setTimeout(() => {
    if (isRunningAsPWA()) {
      console.log('✅ PWA detectado, criando banner de notificações...');
      createNotificationBanner();
      monitorNotificationPermission();
    } else {
      console.log('❌ Não é PWA, não mostrar banner');
    }
  }, 1500); // Mostra após 1.5 segundos
});

// Registra o Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch((error) => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });
}
