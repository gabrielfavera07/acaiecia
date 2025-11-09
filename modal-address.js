// Modal de Gerenciamento de Endereços
class AddressManager {
    constructor() {
        this.addresses = [];
        this.selectedAddress = null;
        this.onAddressSelected = null;
        this.loadAddresses();
    }

    loadAddresses() {
        const saved = localStorage.getItem('delivery_addresses');
        if (saved) {
            this.addresses = JSON.parse(saved);
        }
    }

    saveAddresses() {
        localStorage.setItem('delivery_addresses', JSON.stringify(this.addresses));
    }

    open(onAddressSelectedCallback) {
        this.onAddressSelected = onAddressSelectedCallback;
        this.render();
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('address-manager-modal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 200);
        } else {
            document.body.style.overflow = '';
        }
    }

    showAddressForm(editingAddress = null) {
        addressForm.open(editingAddress, (address) => {
            if (editingAddress) {
                // Atualizar endereço existente
                this.addresses = this.addresses.map(addr => 
                    addr.id === address.id ? address : addr
                );
            } else {
                // Adicionar novo endereço
                address.id = Date.now().toString();
                this.addresses.push(address);
            }
            this.saveAddresses();
            this.showSuccessToast(editingAddress ? 'Endereço atualizado!' : 'Endereço salvo!');
            this.render();
        });
    }

    selectAddress(address) {
        this.selectedAddress = address;
        addressConfirmation.open(address, () => {
            // Após confirmar endereço, mostrar mapa
            mapModal.open(address, (coordinates) => {
                // Atualizar endereço com coordenadas
                const updatedAddress = {
                    ...address,
                    latitude: coordinates.lat,
                    longitude: coordinates.lng
                };
                
                this.addresses = this.addresses.map(addr => 
                    addr.id === updatedAddress.id ? updatedAddress : addr
                );
                this.saveAddresses();
                
                // Mostrar modal de pagamento
                paymentModal.open((paymentData) => {
                    if (this.onAddressSelected) {
                        this.onAddressSelected(updatedAddress, paymentData);
                    }
                    this.close();
                });
            });
        }, () => {
            // Se clicar em editar na confirmação
            this.showAddressForm(address);
        });
    }

    deleteAddress(id) {
        const modal = this.createConfirmDialog(
            'Excluir endereço',
            'Deseja realmente excluir este endereço?',
            () => {
                this.addresses = this.addresses.filter(addr => addr.id !== id);
                this.saveAddresses();
                this.showSuccessToast('Endereço excluído!');
                this.render();
            }
        );
        document.body.appendChild(modal);
    }

    createConfirmDialog(title, message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="confirm-dialog-body">
                    <p>${message}</p>
                </div>
                <div class="confirm-dialog-footer">
                    <button class="btn-cancel-dialog">Cancelar</button>
                    <button class="btn-confirm-dialog">Confirmar</button>
                </div>
            </div>
        `;

        dialog.querySelector('.btn-cancel-dialog').onclick = () => {
            dialog.classList.add('closing');
            setTimeout(() => dialog.remove(), 200);
        };

        dialog.querySelector('.btn-confirm-dialog').onclick = () => {
            onConfirm();
            dialog.classList.add('closing');
            setTimeout(() => dialog.remove(), 200);
        };

        return dialog;
    }

    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <div class="toast-message">${message}</div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    render() {
        let existingModal = document.getElementById('address-manager-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="address-overlay" id="address-manager-modal">
                <div class="address-manager" onclick="event.stopPropagation()">
                    <div class="address-header">
                        <div class="header-icon-title">
                            <div class="header-icon">📍</div>
                            <h2>Endereço de Entrega</h2>
                        </div>
                        <button class="close-btn" onclick="addressManager.close()">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="address-content">
                        ${this.addresses.length === 0 ? this.renderNoAddresses() : this.renderAddressList()}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const overlay = document.getElementById('address-manager-modal');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });

        // Animar entrada dos cards
        setTimeout(() => {
            document.querySelectorAll('.address-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 50);
            });
        }, 10);
    }

    renderNoAddresses() {
        return `
            <div class="no-addresses">
                <div class="no-addresses-animation">
                    <div class="no-addresses-icon">📍</div>
                    <div class="pulse-ring"></div>
                </div>
                <h3>Nenhum endereço cadastrado</h3>
                <p>Cadastre seu primeiro endereço para receber suas entregas</p>
                <button class="btn-add-address" onclick="addressManager.showAddressForm()">
                    <span class="btn-icon">+</span>
                    <span>Cadastrar Novo Endereço</span>
                </button>
            </div>
        `;
    }

    renderAddressList() {
        return `
            <div class="address-list">
                ${this.addresses.map((address, index) => `
                    <div class="address-card" style="animation-delay: ${index * 0.05}s">
                        <div class="address-card-badge">
                            <span class="badge-icon">📍</span>
                        </div>
                        <div class="address-card-content">
                            <h4>${address.apelido || 'Sem nome'}</h4>
                            <p class="address-full">
                                ${address.logradouro}${address.numero ? `, ${address.numero}` : ''}
                                ${address.complemento ? ` - ${address.complemento}` : ''}
                            </p>
                            <p class="address-details">
                                ${address.bairro} - ${address.localidade}/${address.uf}
                            </p>
                            <p class="address-cep">
                                <span class="cep-icon">📮</span> CEP: ${address.cep}
                            </p>
                            ${address.referencia ? `
                                <p class="address-reference">
                                    <span class="ref-icon">📌</span> ${address.referencia}
                                </p>
                            ` : ''}
                        </div>
                        <div class="address-card-actions">
                            <button class="btn-select-address" 
                                    onclick='addressManager.selectAddress(${JSON.stringify(address).replace(/'/g, "\\'")})' 
                                    title="Selecionar este endereço">
                                <span class="btn-icon">✓</span>
                                <span>Selecionar</span>
                            </button>
                            <div class="action-buttons-group">
                                <button class="btn-edit-address" 
                                        onclick='addressManager.showAddressForm(${JSON.stringify(address).replace(/'/g, "\\'")})'
                                        title="Editar endereço">
                                    <span>✏️</span>
                                </button>
                                <button class="btn-delete-address" 
                                        onclick="addressManager.deleteAddress('${address.id}')"
                                        title="Excluir endereço">
                                    <span>🗑️</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn-add-new-address" onclick="addressManager.showAddressForm()">
                <span class="btn-icon">+</span>
                <span>Cadastrar Novo Endereço</span>
            </button>
        `;
    }
}

// Formulário de Endereço
class AddressForm {
    constructor() {
        this.editingAddress = null;
        this.onSave = null;
        this.isLoadingCEP = false;
    }

    open(editingAddress, onSaveCallback) {
        this.editingAddress = editingAddress;
        this.onSave = onSaveCallback;
        this.render();
    }

    close() {
        const modal = document.getElementById('address-form-modal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    }

    async searchCEP(cep) {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length !== 8) return;

        const cepInput = document.getElementById('cep');
        const loader = document.querySelector('.cep-loader');

        this.isLoadingCEP = true;
        cepInput.disabled = true;
        if (loader) loader.style.display = 'block';

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('logradouro').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('localidade').value = data.localidade || '';
                document.getElementById('uf').value = data.uf || '';
                
                // Animar os campos preenchidos
                ['logradouro', 'bairro', 'localidade', 'uf'].forEach((field, index) => {
                    const input = document.getElementById(field);
                    if (input.value) {
                        setTimeout(() => {
                            input.classList.add('field-filled');
                        }, index * 50);
                    }
                });

                document.getElementById('numero').focus();
                this.showFieldSuccess(cepInput);
            } else {
                this.showFieldError(cepInput, 'CEP não encontrado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            this.showFieldError(cepInput, 'Erro ao buscar CEP');
        } finally {
            this.isLoadingCEP = false;
            cepInput.disabled = false;
            if (loader) loader.style.display = 'none';
        }
    }

    showFieldSuccess(input) {
        input.classList.add('field-success');
        setTimeout(() => input.classList.remove('field-success'), 2000);
    }

    showFieldError(input, message) {
        input.classList.add('field-error');
        setTimeout(() => input.classList.remove('field-error'), 2000);
        alert(message);
    }

    handleSubmit(event) {
        event.preventDefault();
        
        const submitBtn = document.querySelector('.btn-save');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }

        setTimeout(() => {
            const formData = new FormData(event.target);
            const address = {
                id: this.editingAddress?.id,
                apelido: formData.get('apelido'),
                cep: formData.get('cep'),
                logradouro: formData.get('logradouro'),
                numero: formData.get('numero'),
                complemento: formData.get('complemento'),
                bairro: formData.get('bairro'),
                localidade: formData.get('localidade'),
                uf: formData.get('uf'),
                referencia: formData.get('referencia')
            };

            if (this.onSave) {
                this.onSave(address);
            }
            
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
            this.close();
        }, 500);
    }

    render() {
        let existingModal = document.getElementById('address-form-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const addr = this.editingAddress || {};

        const modalHTML = `
            <div class="address-overlay" id="address-form-modal">
                <div class="address-form-container" onclick="event.stopPropagation()">
                    <div class="address-header">
                        <div class="header-icon-title">
                            <div class="header-icon">${this.editingAddress ? '✏️' : '+'}</div>
                            <h2>${this.editingAddress ? 'Editar Endereço' : 'Novo Endereço'}</h2>
                        </div>
                        <button class="close-btn" onclick="addressForm.close()">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="address-content">
                        <form class="address-form" onsubmit="addressForm.handleSubmit(event)">
                        <div class="form-group">
                            <label for="apelido">
                                <span class="label-icon">🏷️</span>
                                Apelido do endereço
                            </label>
                            <input type="text" id="apelido" name="apelido" value="${addr.apelido || ''}" 
                                   placeholder="Ex: Casa, Trabalho..." required>
                        </div>

                        <div class="form-group">
                            <label for="cep">
                                <span class="label-icon">📮</span>
                                CEP
                            </label>
                            <div class="input-with-loader">
                                <input type="text" id="cep" name="cep" value="${addr.cep || ''}" 
                                       placeholder="00000-000" maxlength="9" required
                                       onblur="addressForm.searchCEP(this.value)">
                                <div class="cep-loader" style="display: none;">
                                    <div class="spinner"></div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="logradouro">
                                <span class="label-icon">🛣️</span>
                                Logradouro
                            </label>
                            <input type="text" id="logradouro" name="logradouro" value="${addr.logradouro || ''}" 
                                   placeholder="Rua, Avenida..." required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="numero">
                                    <span class="label-icon">🔢</span>
                                    Número
                                </label>
                                <input type="text" id="numero" name="numero" value="${addr.numero || ''}" 
                                       placeholder="123" required>
                                <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                                    <input type="checkbox" 
                                           id="sem-numero" 
                                           style="width: auto; cursor: pointer;"
                                           ${addr.numero === 'S/N' ? 'checked' : ''}>
                                    <label for="sem-numero" style="cursor: pointer; font-size: 0.875rem; color: var(--text-secondary); margin: 0;">
                                        📍 Endereço sem número
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="complemento">
                                    <span class="label-icon">🏢</span>
                                    Complemento
                                </label>
                                <input type="text" id="complemento" name="complemento" value="${addr.complemento || ''}" 
                                       placeholder="Apto, Bloco...">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="bairro">
                                <span class="label-icon">🏘️</span>
                                Bairro
                            </label>
                            <input type="text" id="bairro" name="bairro" value="${addr.bairro || ''}" 
                                   placeholder="Bairro" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="localidade">
                                    <span class="label-icon">🏙️</span>
                                    Cidade
                                </label>
                                <input type="text" id="localidade" name="localidade" value="${addr.localidade || ''}" 
                                       placeholder="Cidade" required>
                            </div>
                            <div class="form-group">
                                <label for="uf">
                                    <span class="label-icon">🗺️</span>
                                    UF
                                </label>
                                <input type="text" id="uf" name="uf" value="${addr.uf || ''}" 
                                       placeholder="UF" maxlength="2" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="referencia">
                                <span class="label-icon">📌</span>
                                Ponto de Referência
                            </label>
                            <textarea id="referencia" name="referencia" rows="2" 
                                      placeholder="Ex: Próximo ao mercado...">${addr.referencia || ''}</textarea>
                        </div>

                        </form>
                    </div>

                    <div class="confirmation-footer">
                        <button type="button" class="btn-cancel" onclick="addressForm.close()">
                            <span>Cancelar</span>
                        </button>
                        <button type="submit" class="btn-save" onclick="document.querySelector('.address-form').requestSubmit()">
                            <span class="btn-text">${this.editingAddress ? 'Atualizar' : 'Salvar'}</span>
                            <span class="btn-loader"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar checkbox de sem número
        const semNumeroCheckbox = document.getElementById('sem-numero');
        const numeroInput = document.getElementById('numero');

        if (semNumeroCheckbox && numeroInput) {
            // Estado inicial
            if (addr.numero === 'S/N') {
                numeroInput.disabled = true;
                numeroInput.required = false;
                numeroInput.style.backgroundColor = 'var(--bg-tertiary)';
            }
            
            // Evento de mudança
            semNumeroCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    numeroInput.value = 'S/N';
                    numeroInput.disabled = true;
                    numeroInput.required = false;
                    numeroInput.style.backgroundColor = 'var(--bg-tertiary)';
                } else {
                    numeroInput.value = '';
                    numeroInput.disabled = false;
                    numeroInput.required = true;
                    numeroInput.style.backgroundColor = '';
                    numeroInput.focus();
                }
            });
        }
    }
}

// Modal de Confirmação de Endereço
class AddressConfirmation {
    constructor() {
        this.address = null;
        this.onConfirm = null;
        this.onEdit = null;
    }

    open(address, onConfirmCallback, onEditCallback) {
        this.address = address;
        this.onConfirm = onConfirmCallback;
        this.onEdit = onEditCallback;
        this.render();
    }

    close() {
        const modal = document.getElementById('address-confirmation-modal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    }

    handleConfirm() {
        const confirmBtn = document.querySelector('.btn-confirm');
        confirmBtn.classList.add('loading');
        confirmBtn.disabled = true;

        setTimeout(() => {
            if (this.onConfirm) {
                this.onConfirm();
            }
            this.close();
        }, 500);
    }

    handleEdit() {
        if (this.onEdit) {
            this.onEdit();
        }
        this.close();
    }

    render() {
        let existingModal = document.getElementById('address-confirmation-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="address-overlay" id="address-confirmation-modal">
                <div class="address-confirmation" onclick="event.stopPropagation()">
                    <div class="confirmation-header">
                        <div class="header-icon-title">
                            <div class="header-icon success-icon">✓</div>
                            <h2>Confirmar Endereço</h2>
                        </div>
                        <button class="close-btn" onclick="addressConfirmation.close()">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="confirmation-content">
                        <p class="confirmation-instruction">
                            <span class="instruction-icon">👀</span>
                            Confira se os dados estão corretos:
                        </p>
                        
                        <div class="address-preview">
                            <div class="preview-badge">
                                <span>📍</span>
                            </div>
                            <h3>${this.address.apelido}</h3>
                            <div class="preview-details">
                                <p class="preview-item">
                                    <span class="item-icon">🛣️</span>
                                    ${this.address.logradouro}${this.address.numero ? `, ${this.address.numero}` : ''}
                                </p>
                                ${this.address.complemento ? `
                                    <p class="preview-item">
                                        <span class="item-icon">🏢</span>
                                        ${this.address.complemento}
                                    </p>
                                ` : ''}
                                <p class="preview-item">
                                    <span class="item-icon">🏘️</span>
                                    ${this.address.bairro}
                                </p>
                                <p class="preview-item">
                                    <span class="item-icon">🏙️</span>
                                    ${this.address.localidade}/${this.address.uf}
                                </p>
                                <p class="preview-item">
                                    <span class="item-icon">📮</span>
                                    CEP: ${this.address.cep}
                                </p>
                                ${this.address.referencia ? `
                                    <p class="preview-item reference">
                                        <span class="item-icon">📌</span>
                                        ${this.address.referencia}
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="confirmation-footer">
                        <button class="btn-edit" onclick="addressConfirmation.handleEdit()">
                            <span class="btn-icon">✏️</span>
                            <span>Editar</span>
                        </button>
                        <button class="btn-confirm" onclick="addressConfirmation.handleConfirm()">
                            <span class="btn-text">Confirmar</span>
                            <span class="btn-loader"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Instâncias globais
const addressManager = new AddressManager();
const addressForm = new AddressForm();
const addressConfirmation = new AddressConfirmation();
