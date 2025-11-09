// ===== FUNÇÕES CRUD (Complemento do admin.js) =====
// Este arquivo contém todas as funções de Criar, Editar e Deletar produtos e categorias

// ===== MODAIS =====
const productModal = document.getElementById('product-modal');
const categoriesModal = document.getElementById('categories-modal');

// ===== MODAL DE PRODUTO =====
window.openProductModal = function(catIndex = null, itemIndex = null) {
    productModal.classList.add('active');
    
    // Preencher dropdown de categorias
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    productsData.categorias.forEach((cat, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = cat.nome;
        categorySelect.appendChild(option);
    });
    
    // Se for edição, preencher dados
    if (catIndex !== null && itemIndex !== null) {
        const product = productsData.categorias[catIndex].itens[itemIndex];
        document.getElementById('product-modal-title').textContent = 'Editar Produto';
        document.getElementById('product-cat-index').value = catIndex;
        document.getElementById('product-item-index').value = itemIndex;
        document.getElementById('product-category').value = catIndex;
        document.getElementById('product-name').value = product.nome || '';
        document.getElementById('product-description').value = product.descricao || '';
        document.getElementById('product-price-original').value = product.preco_original || '';
        document.getElementById('product-price-sale').value = product.preco_venda || '';
        document.getElementById('product-serves').value = product.serve || '';
        document.getElementById('product-image-url').value = product.imagem_url || '';
        document.getElementById('product-image-local').value = product.imagem_local || '';
        document.getElementById('product-active').checked = product.ativo !== false;
    } else {
        // Novo produto - limpar formulário
        document.getElementById('product-modal-title').textContent = 'Novo Produto';
        document.getElementById('product-cat-index').value = '';
        document.getElementById('product-item-index').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-description').value = '';
        document.getElementById('product-price-original').value = '';
        document.getElementById('product-price-sale').value = '';
        document.getElementById('product-serves').value = '';
        document.getElementById('product-image-url').value = '';
        document.getElementById('product-image-local').value = '';
        document.getElementById('product-active').checked = true;
    }
};

window.closeProductModal = function() {
    productModal.classList.remove('active');
};

window.saveProduct = function() {
    const catIndexInput = document.getElementById('product-cat-index').value;
    const itemIndexInput = document.getElementById('product-item-index').value;
    const catIndex = document.getElementById('product-category').value;
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const priceOriginal = document.getElementById('product-price-original').value;
    const priceSale = document.getElementById('product-price-sale').value;
    const serves = document.getElementById('product-serves').value.trim();
    const imageUrl = document.getElementById('product-image-url').value.trim();
    const imageLocal = document.getElementById('product-image-local').value.trim();
    const active = document.getElementById('product-active').checked;
    
    // Validação
    if (!catIndex) {
        showMessage('Selecione uma categoria', 'error');
        return;
    }
    if (!name) {
        showMessage('Digite o nome do produto', 'error');
        return;
    }
    if (!priceSale) {
        showMessage('Digite o preço de venda', 'error');
        return;
    }
    
    // Criar objeto do produto
    const product = {
        nome: name,
        descricao: description || null,
        preco_original: priceOriginal ? parseFloat(priceOriginal) : null,
        preco_venda: parseFloat(priceSale),
        serve: serves || null,
        tags: [],
        imagem_url: imageUrl || null,
        imagem_local: imageLocal || null,
        ativo: active
    };
    
    // Verificar se é edição ou criação
    if (catIndexInput !== '' && itemIndexInput !== '') {
        // Edição
        productsData.categorias[catIndexInput].itens[itemIndexInput] = product;
        showMessage(`Produto "${name}" atualizado com sucesso!`, 'success');
    } else {
        // Criação
        productsData.categorias[catIndex].itens.push(product);
        showMessage(`Produto "${name}" criado com sucesso!`, 'success');
    }
    
    markAsChanged();
    renderProducts(searchInput.value);
    updateStats();
    closeProductModal();
};

// ===== DELETAR PRODUTO =====
window.deleteProduct = function(catIndex, itemIndex) {
    const product = productsData.categorias[catIndex].itens[itemIndex];
    
    if (confirm(`Deseja realmente deletar o produto "${product.nome}"?`)) {
        productsData.categorias[catIndex].itens.splice(itemIndex, 1);
        markAsChanged();
        renderProducts(searchInput.value);
        updateStats();
        showMessage(`Produto "${product.nome}" deletado com sucesso!`, 'success');
    }
};

// ===== MODAL DE CATEGORIAS =====
window.openCategoriesModal = function() {
    categoriesModal.classList.add('active');
    renderCategoriesList();
};

window.closeCategoriesModal = function() {
    categoriesModal.classList.remove('active');
};

function renderCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = '';
    
    productsData.categorias.forEach((category, index) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <div class="category-item-name">
                <i class="fas fa-layer-group"></i>
                ${category.nome}
                <small style="color: var(--text-light); margin-left: 10px;">
                    (${category.itens.length} produto${category.itens.length !== 1 ? 's' : ''})
                </small>
            </div>
            <div class="category-item-actions">
                <button class="btn-edit-category" onclick="editCategory(${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete-category" onclick="deleteCategory(${index})">
                    <i class="fas fa-trash"></i> Deletar
                </button>
            </div>
        `;
        categoriesList.appendChild(categoryItem);
    });
}

// ===== ADICIONAR CATEGORIA =====
window.addCategory = function() {
    const name = document.getElementById('new-category-name').value.trim();
    
    if (!name) {
        showMessage('Digite o nome da categoria', 'error');
        return;
    }
    
    // Verificar se já existe
    const exists = productsData.categorias.some(cat => cat.nome.toLowerCase() === name.toLowerCase());
    if (exists) {
        showMessage('Já existe uma categoria com este nome', 'error');
        return;
    }
    
    // Criar nova categoria
    productsData.categorias.push({
        nome: name,
        itens: []
    });
    
    document.getElementById('new-category-name').value = '';
    markAsChanged();
    renderCategoriesList();
    updateStats();
    showMessage(`Categoria "${name}" criada com sucesso!`, 'success');
};

// ===== EDITAR CATEGORIA =====
window.editCategory = function(index) {
    const currentName = productsData.categorias[index].nome;
    const newName = prompt('Digite o novo nome da categoria:', currentName);
    
    if (newName && newName.trim() !== '' && newName !== currentName) {
        // Verificar se já existe
        const exists = productsData.categorias.some((cat, i) => 
            i !== index && cat.nome.toLowerCase() === newName.trim().toLowerCase()
        );
        
        if (exists) {
            showMessage('Já existe uma categoria com este nome', 'error');
            return;
        }
        
        productsData.categorias[index].nome = newName.trim();
        markAsChanged();
        renderCategoriesList();
        renderProducts(searchInput.value);
        showMessage(`Categoria renomeada para "${newName}"`, 'success');
    }
};

// ===== DELETAR CATEGORIA =====
window.deleteCategory = function(index) {
    const category = productsData.categorias[index];
    
    if (category.itens.length > 0) {
        if (!confirm(`A categoria "${category.nome}" possui ${category.itens.length} produto(s). Deseja realmente deletar a categoria e todos os produtos?`)) {
            return;
        }
    } else {
        if (!confirm(`Deseja realmente deletar a categoria "${category.nome}"?`)) {
            return;
        }
    }
    
    productsData.categorias.splice(index, 1);
    markAsChanged();
    renderCategoriesList();
    renderProducts(searchInput.value);
    updateStats();
    showMessage(`Categoria "${category.nome}" deletada com sucesso!`, 'success');
};

// ===== EVENTOS =====
document.getElementById('add-product-btn').addEventListener('click', () => {
    openProductModal();
});

document.getElementById('manage-categories-btn').addEventListener('click', () => {
    openCategoriesModal();
});

// Fechar modais clicando fora
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        closeProductModal();
    }
});

categoriesModal.addEventListener('click', (e) => {
    if (e.target === categoriesModal) {
        closeCategoriesModal();
    }
});
