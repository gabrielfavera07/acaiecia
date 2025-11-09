// PWA Installation Banner Logic

let deferredPrompt;
let installBannerDismissed = false;

// Detecta se o app está rodando como PWA instalado
function isRunningAsPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
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
