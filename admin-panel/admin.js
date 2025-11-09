// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// ===== VARIÁVEIS GLOBAIS =====
let productsData = null;
let originalData = null;
let hasChanges = false;

// ===== CREDENCIAIS NETLIFY (HARDCODED) =====
const NETLIFY_SITE_ID = '14b46adc-e363-4b3d-9eba-24d6a4a1007f'; // Site principal (acaiecia)
const NETLIFY_ACCESS_TOKEN = 'nfp_L3bayFK1Cib3HGjY7mPzrzJ6xZNv2JTd8b4b'; // Personal Access Token

// ===== URL DO PRODUCTS JSON =====
// IMPORTANTE: Você deve atualizar esta URL para apontar para o seu site no Netlify
// const PRODUCTS_JSON_URL = '../products_with_prices.json'; // Para testes locais
const PRODUCTS_JSON_URL = 'https://acaiecia.netlify.app/products_with_prices.json'; // Para produção

// ===== ELEMENTOS DO DOM =====
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const reloadBtn = document.getElementById('reload-btn');
const publishBtn = document.getElementById('publish-btn');
const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// ===== ESTATÍSTICAS =====
const activeCountEl = document.getElementById('active-count');
const inactiveCountEl = document.getElementById('inactive-count');
const totalCountEl = document.getElementById('total-count');
const categoryCountEl = document.getElementById('category-count');

// ===== FUNÇÕES AUXILIARES =====
function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 4000);
}

function updateStats() {
    if (!productsData) return;
    
    let activeCount = 0;
    let inactiveCount = 0;
    let totalCount = 0;
    
    productsData.categorias.forEach(category => {
        category.itens.forEach(item => {
            totalCount++;
            if (item.ativo !== false) {
                activeCount++;
            } else {
                inactiveCount++;
            }
        });
    });
    
    activeCountEl.textContent = activeCount;
    inactiveCountEl.textContent = inactiveCount;
    totalCountEl.textContent = totalCount;
    categoryCountEl.textContent = productsData.categorias.length;
}

function markAsChanged() {
    hasChanges = true;
    publishBtn.disabled = false;
    publishBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Publicar Alterações';
}

// ===== CARREGAR PRODUTOS =====
async function loadProducts() {
    try {
        productsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando produtos...</p></div>';
        
        const response = await fetch(PRODUCTS_JSON_URL);
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        productsData = await response.json();
        originalData = JSON.parse(JSON.stringify(productsData)); // Deep clone
        
        renderProducts();
        updateStats();
        hasChanges = false;
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publicar no Netlify';
        
    } catch (error) {
        console.error('Erro:', error);
        productsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                <p>Erro ao carregar produtos. Verifique a conexão e tente novamente.</p>
            </div>
        `;
        showMessage('Erro ao carregar produtos', 'error');
    }
}

// ===== RENDERIZAR PRODUTOS =====
function renderProducts(filterText = '') {
    if (!productsData) return;
    
    productsContainer.innerHTML = '';
    
    productsData.categorias.forEach((category, catIndex) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.innerHTML = `
            <i class="fas fa-layer-group"></i>
            <h2>${category.nome}</h2>
        `;
        categorySection.appendChild(categoryHeader);
        
        category.itens.forEach((item, itemIndex) => {
            // Filtro de busca
            if (filterText && !item.nome.toLowerCase().includes(filterText.toLowerCase())) {
                return;
            }
            
            const productItem = document.createElement('div');
            productItem.className = `product-item ${item.ativo === false ? 'inactive' : ''}`;
            productItem.dataset.categoryIndex = catIndex;
            productItem.dataset.itemIndex = itemIndex;
            
            productItem.innerHTML = `
                <div class="product-toggle">
                    <div class="toggle-switch ${item.ativo !== false ? 'active' : ''}" onclick="toggleProduct(${catIndex}, ${itemIndex})">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
                
                <div class="product-info">
                    <div class="product-name">
                        <i class="fas fa-box"></i>
                        ${item.nome}
                    </div>
                    
                    <div class="price-inputs">
                        <div class="price-input">
                            <label>Preço Original</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value="${item.preco_original || ''}" 
                                placeholder="R$"
                                onchange="updatePrice(${catIndex}, ${itemIndex}, 'preco_original', this.value)"
                            >
                        </div>
                        <div class="price-input">
                            <label>Preço Venda</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value="${item.preco_venda || ''}" 
                                placeholder="R$"
                                onchange="updatePrice(${catIndex}, ${itemIndex}, 'preco_venda', this.value)"
                            >
                        </div>
                    </div>
                    
                    <div class="product-status">
                        ${item.ativo !== false 
                            ? '<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Ativo</span>' 
                            : '<span style="color: var(--warning);"><i class="fas fa-pause-circle"></i> Pausado</span>'}
                    </div>
                </div>
                
                <div class="product-item-actions">
                    <button class="btn-edit-product" onclick="openProductModal(${catIndex}, ${itemIndex})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete-product" onclick="deleteProduct(${catIndex}, ${itemIndex})">
                        <i class="fas fa-trash"></i> Deletar
                    </button>
                </div>
            `;
            
            categorySection.appendChild(productItem);
        });
        
        productsContainer.appendChild(categorySection);
    });
}

// ===== TOGGLE PRODUTO ATIVO/INATIVO =====
window.toggleProduct = function(catIndex, itemIndex) {
    const item = productsData.categorias[catIndex].itens[itemIndex];
    item.ativo = !item.ativo;
    markAsChanged();
    renderProducts(searchInput.value);
    updateStats();
    showMessage(`Produto "${item.nome}" ${item.ativo ? 'ativado' : 'pausado'}`, 'info');
};

// ===== ATUALIZAR PREÇO =====
window.updatePrice = function(catIndex, itemIndex, field, value) {
    const item = productsData.categorias[catIndex].itens[itemIndex];
    const numValue = value ? parseFloat(value) : null;
    item[field] = numValue;
    markAsChanged();
    showMessage(`Preço atualizado para "${item.nome}"`, 'info');
};

// ===== BUSCA =====
searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value);
});

// ===== RECARREGAR PRODUTOS =====
reloadBtn.addEventListener('click', () => {
    if (hasChanges) {
        if (confirm('Você tem alterações não salvas. Deseja realmente recarregar?')) {
            loadProducts();
        }
    } else {
        loadProducts();
    }
});

// ===== LOGOUT =====
logoutBtn.addEventListener('click', () => {
    if (hasChanges) {
        if (confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        }
    } else {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }
});

// ===== MODAL DE CONFIGURAÇÕES =====
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
    
    // Carregar configurações salvas
    document.getElementById('site-id').value = localStorage.getItem('netlifySiteId') || '';
    document.getElementById('access-token').value = localStorage.getItem('netlifyAccessToken') || '';
});

document.querySelector('.modal-close').addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

saveSettingsBtn.addEventListener('click', () => {
    const siteId = document.getElementById('site-id').value.trim();
    const accessToken = document.getElementById('access-token').value.trim();
    const newPassword = document.getElementById('admin-password').value.trim();
    
    if (siteId) localStorage.setItem('netlifySiteId', siteId);
    if (accessToken) localStorage.setItem('netlifyAccessToken', accessToken);
    if (newPassword) localStorage.setItem('adminPassword', newPassword);
    
    settingsModal.classList.remove('active');
    showMessage('Configurações salvas com sucesso!', 'success');
    
    // Habilitar botão de publicar se as credenciais estiverem configuradas
    if (siteId && accessToken && hasChanges) {
        publishBtn.disabled = false;
    }
});

// ===== PUBLICAR NO NETLIFY =====
publishBtn.addEventListener('click', async () => {
    const siteId = NETLIFY_SITE_ID;
    const accessToken = NETLIFY_ACCESS_TOKEN;
    
    console.log('🚀 Iniciando publicação...');
    console.log('Site ID:', siteId);
    console.log('Token:', accessToken ? 'Configurado ✓' : 'ERRO: Token não encontrado!');
    
    if (!confirm('Deseja publicar as alterações no site? Esta ação irá atualizar o site ao vivo.')) {
        return;
    }
    
    try {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        
        // Converter o JSON para string formatada
        const jsonContent = JSON.stringify(productsData, null, 2);
        
        console.log('📦 Preparando deploy...');
        console.log('Tamanho do JSON:', jsonContent.length, 'caracteres');
        
        // Criar o deploy no Netlify
        const deployUrl = `https://api.netlify.com/api/v1/sites/${siteId}/deploys`;
        console.log('📡 URL do deploy:', deployUrl);
        
        const response = await fetch(deployUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                files: {
                    '/products_with_prices.json': jsonContent
                }
            })
        });
        
        console.log('📨 Response status:', response.status);
        console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', errorText);
            let errorMessage = 'Erro ao fazer deploy';
            try {
                const error = JSON.parse(errorText);
                errorMessage = error.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        const deploy = await response.json();
        console.log('✅ Deploy criado:', deploy);
        
        showMessage('Publicação iniciada com sucesso! O site será atualizado em alguns segundos.', 'success');
        
        // Verificar status do deploy periodicamente
        let checkCount = 0;
        const maxChecks = 30; // 30 x 5s = 150 segundos (2.5 minutos)
        
        const checkStatus = async () => {
            try {
                checkCount++;
                
                const statusUrl = `https://api.netlify.com/api/v1/deploys/${deploy.id}`;
                console.log(`🔍 Verificando status (${checkCount}/${maxChecks}):`, statusUrl);
                
                const statusResponse = await fetch(statusUrl, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                const status = await statusResponse.json();
                console.log('📊 Status do deploy:', status.state, status);
                
                // Estados possíveis: uploading, processing, building, ready, error
                if (status.state === 'ready') {
                    showMessage('✅ Site atualizado com sucesso!', 'success');
                    hasChanges = false;
                    originalData = JSON.parse(JSON.stringify(productsData));
                    publishBtn.disabled = true;
                    publishBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publicar no Netlify';
                } else if (status.state === 'error') {
                    showMessage('❌ Erro no deploy. Verifique os logs no Netlify.', 'error');
                    publishBtn.disabled = false;
                    publishBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Publicar Alterações';
                } else if (checkCount < maxChecks) {
                    // Ainda em andamento (uploading, processing, building)
                    const stateMessages = {
                        'uploading': '📤 Fazendo upload...',
                        'processing': '⚙️ Processando...',
                        'building': '🔨 Construindo...'
                    };
                    const msg = stateMessages[status.state] || `⏳ Aguardando (${status.state})...`;
                    publishBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${msg}`;
                    setTimeout(checkStatus, 5000);
                } else {
                    // Timeout - demorou muito, mas pode estar processando
                    showMessage('⏰ Deploy demorou muito. Aguarde 1-2 minutos e recarregue a página.', 'info');
                    publishBtn.innerHTML = '<i class="fas fa-clock"></i> Verificar Manualmente';
                    publishBtn.disabled = false;
                    publishBtn.onclick = () => window.open('https://app.netlify.com/sites/acaiecia/deploys', '_blank');
                }
            } catch (err) {
                console.error('Erro ao verificar status:', err);
                publishBtn.disabled = false;
                publishBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Publicar Alterações';
            }
        };
        
        // Iniciar verificação após 5 segundos
        setTimeout(checkStatus, 5000);
        
    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error);
        console.error('Stack:', error.stack);
        showMessage(`Erro ao publicar: ${error.message}`, 'error');
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Publicar Alterações';
    }
});

// ===== INICIALIZAÇÃO =====
loadProducts();

// ===== PREVENÇÃO DE PERDA DE DADOS =====
window.addEventListener('beforeunload', (e) => {
    if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});
