document.addEventListener('DOMContentLoaded', () => {
    let restaurantData = null;
    let allCategories = [];
    let cart = [];

    // --- DOM Elements ---
    const productList = document.getElementById('product-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total-value');
    const cartCountSpan = document.getElementById('cart-count');
    const cartIconHeader = document.getElementById('cart-icon-header');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartOverlay = document.querySelector('.cart-overlay');
    const categoryDropdown = document.getElementById('category-dropdown');
    const productSectionTitle = document.querySelector('#produtos .section-title');

    // --- Fetch and Render Products ---
    function fetchProducts() {
        // Consumir JSON diretamente do GitHub Raw (atualização em tempo real)
        // Adicionar timestamp para evitar cache e sempre carregar a versão mais recente
        const cacheBuster = new Date().getTime();
        const jsonUrl = window.CONFIG ? window.CONFIG.jsonUrl : 'https://raw.githubusercontent.com/gabrielfavera07/acaiecia/main/products_with_prices.json';
        
        fetch(`${jsonUrl}?v=${cacheBuster}`)
            .then(response => response.json())
            .then(data => {
                restaurantData = data.restaurante;
                allCategories = data.categorias || [];
                populateCategories();
                renderProducts(); // Render all products initially
            })
            .catch(error => console.error('Error loading products:', error));
    }

    function populateCategories() {
        categoryDropdown.innerHTML = '';
        allCategories.forEach(category => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = category.nome;
            link.dataset.category = category.nome;
            categoryDropdown.appendChild(link);
        });
    }

    function renderProducts(selectedCategory = null) {
        productSectionTitle.textContent = selectedCategory || 'Nossos Produtos';
        productList.innerHTML = '';

        const categoriesToRender = selectedCategory
            ? allCategories.filter(cat => cat.nome === selectedCategory)
            : allCategories;

        categoriesToRender.forEach(category => {
            // Se estiver mostrando todas as categorias, adiciona título da categoria
            if (!selectedCategory) {
                const categoryTitle = document.createElement('h3');
                categoryTitle.classList.add('category-title');
                categoryTitle.textContent = category.nome;
                productList.appendChild(categoryTitle);
            }

            category.itens
                .filter(product => product.ativo !== false) // Filtrar apenas produtos ativos
                .forEach(product => {
                    const {
                        nome,
                        descricao,
                        preco_original,
                        preco_venda,
                        serve,
                        tags,
                        imagem_local,
                        imagem_url
                    } = product;

                // Usa imagem_local se disponível, senão usa imagem_url
                const imageUrl = imagem_local || imagem_url || 'placeholder.png';

                // Se não tem preço de venda, pula o produto
                if (!preco_venda) return;

                const productCard = document.createElement('div');
                productCard.classList.add('product-card');

                // Verifica se há desconto
                const hasDiscount = preco_original && preco_original > preco_venda;

                productCard.innerHTML = `
                    <div class="product-image-wrapper">
                        <img src="${imageUrl}" alt="${nome}" onerror="this.onerror=null;this.src='placeholder.png';">
                        ${hasDiscount ? `<span class="discount-badge">-${Math.round((1 - preco_venda / preco_original) * 100)}%</span>` : ''}
                        ${tags && tags.length > 0 ? `<span class="product-tag">${tags[0]}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <div>
                            <h3>${nome}</h3>
                            ${descricao ? `<p class="product-description">${descricao.substring(0, 100)}${descricao.length > 100 ? '...' : ''}</p>` : ''}
                            ${serve ? `<p class="product-serve"><i class="fas fa-users"></i> ${serve}</p>` : ''}
                            <div class="price-wrapper">
                                ${hasDiscount ? `<p class="price-original">R$ ${Number(preco_original).toFixed(2)}</p>` : ''}
                                <p class="price">R$ ${Number(preco_venda).toFixed(2)}</p>
                            </div>
                        </div>
                        <button class="btn btn-primary add-to-cart-btn"
                                data-name="${nome}"
                                data-price="${preco_venda}"
                                data-image="${imageUrl}">Adicionar ao Carrinho</button>
                    </div>
                `;

                // Adicionar evento de clique no card inteiro para abrir preview
                productCard.addEventListener('click', (e) => {
                    // Não abrir modal se clicar no botão de adicionar ao carrinho
                    if (!e.target.closest('.add-to-cart-btn')) {
                        openProductPreview({
                            nome,
                            descricao,
                            preco_venda,
                            preco_original,
                            serve,
                            tags,
                            imageUrl,
                            hasDiscount
                        });
                    }
                });

                productList.appendChild(productCard);
            });
        });

        // Se não houver produtos
        if (productList.children.length === 0) {
            productList.innerHTML = '<p style="text-align:center; padding: 40px; width: 100%;">Nenhum produto encontrado nesta categoria.</p>';
        }
    }

    // --- Product Preview Modal ---
    function openProductPreview(product) {
        const { nome, descricao, preco_venda, preco_original, serve, tags, imageUrl, hasDiscount } = product;

        // Verificar se a descrição é muito longa (mais de 120 caracteres para caber na tela)
        const isLongDescription = descricao && descricao.length > 120;
        const shortDescription = isLongDescription ? descricao.substring(0, 120) + '...' : descricao;

        // Criar overlay e modal
        const modalHTML = `
            <div class="product-preview-overlay" id="product-preview-overlay">
                <div class="product-preview-modal">
                    <div class="product-preview-header">
                        <button class="product-preview-back" onclick="closeProductPreview()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <span class="product-preview-header-title">Detalhes do Produto</span>
                        <button class="product-preview-close" onclick="closeProductPreview()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="product-preview-image">
                        <img src="${imageUrl}" alt="${nome}" onerror="this.onerror=null;this.src='placeholder.png';">
                        ${hasDiscount ? `<span class="discount-badge">-${Math.round((1 - preco_venda / preco_original) * 100)}%</span>` : ''}
                        ${tags && tags.length > 0 ? `<span class="product-tag">${tags[0]}</span>` : ''}
                    </div>

                    <div class="product-preview-content">
                        <h2 class="product-preview-title">${nome}</h2>

                        ${descricao ? `
                            <div class="product-preview-description-wrapper">
                                <p class="product-preview-description ${isLongDescription ? 'collapsed' : ''}" id="preview-description">
                                    ${isLongDescription ? shortDescription : descricao}
                                </p>
                                ${isLongDescription ? `
                                    <button class="preview-read-more" onclick="togglePreviewDescription()">
                                        <span class="read-more-text">Ler mais</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}

                        ${serve ? `
                            <div class="product-preview-serve">
                                <i class="fas fa-users"></i>
                                <span>${serve}</span>
                            </div>
                        ` : ''}

                        <div class="product-preview-divider"></div>

                        <div class="product-preview-price-section">
                            <div class="product-preview-price-wrapper">
                                <div class="price-label">Preço</div>
                                <div class="price-values">
                                    ${hasDiscount ? `<p class="product-preview-price-original">R$ ${Number(preco_original).toFixed(2)}</p>` : ''}
                                    <p class="product-preview-price">R$ ${Number(preco_venda).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <button class="btn btn-primary product-preview-add-btn add-to-cart-btn"
                                data-name="${nome}"
                                data-price="${preco_venda}"
                                data-image="${imageUrl}">
                            <i class="fas fa-shopping-cart"></i>
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar ao body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';

        // Guardar descrição completa no elemento
        if (isLongDescription) {
            const descElement = document.getElementById('preview-description');
            descElement.dataset.fullText = descricao;
            descElement.dataset.shortText = shortDescription;
        }

        // Adicionar evento de clique no overlay para fechar
        document.getElementById('product-preview-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'product-preview-overlay') {
                closeProductPreview();
            }
        });

        // Adicionar evento específico para o botão de adicionar ao carrinho do modal
        const previewAddBtn = document.querySelector('.product-preview-add-btn');
        if (previewAddBtn) {
            previewAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Pegar dados do produto
                const product = {
                    name: previewAddBtn.dataset.name,
                    price: parseFloat(previewAddBtn.dataset.price),
                    image: previewAddBtn.dataset.image
                };

                // Fechar o modal de preview primeiro
                closeProductPreview();

                // Abrir modal de customização
                setTimeout(() => {
                    productCustomizationModal.open(product, (customizedProduct) => {
                        addToCart(customizedProduct);
                        toggleCart(); // Abrir o carrinho após adicionar
                    });
                }, 300); // Aguardar 300ms para fechar o preview antes de abrir customização
            });
        }
    }

    window.togglePreviewDescription = function() {
        const descElement = document.getElementById('preview-description');
        const btn = document.querySelector('.preview-read-more');
        const isCollapsed = descElement.classList.contains('collapsed');

        if (isCollapsed) {
            descElement.textContent = descElement.dataset.fullText;
            descElement.classList.remove('collapsed');
            btn.querySelector('.read-more-text').textContent = 'Ler menos';
            btn.querySelector('i').classList.remove('fa-chevron-down');
            btn.querySelector('i').classList.add('fa-chevron-up');
        } else {
            descElement.textContent = descElement.dataset.shortText;
            descElement.classList.add('collapsed');
            btn.querySelector('.read-more-text').textContent = 'Ler mais';
            btn.querySelector('i').classList.remove('fa-chevron-up');
            btn.querySelector('i').classList.add('fa-chevron-down');
        }
    };

    window.closeProductPreview = function() {
        const overlay = document.getElementById('product-preview-overlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    };

    // --- Cart Logic ---
    function addToCart(product) {
        // Se o produto tem customizações, criar um ID único
        const productId = product.customizations 
            ? `${product.name}_${Date.now()}`
            : product.name;
        
        // Para produtos customizados, sempre adicionar como novo item
        if (product.customizations) {
            cart.push({ ...product, id: productId, quantity: 1 });
        } else {
            // Para produtos sem customização, verificar se já existe
            const existingItem = cart.find(item => item.name === product.name && !item.customizations);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, id: productId, quantity: 1 });
            }
        }
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                itemCount += item.quantity;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='placeholder.png';">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>R$ ${Number(item.price).toFixed(2)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-btn" data-name="${item.name}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-name="${item.name}">
                            <button class="quantity-btn increase-btn" data-name="${item.name}">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-name="${item.name}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        cartTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
        cartCountSpan.textContent = itemCount;
        cartCountSpan.style.display = itemCount > 0 ? 'flex' : 'none';
    }
    
    function removeFromCart(productName) {
        cart = cart.filter(item => item.name !== productName);
        updateCart();
    }

    function handleQuantityChange(productName, newQuantity) {
        const item = cart.find(item => item.name === productName);
        if (item) {
            const quantity = parseInt(newQuantity, 10);
            if (quantity > 0) {
                item.quantity = quantity;
            } else {
                removeFromCart(productName);
            }
        }
        updateCart();
    }

    // --- Event Listeners ---
    productList.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const product = {
                name: event.target.dataset.name,
                price: parseFloat(event.target.dataset.price),
                image: event.target.dataset.image
            };
            // Abrir modal de customização ao invés de adicionar diretamente
            productCustomizationModal.open(product, (customizedProduct) => {
                addToCart(customizedProduct);
                toggleCart(); // Abrir o carrinho após adicionar
            });
        }
    });

    categoryDropdown.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.tagName === 'A') {
            const category = event.target.dataset.category;
            renderProducts(category);
            document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
        }
    });

    document.getElementById('all-products-link').addEventListener('click', (event) => {
        event.preventDefault();
        renderProducts();
        document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
    });
    
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productName = target.dataset.name;

        if (target.classList.contains('remove-item-btn')) {
            removeFromCart(productName);
        } else if (target.classList.contains('increase-btn')) {
            const item = cart.find(item => item.name === productName);
            if (item) {
                item.quantity++;
                updateCart();
            }
        } else if (target.classList.contains('decrease-btn')) {
            const item = cart.find(item => item.name === productName);
            if (item) {
                item.quantity--;
                if (item.quantity <= 0) {
                    removeFromCart(productName);
                } else {
                    updateCart();
                }
            }
        }
    });

    cartItemsContainer.addEventListener('change', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            const productName = event.target.dataset.name;
            const newQuantity = event.target.value;
            handleQuantityChange(productName, newQuantity);
        }
    });

    function toggleCart() {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    cartIconHeader.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Botão "Adicionar outros itens" fecha o modal
    const addMoreItemsBtn = document.querySelector('.add-more-items-btn');
    if (addMoreItemsBtn) {
        addMoreItemsBtn.addEventListener('click', toggleCart);
    }

    // Função para formatar customizações para WhatsApp
    function formatCustomizations(customizations) {
        if (!customizations) return '';
        
        let formatted = '';
        
        if (customizations.talher) {
            formatted += `   • ${customizations.talher === 'sim' ? 'Sim, preciso de talher' : 'Não precisa de talher'}\n`;
        }
        
        if (customizations.saborAcai) {
            // Verifica se é array ou string
            const sabores = Array.isArray(customizations.saborAcai) 
                ? customizations.saborAcai 
                : customizations.saborAcai.split(',');
            sabores.forEach(sabor => {
                formatted += `• ${sabor.trim()}\n`;
            });
        }
        
        if (customizations.separacao) {
            formatted += `• ${customizations.separacao === 'separado' ? 'Separado (+R$ 4,00)' : 'Dentro do copo'}\n`;
        }
        
        if (customizations.acompanhamentos && customizations.acompanhamentos.length > 0) {
            customizations.acompanhamentos.forEach(item => {
                formatted += `   • ${item}\n`;
            });
        }
        
        if (customizations.adicionais && customizations.adicionais.length > 0) {
            customizations.adicionais.forEach(item => {
                formatted += `   • ${item}\n`;
            });
        }
        
        if (customizations.salgados && customizations.salgados.length > 0) {
            customizations.salgados.forEach(item => {
                formatted += `   • ${item}\n`;
            });
        }
        
        if (customizations.molhos && customizations.molhos.length > 0) {
            customizations.molhos.forEach(item => {
                formatted += `   • ${item}\n`;
            });
        }
        
        if (customizations.bebidas && customizations.bebidas.length > 0) {
            customizations.bebidas.forEach(item => {
                formatted += `   • ${item}\n`;
            });
        }
        
        if (customizations.refrigerante) {
            formatted += `   • ${customizations.refrigerante}\n`;
        }
        
        return formatted;
    }

    // Função para enviar pedido para WhatsApp
    function sendToWhatsApp(address, paymentData) {
        let message = `*🛒 Pedido - AÇAI E CIA*\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Adicionar link do Google Maps se houver coordenadas
        if (address.latitude && address.longitude) {
            message += `   📌  Ver no mapa:\n`;
            message += `   https://www.google.com/maps?q=${address.latitude},${address.longitude}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
        }
        
        message += `*Itens do pedido*\n \n`;
        
        // Adicionar itens do pedido
        cart.forEach((item, index) => {
            message += `*${item.quantity}x UNIDADE(S) DE:*\n${item.name} \n`;
            
            if (item.customizations) {
                message += formatCustomizations(item.customizations);
            }
            
            message += `   \n*Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}*\n\n`;
        });
        
        // Total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `*💵 TOTAL: R$ ${total.toFixed(2)}+ Frete*\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Endereço de entrega
        message += `📍 *Endereço de Entrega:*\n`;
        if (address.apelido) {
            message += `   ${address.apelido}\n`;
        }
        message += `   ${address.logradouro}${address.numero ? `, ${address.numero}` : ''}`;
        if (address.complemento) {
            message += ` - ${address.complemento}`;
        }
        message += `\n   ${address.bairro}\n`;
        message += `   ${address.localidade}/${address.uf}\n`;
        message += `   CEP: ${address.cep}\n`;
        if (address.referencia) {
            message += `   Ref: ${address.referencia}\n`;
        }
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Forma de pagamento
        if (paymentData) {
            message += `💰 *Forma de Pagamento:*\n`;
            
            const paymentLabels = {
                'credito': 'Cartão de Crédito 💳',
                'debito': 'Cartão de Débito 💳',
                'dinheiro': 'Dinheiro 💵',
                'pix': 'PIX 📱'
            };
            
            message += `   ${paymentLabels[paymentData.method] || paymentData.method}\n`;
            
            if (paymentData.method === 'dinheiro') {
                if (paymentData.needsChange) {
                    message += `   💵 Levar troco para: R$ ${parseFloat(paymentData.changeAmount).toFixed(2)}\n`;
                } else {
                    message += `   ✓ Pagamento com valor exato\n`;
                }
            }
            
            message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        }
        
        message += `Obrigado pela preferência! 🙏`;
        
        // Enviar para WhatsApp
        const whatsappNumber = restaurantData?.telefone?.replace(/\D/g, '') || '5521987943015';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Limpar carrinho após enviar
        cart = [];
        updateCart();
        toggleCart();
    }

    document.querySelector('.checkout-button').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        // Abrir modal de endereço
        addressManager.open((address, paymentData) => {
            sendToWhatsApp(address, paymentData);
        });
    });

    // Handle dropdowns in mobile
    const dropdowns = document.querySelectorAll('.main-nav .dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.category-link');
        link.addEventListener('click', (event) => {
            if (window.innerWidth <= 992) {
                event.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    // --- View Toggle Logic ---
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    let currentView = 'grid';

    // Definir view padrão baseado no tamanho da tela
    function setDefaultView() {
        const isMobile = window.innerWidth <= 768;
        currentView = isMobile ? 'list' : 'grid';

        // Update button states
        viewToggleBtns.forEach(btn => {
            if (btn.dataset.view === currentView) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update product list class
        if (currentView === 'list') {
            productList.classList.remove('product-grid');
            productList.classList.add('product-list');
        } else {
            productList.classList.remove('product-list');
            productList.classList.add('product-grid');
        }
    }

    // Aplicar view padrão ao carregar
    setDefaultView();

    // Atualizar view ao redimensionar a tela
    window.addEventListener('resize', () => {
        setDefaultView();
    });

    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view === currentView) return;

            currentView = view;

            // Update button states
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update product list class
            if (view === 'list') {
                productList.classList.remove('product-grid');
                productList.classList.add('product-list');
            } else {
                productList.classList.remove('product-list');
                productList.classList.add('product-grid');
            }
        });
    });

    // --- Sticky Category Menu Logic ---
    const stickyCategoryMenu = document.getElementById('sticky-category-menu');
    const categoryMenuScroll = document.getElementById('category-menu-scroll');
    const productsSection = document.getElementById('produtos');
    let categoryMenuItems = [];

    function populateStickyCategoryMenu() {
        categoryMenuScroll.innerHTML = '';
        allCategories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'category-menu-item';
            item.textContent = category.nome;
            item.dataset.category = category.nome;
            item.addEventListener('click', () => scrollToCategory(category.nome));
            categoryMenuScroll.appendChild(item);
            categoryMenuItems.push(item);
        });
    }

    function scrollToCategory(categoryName) {
        const categoryTitle = Array.from(document.querySelectorAll('.category-title'))
            .find(title => title.textContent === categoryName);

        if (categoryTitle) {
            const offset = 115; // Altura da faixa de entrega (44px) + sticky menu (60px) + margem (11px)
            const elementPosition = categoryTitle.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update active state
            categoryMenuItems.forEach(item => item.classList.remove('active'));
            const activeItem = categoryMenuItems.find(item => item.dataset.category === categoryName);
            if (activeItem) activeItem.classList.add('active');
        }
    }

    // Show/hide sticky menu on scroll
    const mainHeader = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const productsSectionTop = productsSection.offsetTop;
        const productsSectionBottom = productsSectionTop + productsSection.offsetHeight;

        // Show menu when scrolled past the products section title
        if (scrollTop > productsSectionTop + 100 && scrollTop < productsSectionBottom - 200) {
            stickyCategoryMenu.classList.add('visible');
            mainHeader.classList.add('hidden');
        } else {
            stickyCategoryMenu.classList.remove('visible');
            mainHeader.classList.remove('hidden');
        }

        // Update active category based on scroll position
        updateActiveCategoryOnScroll();
    });

    function updateActiveCategoryOnScroll() {
        const categoryTitles = document.querySelectorAll('.category-title');
        const scrollPosition = window.pageYOffset + 150; // Ajustado para faixa de entrega + sticky menu

        categoryTitles.forEach(title => {
            const categoryTop = title.offsetTop;
            const categoryBottom = categoryTop + title.offsetHeight + 300;

            if (scrollPosition >= categoryTop && scrollPosition < categoryBottom) {
                const categoryName = title.textContent;
                categoryMenuItems.forEach(item => item.classList.remove('active'));
                const activeItem = categoryMenuItems.find(item => item.dataset.category === categoryName);
                if (activeItem) activeItem.classList.add('active');
            }
        });
    }


    // --- Initial Load ---
    fetchProducts();
    updateCart(); // Initial call to set cart count display
});
