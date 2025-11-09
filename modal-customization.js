// Modal de Customização de Produtos
class ProductCustomizationModal {
    constructor() {
        this.selections = {};
        this.errors = {};
        this.currentItem = null;
        this.totalPrice = 0;
        this.onAddToCart = null;
    }

    open(item, onAddToCartCallback) {
        this.currentItem = item;
        this.onAddToCart = onAddToCartCallback;
        this.selections = {};
        this.errors = {};
        this.totalPrice = parseFloat(item.price);

        console.log('Abrindo modal para:', item.name);
        console.log('Opções de customização:', this.getCustomizationOptions());

        // Inicializar seleção padrão de complementos separados
        const customOptions = this.getCustomizationOptions();
        if (customOptions.hasComplementosSeparados) {
            this.selections.complementosSeparados = 'nao'; // Padrão: misturados
        }

        this.render();
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('product-customization-modal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = '';
    }

    getCustomizationOptions() {
        // Atualizado: 2025-11-08 - Removida opção de separação para Barca e Titanic
        const productName = this.currentItem.name.toLowerCase();

        // Para combos (salgado/hamburguer + açaí) - VERIFICAR PRIMEIRO!
        // Combos NÃO têm opção de separação se forem Barca ou Titanic
        if ((productName.includes('salgado') || productName.includes('x-') ||
             productName.includes('supreme') || productName.includes('hamburguer')) &&
            (productName.includes('açaí') || productName.includes('acai'))) {

            // Barca e Titanic NÃO têm opção de separação de complementos
            const isBarcaOrTitanic = productName.includes('barca') || productName.includes('titanic');

            return {
                hasSalgados: true,
                hasAcai: true,
                hasAcompanhamentos: true,
                hasAdicionais: true,
                hasSeparacao: !isBarcaOrTitanic,
                hasMolhos: true,
                hasBebidas: true,
                hasComplementosSeparados: false,
                numSalgados: productName.includes('2 salgados') ? 2 : 1,
                maxAcompanhamentos: 5
            };
        }

        // Para açaí e sorvete (apenas produtos que NÃO são combos)
        if (productName.includes('açaí') || productName.includes('acai') ||
            productName.includes('sorvete') || productName.includes('barca') ||
            productName.includes('titanic') || productName.includes('litro')) {

            // Barca, Titanic e 5 litros têm limite de 8 acompanhamentos
            const maxAcompanhamentos = (productName.includes('barca') ||
                                       productName.includes('titanic') ||
                                       productName.includes('5 litros') ||
                                       productName.includes('5 litro')) ? 8 : 5;

            // Barca e Titanic NÃO têm opção de separação de complementos
            const isBarcaOrTitanic = productName.includes('barca') || productName.includes('titanic');

            return {
                hasAcai: true,
                hasAcompanhamentos: true,
                hasAdicionais: true,
                hasSeparacao: !isBarcaOrTitanic,
                hasComplementosSeparados: false,
                maxAcompanhamentos: maxAcompanhamentos
            };
        }

        // Para combos com salgados (sem açaí)
        if (productName.includes('salgado') || productName.includes('combo')) {
            return {
                hasSalgados: true,
                hasAcai: false,
                hasMolhos: true,
                hasBebidas: true,
                hasRefrigerante: productName.includes('refrigerante'),
                hasGuarana: productName.includes('guaravita'),
                numSalgados: productName.includes('2 salgados') ? 2 : 1
            };
        }

        // Para salgados individuais (fora de combo)
        if (productName.includes('italiano') || productName.includes('coxinha') ||
            productName.includes('risole') || productName.includes('kibe') ||
            productName.includes('enroladinho') || productName.includes('bolinho') ||
            productName.includes('esfiha') || productName.includes('croissant') ||
            productName.includes('pastel') ||
            (productName.includes('hamburguer') && !productName.includes('x-') && !productName.includes('x ') && !productName.includes('supreme'))) {
            return {
                hasMolhos: true,
                hasBebidas: true
            };
        }

        // Para hambúrgueres X-
        if (productName.includes('x-') || productName.includes('x ') ||
            productName.includes('big') || productName.includes('clássico') ||
            productName.includes('supreme') || productName.includes('baconzada')) {
            return {
                hasMolhos: true,
                hasAdicionais: true,
                hasBebidas: true
            };
        }

        // Produto sem customização específica (ainda assim mostra talher)
        return {};
    }

    calculateTotalPrice() {
        let total = parseFloat(this.currentItem.price);
        
        if (this.selections.separacao === 'separado') {
            total += 4.00;
        }
        
        if (this.selections.acompanhamentos) {
            this.selections.acompanhamentos.forEach(acomp => {
                const acompItem = acompanhamentos.find(a => a.nome === acomp);
                if (acompItem) total += acompItem.preco;
            });
        }
        
        if (this.selections.adicionais) {
            this.selections.adicionais.forEach(adic => {
                const adicItem = adicionais.find(a => a.nome === adic);
                if (adicItem) total += adicItem.preco;
            });
        }
        
        if (this.selections.salgados) {
            this.selections.salgados.forEach(salg => {
                const salgItem = salgados.find(s => s.nome === salg);
                if (salgItem) total += salgItem.preco;
            });
        }
        
        if (this.selections.bebidas) {
            this.selections.bebidas.forEach(beb => {
                const bebItem = bebidas.find(b => b.nome === beb);
                if (bebItem) total += bebItem.preco;
            });
        }
        
        this.totalPrice = total;
        this.updateTotalDisplay();
    }

    updateTotalDisplay() {
        const totalElement = document.getElementById('modal-total-price');
        if (totalElement) {
            totalElement.textContent = `R$ ${this.totalPrice.toFixed(2)}`;
        }
    }

    isFormValid() {
        const customOptions = this.getCustomizationOptions();

        if (customOptions.hasSalgados) {
            const numRequired = customOptions.numSalgados || 1;
            const selected = this.selections.salgados?.length || 0;
            if (selected !== numRequired) return false;
        }

        if (customOptions.hasAcai) {
            const selectedSabores = this.selections.saborAcai?.length || 0;
            if (selectedSabores === 0 || selectedSabores > 2) return false;
        }

        if (customOptions.hasMolhos && (!this.selections.molhos || this.selections.molhos.length === 0)) return false;
        if (customOptions.hasAcompanhamentos && (!this.selections.acompanhamentos || this.selections.acompanhamentos.length === 0)) return false;
        if (customOptions.hasAdicionais && (!this.selections.adicionais || this.selections.adicionais.length === 0)) return false;
        if (customOptions.hasBebidas && (!this.selections.bebidas || this.selections.bebidas.length === 0)) return false;
        if (customOptions.hasSeparacao && !this.selections.separacao) return false;
        if (customOptions.hasRefrigerante && !this.selections.refrigerante) return false;

        return true;
    }

    validateSelections() {
        const customOptions = this.getCustomizationOptions();
        const newErrors = {};

        if (customOptions.hasSalgados) {
            const numRequired = customOptions.numSalgados || 1;
            const selected = this.selections.salgados?.length || 0;
            if (selected !== numRequired) {
                newErrors.salgados = `Selecione exatamente ${numRequired} salgado(s)`;
            }
        }

        if (customOptions.hasAcai) {
            const selectedSabores = this.selections.saborAcai?.length || 0;
            if (selectedSabores === 0) {
                newErrors.saborAcai = 'Selecione pelo menos 1 sabor (até 2)';
            } else if (selectedSabores > 2) {
                newErrors.saborAcai = 'Selecione no máximo 2 sabores';
            }
        }

        if (customOptions.hasMolhos && (!this.selections.molhos || this.selections.molhos.length === 0)) {
            newErrors.molhos = 'Selecione pelo menos 1 opção de molho';
        }

        if (customOptions.hasAcompanhamentos && (!this.selections.acompanhamentos || this.selections.acompanhamentos.length === 0)) {
            newErrors.acompanhamentos = 'Selecione pelo menos 1 acompanhamento';
        }

        if (customOptions.hasAdicionais && (!this.selections.adicionais || this.selections.adicionais.length === 0)) {
            newErrors.adicionais = 'Selecione pelo menos 1 opção de adicional';
        }

        if (customOptions.hasBebidas && (!this.selections.bebidas || this.selections.bebidas.length === 0)) {
            newErrors.bebidas = 'Selecione pelo menos 1 opção';
        }

        if (customOptions.hasSeparacao && !this.selections.separacao) {
            newErrors.separacao = 'Escolha como deseja receber';
        }

        if (customOptions.hasRefrigerante && !this.selections.refrigerante) {
            newErrors.refrigerante = 'Selecione 1 refrigerante';
        }

        this.errors = newErrors;
        return Object.keys(newErrors).length === 0;
    }

    handleAddToCart() {
        if (!this.isFormValid()) {
            this.validateSelections();
            this.renderErrors();
            this.scrollToFirstError();
            return;
        }
        
        if (this.validateSelections()) {
            const customizedProduct = {
                ...this.currentItem,
                price: this.totalPrice,
                originalPrice: parseFloat(this.currentItem.price),
                customizations: { ...this.selections }
            };
            
            this.onAddToCart(customizedProduct);
            this.close();
        }
    }

    scrollToFirstError() {
        const firstError = document.querySelector('.error-message');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    renderErrors() {
        Object.keys(this.errors).forEach(key => {
            const errorElement = document.getElementById(`error-${key}`);
            if (errorElement) {
                errorElement.textContent = this.errors[key];
                errorElement.style.display = 'block';
            }
        });
    }

    scrollToNextSection(currentCategory) {
        const modal = document.getElementById('product-customization-modal');
        if (!modal) return;

        const customOptions = this.getCustomizationOptions();
        const modalBody = modal.querySelector('.modal-body');
        if (!modalBody) return;
        
        const sections = modalBody.querySelectorAll('.customization-section');
        let foundCurrent = false;
        
        for (const section of sections) {
            if (foundCurrent) {
                // Encontrou a seção atual, agora verificar a próxima
                const sectionKey = this.getSectionKeyFromElement(section);
                
                // Se é uma seção obrigatória não preenchida, rolar até ela
                const h3 = section.querySelector('h3');
                const isRequired = h3 && h3.innerHTML.includes('*');
                
                if (isRequired && sectionKey && !this.isSectionFilled(sectionKey, customOptions)) {
                    // Rolar suavemente até o topo da seção dentro do modal-body
                    const sectionTop = section.offsetTop - 100; // 100px de espaço para mostrar o título completo
                    modalBody.scrollTo({ top: sectionTop, behavior: 'smooth' });
                    return;
                }
                
                // Se não é obrigatória ou já está preenchida, rolar mesmo assim
                if (!isRequired || (sectionKey && this.isSectionFilled(sectionKey, customOptions))) {
                    const sectionTop = section.offsetTop - 100; // 100px de espaço para mostrar o título completo
                    modalBody.scrollTo({ top: sectionTop, behavior: 'smooth' });
                    return;
                }
            }
            
            // Verificar se esta é a seção atual
            const dataSection = section.getAttribute('data-section');
            if (dataSection === currentCategory || section.querySelector(`[data-category="${currentCategory}"]`)) {
                foundCurrent = true;
            }
        }
    }

    getSectionKeyFromElement(section) {
        const dataSection = section.getAttribute('data-section');
        if (dataSection) return dataSection;
        
        const h3 = section.querySelector('h3');
        if (!h3) return null;
        
        const text = h3.textContent.toLowerCase();
        if (text.includes('separado')) return 'separacao';
        if (text.includes('salgado')) return 'salgados';
        if (text.includes('molho')) return 'molhos';
        if (text.includes('refrigerante')) return 'refrigerante';
        
        return null;
    }

    isSectionFilled(sectionKey, customOptions) {
        switch (sectionKey) {
            case 'saborAcai':
                return (this.selections.saborAcai?.length || 0) >= 1;
            case 'separacao':
                return !!this.selections.separacao;
            case 'salgados':
                const numRequired = customOptions.numSalgados || 1;
                return (this.selections.salgados?.length || 0) === numRequired;
            case 'molhos':
                return (this.selections.molhos?.length || 0) >= 1;
            case 'refrigerante':
                return !!this.selections.refrigerante;
            default:
                return true;
        }
    }

    toggleSelection(category, value, maxSelections = null) {
        if (!this.selections[category]) {
            this.selections[category] = [];
        }

        // Lista de opções "negativas" que são mutuamente exclusivas com outras
        const negativeOptions = {
            'molhos': 'Sem molho',
            'acompanhamentos': 'Não quero complemento',
            'adicionais': 'Não quero adicional',
            'bebidas': 'Não turbinar'
        };

        const negativeOption = negativeOptions[category];
        const isNegativeOption = value === negativeOption;
        const hasNegativeOption = negativeOption && this.selections[category].includes(negativeOption);

        const current = this.selections[category];
        const index = current.indexOf(value);

        if (index > -1) {
            // Desmarcar a opção clicada
            this.selections[category] = current.filter((_, i) => i !== index);
        } else {
            // Marcar a opção clicada
            if (isNegativeOption) {
                // Se clicar em "Não/Sem", limpar todas as outras opções
                this.selections[category] = [value];
            } else {
                // Se clicar em uma opção normal
                if (hasNegativeOption) {
                    // Remove a opção negativa antes de adicionar
                    this.selections[category] = current.filter(item => item !== negativeOption);
                }

                // Verificar limite de seleções
                if (maxSelections && this.selections[category].length >= maxSelections) {
                    return;
                }

                this.selections[category] = [...this.selections[category], value];
            }
        }

        this.calculateTotalPrice();
        this.updateSelectionDisplay();

        // Rolar para a próxima seção se esta estiver completa
        if (maxSelections && this.selections[category].length === maxSelections) {
            setTimeout(() => this.scrollToNextSection(category), 300);
        }
    }

    setSelection(category, value) {
        this.selections[category] = value;
        this.calculateTotalPrice();
        this.updateSelectionDisplay();
        
        // Rolar para a próxima seção automaticamente
        setTimeout(() => this.scrollToNextSection(category), 300);
    }

    updateSelectionDisplay() {
        // Atualizar apenas os elementos visuais sem re-renderizar todo o modal
        const modal = document.getElementById('product-customization-modal');
        if (!modal) return;

        // Atualizar todas as opções de botão
        modal.querySelectorAll('.option-btn, .option-item, .option-checkbox, .option-item-detailed').forEach(element => {
            const category = element.dataset.category;
            const value = element.dataset.value;
            
            if (!category || !value) {
                element.classList.remove('selected');
                return;
            }
            
            const selection = this.selections[category];
            
            if (Array.isArray(selection)) {
                // Para múltiplas seleções
                if (selection.includes(value)) {
                    element.classList.add('selected');
                } else {
                    element.classList.remove('selected');
                }
            } else {
                // Para seleção única
                if (selection === value) {
                    element.classList.add('selected');
                } else {
                    element.classList.remove('selected');
                }
            }
        });

        // Atualizar contadores
        const customOptions = this.getCustomizationOptions();

        // Contador de salgados
        if (customOptions.hasSalgados) {
            const salgadosSection = modal.querySelector('[data-section="salgados"]');
            if (salgadosSection) {
                const counter = salgadosSection.querySelector('.selection-counter');
                if (counter) {
                    const selectedCount = this.selections.salgados?.length || 0;
                    counter.textContent = `${selectedCount}/${customOptions.numSalgados}`;
                }
            }
        }

        // Contador de molhos
        if (customOptions.hasMolhos) {
            const molhosSection = modal.querySelector('[data-section="molhos"]');
            if (molhosSection) {
                const counter = molhosSection.querySelector('.selection-counter');
                if (counter) {
                    const selectedCount = this.selections.molhos?.length || 0;
                    counter.textContent = `${selectedCount}/3`;
                }
            }
        }

        // Atualizar contadores de seção
        if (customOptions.hasAcai) {
            const section = modal.querySelector('[data-section="saborAcai"]');
            if (section) {
                const count = this.selections.saborAcai?.length || 0;
                const title = section.querySelector('h3');
                if (title) {
                    title.innerHTML = `Sabor do açaí ou sorvete (até 2) <span class="required">*</span> - ${count}/2`;
                }
            }
        }

        if (customOptions.hasAcompanhamentos) {
            const section = modal.querySelector('[data-section="acompanhamentos"]');
            if (section) {
                const count = this.selections.acompanhamentos?.length || 0;
                const maxAcomp = customOptions.maxAcompanhamentos || 5;
                const title = section.querySelector('h3');
                if (title) {
                    title.innerHTML = `Acompanhamentos (até ${maxAcomp}) - ${count}/${maxAcomp}`;
                }
            }
        }

        if (customOptions.hasAdicionais) {
            const section = modal.querySelector('[data-section="adicionais"]');
            if (section) {
                const count = this.selections.adicionais?.length || 0;
                const title = section.querySelector('h3');
                if (title) {
                    title.innerHTML = `Adicionais (até 8) - ${count}/8`;
                }
            }
        }

        if (customOptions.hasBebidas) {
            const section = modal.querySelector('[data-section="bebidas"]');
            if (section) {
                const count = this.selections.bebidas?.length || 0;
                const title = section.querySelector('h3');
                if (title) {
                    title.innerHTML = `Turbine seu lanche (até 3) - ${count}/3`;
                }
            }
        }

        // Atualizar estado do botão de adicionar
        const addBtn = modal.querySelector('.btn-add-cart');
        if (addBtn) {
            if (this.isFormValid()) {
                addBtn.classList.remove('disabled');
                addBtn.disabled = false;
            } else {
                addBtn.classList.add('disabled');
                addBtn.disabled = true;
            }
        }
    }

    render() {
        let existingModal = document.getElementById('product-customization-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const customOptions = this.getCustomizationOptions();
        
        const modalHTML = `
            <div class="modal-overlay" id="product-customization-modal">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2>${this.currentItem.name}</h2>
                        <button class="modal-close" onclick="productCustomizationModal.close()">×</button>
                    </div>

                    <div class="modal-body">
                        ${this.renderTalherSection()}
                        ${customOptions.hasAcai ? this.renderSaborAcaiSection() : ''}
                        ${customOptions.hasSeparacao ? this.renderSeparacaoSection() : ''}
                        ${customOptions.hasAcompanhamentos ? this.renderAcompanhamentosSection() : ''}
                        ${customOptions.hasComplementosSeparados ? this.renderComplementosSeparadosSection() : ''}
                        ${customOptions.hasAdicionais ? this.renderAdicionaisSection() : ''}
                        ${customOptions.hasSalgados ? this.renderSalgadosSection(customOptions.numSalgados) : ''}
                        ${customOptions.hasMolhos ? this.renderMolhosSection() : ''}
                        ${customOptions.hasRefrigerante ? this.renderRefrigeranteSection() : ''}
                        ${customOptions.hasBebidas ? this.renderBebidasSection() : ''}
                    </div>

                    <div class="modal-footer">
                        <div class="modal-price-summary">
                            <span>Total:</span>
                            <span class="modal-total-price" id="modal-total-price">R$ ${this.totalPrice.toFixed(2)}</span>
                        </div>
                        <div class="modal-actions">
                            <button class="btn-cancel" onclick="productCustomizationModal.close()">Cancelar</button>
                            <button class="btn-add-cart ${!this.isFormValid() ? 'disabled' : ''}" 
                                    onclick="productCustomizationModal.handleAddToCart()">
                                Adicionar ao carrinho
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const overlay = document.getElementById('product-customization-modal');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });
    }

    renderTalherSection() {
        return `
            <div class="customization-section" data-section="talher">
                <h3>Precisa de talher?</h3>
                <div class="option-buttons">
                    <button class="option-btn ${this.selections.talher === 'sim' ? 'selected' : ''}" 
                            data-category="talher" data-value="sim"
                            onclick="productCustomizationModal.setSelection('talher', 'sim')">
                        Sim, preciso de talher
                    </button>
                    <button class="option-btn ${this.selections.talher === 'nao' ? 'selected' : ''}" 
                            data-category="talher" data-value="nao"
                            onclick="productCustomizationModal.setSelection('talher', 'nao')">
                        Não preciso de talher
                    </button>
                </div>
            </div>
        `;
    }

    renderSaborAcaiSection() {
        const selectedCount = this.selections.saborAcai?.length || 0;
        return `
            <div class="customization-section" data-section="saborAcai">
                <h3>Sabor do açaí ou sorvete (até 2) <span class="required">*</span> - ${selectedCount}/2</h3>
                <p class="error-message" id="error-saborAcai" style="display: none;"></p>
                <div class="option-list">
                    ${saboresAcai.map(sabor => {
                        const isSelected = this.selections.saborAcai?.includes(sabor);
                        const isDisabled = !isSelected && selectedCount >= 2;
                        return `
                            <button class="option-item ${isSelected ? 'selected' : ''}" 
                                    data-category="saborAcai" data-value="${sabor}"
                                    ${isDisabled ? 'disabled' : ''}
                                    onclick="productCustomizationModal.toggleSelection('saborAcai', '${sabor}', 2)">
                                ${sabor}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderSeparacaoSection() {
        return `
            <div class="customization-section" data-section="separacao">
                <h3>Separados ou no copo? <span class="required">*</span></h3>
                <p class="error-message" id="error-separacao" style="display: none;"></p>
                <div class="option-buttons">
                    <button class="option-btn ${this.selections.separacao === 'separado' ? 'selected' : ''}" 
                            data-category="separacao" data-value="separado"
                            onclick="productCustomizationModal.setSelection('separacao', 'separado')">
                        Separado (+R$ 4,00)
                        <small>Complementos separados em saquinhos</small>
                    </button>
                    <button class="option-btn ${this.selections.separacao === 'copo' ? 'selected' : ''}" 
                            data-category="separacao" data-value="copo"
                            onclick="productCustomizationModal.setSelection('separacao', 'copo')">
                        Dentro do copo
                        <small>Todos os complementos dentro do copo</small>
                    </button>
                </div>
            </div>
        `;
    }

    renderAcompanhamentosSection() {
        const selectedCount = this.selections.acompanhamentos?.length || 0;
        const customOptions = this.getCustomizationOptions();
        const maxAcomp = customOptions.maxAcompanhamentos || 5;

        return `
            <div class="customization-section" data-section="acompanhamentos">
                <h3>Acompanhamentos (até ${maxAcomp}) - ${selectedCount}/${maxAcomp}</h3>
                <div class="option-list">
                    ${acompanhamentos.map(acomp => {
                        const isSelected = this.selections.acompanhamentos?.includes(acomp.nome);
                        const isDisabled = !isSelected && selectedCount >= maxAcomp;
                        return `
                            <button class="option-item ${isSelected ? 'selected' : ''}"
                                    data-category="acompanhamentos" data-value="${acomp.nome}"
                                    ${isDisabled ? 'disabled' : ''}
                                    onclick="productCustomizationModal.toggleSelection('acompanhamentos', '${acomp.nome}', ${maxAcomp})">
                                ${acomp.nome}
                                ${acomp.preco > 0 ? `<span class="extra-price">+R$ ${acomp.preco.toFixed(2)}</span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderComplementosSeparadosSection() {
        const isSelected = this.selections.complementosSeparados === 'sim';
        return `
            <div class="customization-section" data-section="complementos-separados">
                <h3>Deseja os complementos separados do pote?</h3>
                <p class="section-description">Você pode escolher receber os complementos separados do pote ou misturados junto.</p>
                <div class="option-grid">
                    <button class="option-radio ${isSelected ? 'selected' : ''}"
                            data-category="complementosSeparados" data-value="sim"
                            onclick="productCustomizationModal.setSelection('complementosSeparados', 'sim')">
                        <i class="fas fa-check-circle"></i> Sim, separados
                    </button>
                    <button class="option-radio ${!isSelected ? 'selected' : ''}"
                            data-category="complementosSeparados" data-value="nao"
                            onclick="productCustomizationModal.setSelection('complementosSeparados', 'nao')">
                        <i class="fas fa-times-circle"></i> Não, misturados
                    </button>
                </div>
            </div>
        `;
    }

    renderAdicionaisSection() {
        const selectedCount = this.selections.adicionais?.length || 0;
        return `
            <div class="customization-section" data-section="adicionais">
                <h3>Adicionais (até 8) - ${selectedCount}/8</h3>
                <div class="option-list">
                    ${adicionais.map(adicional => {
                        const isSelected = this.selections.adicionais?.includes(adicional.nome);
                        const isDisabled = !isSelected && selectedCount >= 8;
                        return `
                            <button class="option-item ${isSelected ? 'selected' : ''}"
                                    data-category="adicionais" data-value="${adicional.nome}"
                                    ${isDisabled ? 'disabled' : ''}
                                    onclick="productCustomizationModal.toggleSelection('adicionais', '${adicional.nome}', 8)">
                                ${adicional.nome}
                                ${adicional.preco > 0 ? `<span class="extra-price">+R$ ${adicional.preco.toFixed(2)}</span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderSalgadosSection(numSalgados) {
        const selectedCount = this.selections.salgados?.length || 0;
        return `
            <div class="customization-section" data-section="salgados">
                <h3>Escolha o seu salgado (${numSalgados}) <span class="required">*</span></h3>
                <p class="selection-counter">${selectedCount}/${numSalgados}</p>
                <p class="error-message" id="error-salgados" style="display: none;"></p>
                <div class="option-list">
                    ${salgados.map(salgado => {
                        const isSelected = this.selections.salgados?.includes(salgado.nome);
                        const isDisabled = !isSelected && selectedCount >= numSalgados;
                        return `
                            <button class="option-item ${isSelected ? 'selected' : ''}" 
                                    data-category="salgados" data-value="${salgado.nome}"
                                    ${isDisabled ? 'disabled' : ''}
                                    onclick="productCustomizationModal.toggleSelection('salgados', '${salgado.nome}', ${numSalgados})">
                                ${salgado.nome}
                                ${salgado.preco > 0 ? `<span class="extra-price">+R$ ${salgado.preco.toFixed(2)}</span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderMolhosSection() {
        const selectedCount = this.selections.molhos?.length || 0;
        return `
            <div class="customization-section" data-section="molhos">
                <h3>Molhos (até 3) <span class="required">*</span></h3>
                <p class="selection-counter">${selectedCount}/3</p>
                <p class="error-message" id="error-molhos" style="display: none;"></p>
                <div class="option-buttons">
                    ${molhos.map(molho => {
                        const isSelected = this.selections.molhos?.includes(molho);
                        const isDisabled = !isSelected && selectedCount >= 3;
                        return `
                            <button class="option-checkbox ${isSelected ? 'selected' : ''}"
                                    data-category="molhos" data-value="${molho}"
                                    ${isDisabled ? 'disabled' : ''}
                                    onclick="productCustomizationModal.toggleSelection('molhos', '${molho}', 3)">
                                ${molho}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderRefrigeranteSection() {
        return `
            <div class="customization-section" data-section="refrigerante">
                <h3>Refrigerantes <span class="required">*</span></h3>
                <p class="error-message" id="error-refrigerante" style="display: none;"></p>
                <div class="option-list">
                    ${refrigerantes.map(refri => `
                        <button class="option-item ${this.selections.refrigerante === refri ? 'selected' : ''}" 
                                data-category="refrigerante" data-value="${refri}"
                                onclick="productCustomizationModal.setSelection('refrigerante', '${refri}')">
                            ${refri}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderBebidasSection() {
        const selectedCount = this.selections.bebidas?.length || 0;
        return `
            <div class="customization-section" data-section="bebidas">
                <h3>Turbine seu lanche (até 3) - ${selectedCount}/3</h3>
                <div class="option-list">
                    ${bebidas.map(bebida => {
                        const isSelected = this.selections.bebidas?.includes(bebida.nome);
                        const isDisabled = !isSelected && selectedCount >= 3;
                        return `
                            <button class="option-item ${isSelected ? 'selected' : ''}"
                                    data-category="bebidas" data-value="${bebida.nome}"
                                    ${isDisabled ? 'disabled' : ''}
                                    onclick="productCustomizationModal.toggleSelection('bebidas', '${bebida.nome}', 3)">
                                ${bebida.nome}
                                ${bebida.preco > 0 ? `<span class="extra-price">+R$ ${bebida.preco.toFixed(2)}</span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}

// Dados de opções (igual ao exemplo React)
const saboresAcai = [
    'Açaí Natural', 'Açaí de Banana', 'Açaí de morango',
    'Açaí Natural Industrializado (tipo sorvete)',
    'Açaí de banana Industrializado (tipo sorvete)',
    'Açaí de morango Industrializado (tipo sorvete)',
    'Açaí de Cupuaçu', 'Açaí de Ninho', 'Açaí de Óreo',
    'Açaí chocotella', 'Açaí Kinder', 'Açaí de brownie',
    'Açaí de Ovomaltine', 'Açaí Ferrero Rocher', 'Açaí de Prestígio',
    'Açaí de Rafaello', 'Sorvete de Chocolate', 'Sorvete de morango',
    'Sorvete de Pistache', 'Sorvete de Coco', 'Sorvete de Yogurt',
    'Sorvete de Passas ao Rum', 'Sorvete chocomenta', 'Sorvete de abacaxi',
    'Sorvete de Ninho com Nutella', 'Sorvete de chiclete', 'Sorvete de Flocos',
    'Sorvete de Sensação', 'Sorvete de maracujá', 'Sorvete Blue Ice',
    'Sorvete de Pavê', 'Sorvete de creme', 'Sorvete Rafaello'
];

const acompanhamentos = [
    { nome: 'Não quero complemento', preco: 0 },
    { nome: 'Amendoim picado', preco: 0 }, { nome: 'Paçoca de amendoim', preco: 0 },
    { nome: 'Sucrilhos', preco: 0 }, { nome: 'Flocos de arroz', preco: 0 },
    { nome: 'Aveia em flocos', preco: 0 }, { nome: 'Chocoball', preco: 0 },
    { nome: 'Granola', preco: 0 }, { nome: 'Coco ralado', preco: 0 },
    { nome: 'Granulado preto', preco: 0 }, { nome: 'Granulado colorido', preco: 0 },
    { nome: 'Leite em pó', preco: 0 }, { nome: 'Disquete', preco: 3.00 },
    { nome: 'Jujuba', preco: 0 }, { nome: 'Creme de ninho', preco: 7.00 },
    { nome: 'Calda de doce de leite', preco: 0 }, { nome: 'Calda de maracujá', preco: 0 },
    { nome: 'Calda de uva', preco: 0 }, { nome: 'Calda de menta', preco: 0 },
    { nome: 'Calda de tutti-frutti', preco: 0 }, { nome: 'Calda de leite condensado', preco: 0 },
    { nome: 'Calda de chocolate', preco: 0 }, { nome: 'Calda de morango', preco: 0 },
    { nome: 'Calda de mel', preco: 0 }, { nome: 'Amendoim colorido', preco: 0 },
    { nome: 'Calda de banana', preco: 0 }, { nome: 'Calda de caramelo', preco: 0 },
    { nome: 'Calda de Cassis', preco: 0 }, { nome: 'Calda de abacaxi', preco: 0 },
    { nome: 'Calda de limão', preco: 0 }, { nome: 'Calda de açaí', preco: 0 },
    { nome: 'Calda de groselha', preco: 0 }
];

const adicionais = [
    { nome: 'Não quero adicional', preco: 0 },
    { nome: 'Kit Kat', preco: 5.00 }, { nome: 'Biscoito óreo', preco: 4.00 },
    { nome: 'Bala fini', preco: 3.00 }, { nome: 'Bis', preco: 4.00 },
    { nome: 'Creme de avelã', preco: 7.00 }, { nome: 'Leite condensado', preco: 4.00 },
    { nome: 'Banana', preco: 3.00 }, { nome: 'Doce de leite', preco: 7.00 },
    { nome: 'Gotas de chocolate', preco: 5.00 }, { nome: 'Chantilly', preco: 5.00 },
    { nome: 'Ovomaltine', preco: 5.00 }, { nome: 'Creme de chocolate branco', preco: 7.00 },
    { nome: 'Bombom Sonho de Valsa', preco: 3.00 }, { nome: 'Chocolate Trento', preco: 4.00 },
    { nome: 'Marshmallows', preco: 3.00 }, { nome: 'Creme de chocolate ao leite', preco: 7.00 },
    { nome: 'Bombom Ouro Branco', preco: 3.00 }, { nome: 'Creme de Pistache', preco: 7.00 }
];

const salgados = [
    { nome: 'Italiano de Queijo e Presunto', preco: 0 },
    { nome: 'Hamburguer de calabresa com cheddar', preco: 0 },
    { nome: 'Coxinha de Frango', preco: 1.99 },
    { nome: 'Coxinha com Catupiry', preco: 1.99 },
    { nome: 'Esfiha de carne', preco: 0 },
    { nome: 'Italiano com cebola', preco: 0 },
    { nome: 'Bolinho de aipim com carne moída', preco: 1.99 },
    { nome: 'Hamburguer com bacon e queijo', preco: 0 },
    { nome: 'Italiano de frango com Catupiry', preco: 0 },
    { nome: 'Kibe', preco: 1.99 },
    { nome: 'Italiano de calabresa com cheddar', preco: 0 },
    { nome: 'Enroladinho de salsicha', preco: 0.99 },
    { nome: 'Enroladinho de queijo e presunto', preco: 0.99 },
    { nome: 'Hamburguer com queijo e presunto', preco: 0 },
    { nome: 'Hamburguer com cheddar', preco: 0 },
    { nome: 'Italiano 4 queijos', preco: 0 },
    { nome: 'Pastel de forno de frango', preco: 0 },
    { nome: 'Croissant de chocolate', preco: 0 },
    { nome: 'Risole de Carne', preco: 1.99 }
];

const molhos = ['Sem molho', 'Ketchup', 'Maionese', 'Maionese Temperada'];

const refrigerantes = [
    'Coca-Cola Original 350ml',
    'Refrigerante Guaraná Antarctica 350ml',
    'Fanta Uva 350ml'
];

const bebidas = [
    { nome: 'Não turbinar', descricao: 'Sem itens extras', preco: 0 },
    { nome: 'Batata Frita', descricao: 'A batata crocante e quentinha pra você montar o seu combo.', preco: 7.99 },
    { nome: 'Coca-Cola Original 350ml', descricao: 'Lata 350ml', preco: 6.99 },
    { nome: 'Fanta Uva 350ml', descricao: 'Lata 350ml', preco: 6.99 },
    { nome: 'Guaravita', descricao: '290ml', preco: 2.99 },
    { nome: 'Refrigerante Guarana Antarctica 355ml', descricao: 'Embalagem 350ml', preco: 6.99 }
];

// Instância global do modal
const productCustomizationModal = new ProductCustomizationModal();
