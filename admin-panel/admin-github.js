// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// ===== VARIÁVEIS GLOBAIS =====
let productsData = null;
let originalData = null;
let hasChanges = false;

// ===== CONFIGURAÇÕES GITHUB =====
const GITHUB_CONFIG = {
    owner: 'gabrielfavera07',
    repo: 'acaiecia',
    branch: 'main',
    filePath: 'products_with_prices.json'
};

// ===== URL DO PRODUCTS JSON =====
const PRODUCTS_JSON_URL = 'https://acaiecia.netlify.app/products_with_prices.json';

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
        originalData = JSON.parse(JSON.stringify(productsData));
        
        renderProducts();
        updateStats();
        hasChanges = false;
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publicar no GitHub';
        
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
    document.getElementById('site-id').value = localStorage.getItem('githubToken') || '';
    document.getElementById('access-token').value = ''; // Não mostrar o token por segurança
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
    const githubToken = document.getElementById('site-id').value.trim();
    const newPassword = document.getElementById('admin-password').value.trim();
    
    if (githubToken) {
        localStorage.setItem('githubToken', githubToken);
        showMessage('GitHub Token salvo com sucesso!', 'success');
    }
    if (newPassword) {
        localStorage.setItem('adminPassword', newPassword);
        showMessage('Senha atualizada com sucesso!', 'success');
    }
    
    settingsModal.classList.remove('active');
});

// ===== PUBLICAR NO GITHUB (DIRETAMENTE DO NAVEGADOR) =====
publishBtn.addEventListener('click', async () => {
    console.log('🚀 Iniciando publicação direta no GitHub...');
    
    if (!confirm('Deseja publicar as alterações? Esta ação fará commit no GitHub e o Netlify atualizará automaticamente em segundos.')) {
        return;
    }
    
    const githubToken = localStorage.getItem('githubToken');
    if (!githubToken) {
        showMessage('⚠️ GitHub Token não configurado! Configure nas Configurações.', 'error');
        settingsModal.classList.add('active');
        return;
    }
    
    try {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        
        // 1. Obter o SHA do arquivo atual
        console.log('� Obtendo SHA do arquivo atual...');
        const fileInfoUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}?ref=${GITHUB_CONFIG.branch}`;
        
        const fileInfoResponse = await fetch(fileInfoUrl, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!fileInfoResponse.ok) {
            throw new Error(`Erro ao obter informações do arquivo: ${fileInfoResponse.status}`);
        }
        
        const fileInfo = await fileInfoResponse.json();
        const currentSha = fileInfo.sha;
        console.log('✅ SHA atual:', currentSha);
        
        // 2. Preparar o conteúdo em Base64
        console.log('📦 Preparando conteúdo...');
        const jsonContent = JSON.stringify(productsData, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));
        
        // 3. Fazer commit
        console.log('💾 Enviando commit...');
        const updateUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
        
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `🔄 Atualização de produtos via Admin Panel - ${new Date().toLocaleString('pt-BR')}`,
                content: base64Content,
                sha: currentSha,
                branch: GITHUB_CONFIG.branch
            })
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('❌ Erro no commit:', errorData);
            throw new Error(errorData.message || 'Erro ao fazer commit');
        }
        
        const result = await updateResponse.json();
        console.log('✅ Commit realizado:', result);
        
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ⏳ Aguardando Netlify...';
        showMessage('✅ Commit realizado! Netlify está fazendo deploy...', 'success');
        
        // Aguardar alguns segundos
        setTimeout(() => {
            showMessage('🎉 Publicado! Aguarde 10-20 segundos e recarregue o site.', 'success');
            hasChanges = false;
            originalData = JSON.parse(JSON.stringify(productsData));
            publishBtn.disabled = true;
            publishBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publicar no GitHub';
        }, 3000);
        
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
