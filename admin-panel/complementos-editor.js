// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// ===== VARIÁVEIS GLOBAIS =====
let complementosData = null;
let hasChanges = false;

// ===== URL DO COMPLEMENTOS JSON =====
// const COMPLEMENTOS_JSON_URL = '../complementos_config.json'; // Para testes locais
const COMPLEMENTOS_JSON_URL = 'https://acaiecia.netlify.app/complementos_config.json'; // Para produção

// ===== CARREGAR COMPLEMENTOS =====
async function loadComplementos() {
    try {
        const response = await fetch(COMPLEMENTOS_JSON_URL);
        if (!response.ok) throw new Error('Erro ao carregar complementos');
        
        complementosData = await response.json();
        renderAllSections();
        hasChanges = false;
        
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao carregar complementos', 'error');
    }
}

// ===== RENDERIZAR TODAS AS SEÇÕES =====
function renderAllSections() {
    renderSimpleList('saboresAcai');
    renderPricedList('acompanhamentos');
    renderPricedList('adicionais');
    renderPricedList('salgados');
    renderSimpleList('molhos');
    renderSimpleList('refrigerantes');
    renderBebidasList();
}

// ===== RENDERIZAR LISTA SIMPLES (sem preço) =====
function renderSimpleList(key) {
    const container = document.getElementById(`list-${key}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const items = complementosData[key];
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhum item encontrado</p>';
        return;
    }
    
    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'simple-item';
        itemEl.innerHTML = `
            <i class="fas fa-grip-vertical item-handle"></i>
            <input 
                type="text" 
                value="${item}" 
                onchange="updateSimpleItem('${key}', ${index}, this.value)"
                placeholder="Nome do item"
            >
            <button class="btn-icon" onclick="deleteSimpleItem('${key}', ${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(itemEl);
    });
}

// ===== RENDERIZAR LISTA COM PREÇO =====
function renderPricedList(key) {
    const container = document.getElementById(`list-${key}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const items = complementosData[key];
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhum item encontrado</p>';
        return;
    }
    
    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item-row';
        itemEl.innerHTML = `
            <i class="fas fa-grip-vertical item-handle"></i>
            <input 
                type="text" 
                class="item-input" 
                value="${item.nome}" 
                onchange="updatePricedItem('${key}', ${index}, 'nome', this.value)"
                placeholder="Nome do item"
            >
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="color: var(--text-secondary); font-size: 14px;">R$</label>
                <input 
                    type="number" 
                    step="0.01"
                    class="item-input item-price" 
                    value="${item.preco}" 
                    onchange="updatePricedItem('${key}', ${index}, 'preco', parseFloat(this.value))"
                    placeholder="0.00"
                >
            </div>
            <button class="btn-icon" onclick="deletePricedItem('${key}', ${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(itemEl);
    });
}

// ===== RENDERIZAR LISTA DE BEBIDAS =====
function renderBebidasList() {
    const container = document.getElementById('list-bebidas');
    if (!container) return;
    
    container.innerHTML = '';
    
    const items = complementosData.bebidas;
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Nenhum item encontrado</p>';
        return;
    }
    
    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item-row';
        itemEl.style.flexDirection = 'column';
        itemEl.style.alignItems = 'stretch';
        itemEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-grip-vertical item-handle"></i>
                <input 
                    type="text" 
                    class="item-input" 
                    value="${item.nome}" 
                    onchange="updateBebidasItem(${index}, 'nome', this.value)"
                    placeholder="Nome da bebida"
                >
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label style="color: var(--text-secondary); font-size: 14px;">R$</label>
                    <input 
                        type="number" 
                        step="0.01"
                        class="item-input item-price" 
                        value="${item.preco}" 
                        onchange="updateBebidasItem(${index}, 'preco', parseFloat(this.value))"
                        placeholder="0.00"
                    >
                </div>
                <button class="btn-icon" onclick="deleteBebidasItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <textarea 
                class="item-input" 
                style="margin-top: 10px; min-height: 60px; resize: vertical;"
                onchange="updateBebidasItem(${index}, 'descricao', this.value)"
                placeholder="Descrição da bebida"
            >${item.descricao || ''}</textarea>
        `;
        container.appendChild(itemEl);
    });
}

// ===== ADICIONAR ITEM SIMPLES =====
function addSimpleItem(key) {
    if (!complementosData[key]) {
        complementosData[key] = [];
    }
    complementosData[key].push('Novo item');
    renderSimpleList(key);
    markAsChanged();
}

// ===== ADICIONAR ITEM COM PREÇO =====
function addPricedItem(key) {
    if (!complementosData[key]) {
        complementosData[key] = [];
    }
    complementosData[key].push({ nome: 'Novo item', preco: 0 });
    renderPricedList(key);
    markAsChanged();
}

// ===== ADICIONAR BEBIDA =====
function addBebidasItem() {
    if (!complementosData.bebidas) {
        complementosData.bebidas = [];
    }
    complementosData.bebidas.push({ 
        nome: 'Nova bebida', 
        descricao: '', 
        preco: 0 
    });
    renderBebidasList();
    markAsChanged();
}

// ===== ATUALIZAR ITEM SIMPLES =====
function updateSimpleItem(key, index, value) {
    complementosData[key][index] = value;
    markAsChanged();
}

// ===== ATUALIZAR ITEM COM PREÇO =====
function updatePricedItem(key, index, field, value) {
    complementosData[key][index][field] = value;
    markAsChanged();
}

// ===== ATUALIZAR BEBIDA =====
function updateBebidasItem(index, field, value) {
    complementosData.bebidas[index][field] = value;
    markAsChanged();
}

// ===== DELETAR ITEM SIMPLES =====
function deleteSimpleItem(key, index) {
    if (confirm('Deseja realmente deletar este item?')) {
        complementosData[key].splice(index, 1);
        renderSimpleList(key);
        markAsChanged();
    }
}

// ===== DELETAR ITEM COM PREÇO =====
function deletePricedItem(key, index) {
    if (confirm('Deseja realmente deletar este item?')) {
        complementosData[key].splice(index, 1);
        renderPricedList(key);
        markAsChanged();
    }
}

// ===== DELETAR BEBIDA =====
function deleteBebidasItem(index) {
    if (confirm('Deseja realmente deletar esta bebida?')) {
        complementosData.bebidas.splice(index, 1);
        renderBebidasList();
        markAsChanged();
    }
}

// ===== TROCAR ABA =====
function switchTab(tabName) {
    // Remover active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Ativar aba clicada
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ===== MARCAR COMO ALTERADO =====
function markAsChanged() {
    hasChanges = true;
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Salvar Alterações *';
        saveBtn.style.background = 'var(--warning)';
    }
}

// ===== SALVAR COMPLEMENTOS =====
async function saveComplementos() {
    if (!hasChanges) {
        showMessage('Não há alterações para salvar', 'info');
        return;
    }
    
    try {
        // Simular salvamento (na prática, isso seria feito no backend ou via Netlify API)
        const blob = new Blob([JSON.stringify(complementosData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'complementos_config.json';
        a.click();
        URL.revokeObjectURL(url);
        
        showMessage('Arquivo baixado! Faça upload manual no Netlify ou use o painel principal para publicar.', 'success');
        
        hasChanges = false;
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
            saveBtn.style.background = '';
        }
        
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showMessage('Erro ao salvar alterações', 'error');
    }
}

// ===== MENSAGENS =====
function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 4000);
}

// ===== PREVENÇÃO DE PERDA DE DADOS =====
window.addEventListener('beforeunload', (e) => {
    if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// ===== INICIALIZAÇÃO =====
loadComplementos();
