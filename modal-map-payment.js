// Modal de Mapa
class MapModal {
    constructor() {
        this.address = null;
        this.onConfirm = null;
        this.marker = null;
        this.map = null;
        this.coordinates = null;
        this.isLoadingLocation = false;
    }

    open(address, onConfirmCallback) {
        this.address = address;
        this.onConfirm = onConfirmCallback;
        
        // Renderizar modal primeiro
        this.render();
        
        // Verificar se há última localização salva
        const savedLocation = this.loadLastLocation();
        
        if (savedLocation) {
            // Usar última localização salva como padrão
            this.coordinates = savedLocation;
            this.updateLoadingState(false);
            this.initializeMap();
        } else {
            // Se não houver localização salva, tentar obter localização atual
            this.tryGetUserLocation();
        }
    }
    
    loadLastLocation() {
        try {
            const saved = localStorage.getItem('last_map_location');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Erro ao carregar última localização:', error);
        }
        return null;
    }
    
    saveLastLocation(coordinates) {
        try {
            localStorage.setItem('last_map_location', JSON.stringify(coordinates));
        } catch (error) {
            console.error('Erro ao salvar localização:', error);
        }
    }
    
    useCurrentLocation() {
        // Botão para usar localização atual do usuário
        this.updateLoadingState(true);
        this.tryGetUserLocation();
    }
    
    async tryGetUserLocation() {
        if ("geolocation" in navigator) {
            this.updateLoadingState(true);
            
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });
                
                // Usar localização GPS do usuário
                this.coordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                this.updateLoadingState(false);
                this.initializeMap();
            } catch (error) {
                console.log('Geolocalização não disponível ou negada:', error);
                // Se falhar, tentar usar coordenadas salvas ou localização padrão
                this.useFallbackLocation();
            }
        } else {
            console.log('Geolocalização não suportada pelo navegador');
            this.useFallbackLocation();
        }
    }
    
    useFallbackLocation() {
        // Usar coordenadas salvas do endereço
        if (this.address.latitude && this.address.longitude) {
            this.coordinates = { 
                lat: this.address.latitude, 
                lng: this.address.longitude 
            };
            this.updateLoadingState(false);
            this.initializeMap();
        } else {
            // Usar localização padrão fornecida pelo usuário
            this.coordinates = { 
                lat: -22.927084, 
                lng: -43.005173 
            };
            this.updateLoadingState(false);
            this.initializeMap();
        }
    }

    close() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        const modal = document.getElementById('map-modal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
    }

    async geocodeAddress() {
        this.isLoadingLocation = true;
        this.updateLoadingState(true);

        try {
            let coordinates = null;

            // Tentativa 1: Endereço completo com número + Itaipu + Região Oceânica
            const fullAddressItaipu = `${this.address.logradouro}, ${this.address.numero}, ${this.address.bairro}, Itaipu, Região Oceânica, Niterói, RJ, Brasil`;
            coordinates = await this.tryGeocode(fullAddressItaipu);

            // Tentativa 2: Endereço completo com número (sem Itaipu)
            if (!coordinates) {
                const fullAddress = `${this.address.logradouro}, ${this.address.numero}, ${this.address.bairro}, Niterói, RJ, Brasil`;
                coordinates = await this.tryGeocode(fullAddress);
            }

            // Tentativa 3: Sem número + Itaipu
            if (!coordinates) {
                const addressWithoutNumberItaipu = `${this.address.logradouro}, ${this.address.bairro}, Itaipu, Niterói, RJ, Brasil`;
                coordinates = await this.tryGeocode(addressWithoutNumberItaipu);
            }

            // Tentativa 4: Sem número (normal)
            if (!coordinates) {
                const addressWithoutNumber = `${this.address.logradouro}, ${this.address.bairro}, Niterói, RJ, Brasil`;
                coordinates = await this.tryGeocode(addressWithoutNumber);
            }

            // Tentativa 5: CEP + Região Oceânica
            if (!coordinates && this.address.cep) {
                const cepItaipu = `${this.address.cep}, Itaipu, Região Oceânica, Niterói, RJ, Brasil`;
                coordinates = await this.tryGeocode(cepItaipu);
            }

            // Tentativa 6: Só CEP
            if (!coordinates && this.address.cep) {
                const addressWithCep = `${this.address.cep}, Niterói, RJ, Brasil`;
                coordinates = await this.tryGeocode(addressWithCep);
            }

            // Tentativa 7: Bairro + Itaipu + Região Oceânica
            if (!coordinates) {
                const neighborhoodItaipu = `${this.address.bairro}, Itaipu, Região Oceânica, Niterói, RJ, Brasil`;
                coordinates = await this.tryGeocode(neighborhoodItaipu);
            }

            // Verificar se está na região de Niterói
            if (coordinates) {
                const isInNiteroi = await this.verifyLocation(coordinates);
                if (!isInNiteroi) {
                    console.log('Localização fora de Niterói, usando endereço padrão');
                    coordinates = null;
                }
            }

            // Fallback: Endereço padrão da loja
            if (!coordinates) {
                const defaultAddress = 'R. Francisca Lopes de Souza, Engenho do Mato, Itaipu, Região Oceânica, Niterói, RJ, 24344-175, Brasil';
                coordinates = await this.tryGeocode(defaultAddress);
            }

            // Último fallback: coordenadas fixas da loja em Itaipu
            this.coordinates = coordinates || { lat: -22.9640, lng: -43.0380 };

        } catch (error) {
            console.error('Erro ao geocodificar:', error);
            // Coordenadas da loja em Itaipu, Niterói
            this.coordinates = { lat: -22.9640, lng: -43.0380 };
        } finally {
            this.isLoadingLocation = false;
            this.updateLoadingState(false);
            this.initializeMap();
        }
    }

    async tryGeocode(address) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error('Erro na tentativa de geocodificação:', error);
            return null;
        }
    }

    async verifyLocation(coordinates) {
        try {
            // Verificar se está próximo a Itaipu/Região Oceânica (raio de ~20km)
            const itaipuLat = -22.9640;
            const itaipuLng = -43.0380;
            
            const distanceItaipu = this.calculateDistance(
                coordinates.lat, coordinates.lng,
                itaipuLat, itaipuLng
            );
            
            // Se está a menos de 20km de Itaipu, aceitar
            if (distanceItaipu < 20) return true;
            
            // Verificar também o centro de Niterói como alternativa
            const niteroiLat = -22.9068;
            const niteroiLng = -43.1729;
            
            const distanceNiteroi = this.calculateDistance(
                coordinates.lat, coordinates.lng,
                niteroiLat, niteroiLng
            );
            
            // Se está a menos de 15km do centro de Niterói, aceitar
            return distanceNiteroi < 15;
        } catch (error) {
            console.error('Erro ao verificar localização:', error);
            return true; // Em caso de erro, aceitar a localização
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    initializeMap() {
        if (!this.coordinates) return;

        // Limpar mapa anterior se existir
        if (this.map) {
            this.map.remove();
        }

        const mapContainer = document.getElementById('interactive-map');
        if (!mapContainer) {
            console.error('Container do mapa não encontrado');
            return;
        }

        // Criar o mapa interativo
        this.map = L.map('interactive-map').setView([this.coordinates.lat, this.coordinates.lng], 16);

        // Adicionar camada do mapa
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(this.map);

        // Criar ícone customizado roxo
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin"></div><div class="marker-pulse"></div>',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });

        // Adicionar marcador arrastável
        this.marker = L.marker([this.coordinates.lat, this.coordinates.lng], {
            draggable: true,
            icon: customIcon
        }).addTo(this.map);

        // Adicionar popup
        this.marker.bindPopup(`
            <div class="map-popup">
                <strong>📍 Sua localização</strong><br>
                ${this.address.logradouro}${this.address.numero ? `, ${this.address.numero}` : ''}<br>
                <small>Arraste o marcador ou clique no mapa</small>
            </div>
        `).openPopup();

        // Atualizar coordenadas quando arrastar
        this.marker.on('dragend', () => {
            const position = this.marker.getLatLng();
            this.coordinates = { lat: position.lat, lng: position.lng };
            this.updateCoordinatesDisplay();
        });

        // Permitir clicar no mapa para definir localização
        this.map.on('click', (e) => {
            // Mover marcador para onde clicou
            this.marker.setLatLng(e.latlng);
            this.coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };
            this.updateCoordinatesDisplay();
            
            // Mostrar popup
            this.marker.bindPopup(`
                <div class="map-popup">
                    <strong>📍 Nova localização</strong><br>
                    Lat: ${e.latlng.lat.toFixed(6)}<br>
                    Lng: ${e.latlng.lng.toFixed(6)}<br>
                    <small>Clique novamente para ajustar</small>
                </div>
            `).openPopup();
        });

        // Forçar redimensionamento
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 100);
        
        this.updateCoordinatesDisplay();
    }

    updateCoordinatesDisplay() {
        const coordinatesEl = document.querySelector('.coordinates-display');
        if (coordinatesEl && this.coordinates) {
            coordinatesEl.innerHTML = `
                <div class="coord-item">
                    <span class="coord-label">📍 Latitude:</span>
                    <span class="coord-value">${this.coordinates.lat.toFixed(6)}</span>
                </div>
                <div class="coord-item">
                    <span class="coord-label">📍 Longitude:</span>
                    <span class="coord-value">${this.coordinates.lng.toFixed(6)}</span>
                </div>
            `;
        }
    }

    updateLoadingState(isLoading) {
        const loader = document.querySelector('.map-loading');
        const mapEl = document.getElementById('interactive-map');
        
        if (loader && mapEl) {
            if (isLoading) {
                loader.style.display = 'flex';
                mapEl.style.display = 'none';
            } else {
                loader.style.display = 'none';
                mapEl.style.display = 'block';
            }
        }
    }

    handleConfirm() {
        const confirmBtn = document.querySelector('.btn-confirm-location');
        if (!confirmBtn) return;

        confirmBtn.classList.add('loading');
        confirmBtn.disabled = true;

        setTimeout(() => {
            if (this.onConfirm && this.coordinates) {
                // Salvar a última localização antes de confirmar
                this.saveLastLocation(this.coordinates);
                this.onConfirm(this.coordinates);
            }
            this.close();
        }, 500);
    }

    render() {
        let existingModal = document.getElementById('map-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="map-overlay" id="map-modal">
                <div class="map-modal-container" onclick="event.stopPropagation()">
                    <div class="map-header">
                        <div class="header-icon-title">
                            <div class="header-icon">📍</div>
                            <h2>Onde você está?</h2>
                        </div>
                        <button class="close-btn" onclick="mapModal.close()">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="map-content">
                        <p class="map-instruction">
                            <span class="instruction-icon">👋</span>
                            Oi! Vamos confirmar seu endereço? Assim fica mais fácil pra gente te encontrar!
                        </p>
                        
                        <div class="address-info">
                            <div class="address-info-icon">🏠</div>
                            <div class="address-info-text">
                                <p class="address-info-main"><strong>${this.address.logradouro}${this.address.numero ? `, ${this.address.numero}` : ''}</strong></p>
                                <p class="address-info-sub">${this.address.bairro} - ${this.address.localidade}/${this.address.uf}</p>
                            </div>
                        </div>

                        <div class="map-container-wrapper">
                            <div class="map-loading" style="display: ${this.isLoadingLocation ? 'flex' : 'none'}">
                                <div class="map-spinner"></div>
                                <p class="map-loading-text">🔍 Procurando seu endereço...</p>
                                <p class="map-loading-subtext">Só um instantinho!</p>
                            </div>
                            
                            <div id="interactive-map" class="interactive-map" style="display: ${this.isLoadingLocation ? 'none' : 'block'}"></div>
                            
                            <div class="coordinates-display"></div>
                        </div>

                        <div class="map-actions-row">
                            <button class="btn-use-current-location" onclick="mapModal.useCurrentLocation()">
                                <span class="btn-icon">📍</span>
                                <span>Usar Minha Localização Atual</span>
                            </button>
                        </div>

                        <div class="map-tip">
                            <span class="tip-icon">💡</span>
                            <span class="tip-text">Dica: Arraste o marcador roxo para ajustar a localização exata!</span>
                        </div>

                        <div class="map-note">
                            <span class="note-icon">ℹ️</span>
                            <span>Vamos enviar o link do Google Maps pro entregador te encontrar rapidinho!</span>
                        </div>
                    </div>

                    <div class="map-footer">
                        <button class="btn-confirm-location" onclick="mapModal.handleConfirm()">
                            <span class="btn-text">✓ Confirmar Localização</span>
                            <span class="btn-loader"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Modal de Pagamento
class PaymentModal {
    constructor() {
        this.selectedPayment = null;
        this.needsChange = false;
        this.changeAmount = '';
        this.showChangeModal = false;
        this.onConfirm = null;
    }

    open(onConfirmCallback) {
        this.onConfirm = onConfirmCallback;
        this.selectedPayment = null;
        this.needsChange = false;
        this.changeAmount = '';
        this.showChangeModal = false;
        this.render();
    }

    close() {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 200);
        }
        const changeModal = document.getElementById('change-modal');
        if (changeModal) {
            changeModal.classList.add('closing');
            setTimeout(() => changeModal.remove(), 200);
        }
    }

    selectPayment(paymentId) {
        this.selectedPayment = paymentId;
        
        if (paymentId === 'dinheiro') {
            this.showChangeModal = true;
        } else {
            this.showChangeModal = false;
        }
        
        this.render();
    }

    confirmChange() {
        // Fechar o modal de troco
        const changeModal = document.getElementById('change-modal');
        if (changeModal) {
            changeModal.classList.add('closing');
            setTimeout(() => changeModal.remove(), 200);
        }

        this.showChangeModal = false;
        this.render();
    }

    updateChangeButton() {
        const btn = document.querySelector('.btn-confirm-change');
        if (!btn) return;

        const isValid = !this.needsChange || (this.changeAmount && parseFloat(this.changeAmount) > 0);

        if (isValid) {
            btn.classList.remove('disabled');
            btn.disabled = false;
        } else {
            btn.classList.add('disabled');
            btn.disabled = true;
        }
    }

    handleConfirm() {
        if (!this.canConfirm()) return;
        
        const confirmBtn = document.querySelector('.btn-confirm-payment');
        if (!confirmBtn) return;

        confirmBtn.classList.add('loading');
        confirmBtn.disabled = true;

        setTimeout(() => {
            const paymentData = {
                method: this.selectedPayment,
                needsChange: this.selectedPayment === 'dinheiro' ? this.needsChange : false,
                changeAmount: this.selectedPayment === 'dinheiro' && this.needsChange ? this.changeAmount : null
            };
            
            if (this.onConfirm) {
                this.onConfirm(paymentData);
            }
            this.close();
        }, 500);
    }

    canConfirm() {
        return this.selectedPayment && (
            this.selectedPayment !== 'dinheiro' || 
            !this.needsChange || 
            (this.needsChange && this.changeAmount && parseFloat(this.changeAmount) > 0)
        );
    }

    render() {
        let existingModal = document.getElementById('payment-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const paymentOptions = [
            { id: 'credito', label: 'Cartão de Crédito', icon: '💳', description: 'Todas as bandeiras aceitas' },
            { id: 'debito', label: 'Cartão de Débito', icon: '💳', description: 'Na maquininha na entrega' },
            { id: 'dinheiro', label: 'Dinheiro', icon: '💵', description: 'Pagamento em espécie' },
            { id: 'pix', label: 'PIX', icon: '📱', description: 'Transferência instantânea' }
        ];

        const modalHTML = `
            <div class="payment-modal-overlay" id="payment-modal">
                <div class="payment-modal" onclick="event.stopPropagation()">
                    <div class="payment-modal-header">
                        <div class="header-icon-title">
                            <div class="header-icon">💰</div>
                            <h2>Como você quer pagar?</h2>
                        </div>
                        <button class="close-btn" onclick="paymentModal.close()">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="payment-modal-body">
                        <p class="payment-instruction">
                            <span class="instruction-icon">👆</span>
                            Escolha a forma de pagamento que preferir:
                        </p>
                        
                        <div class="payment-options">
                            ${paymentOptions.map((option, index) => `
                                <button class="payment-option ${this.selectedPayment === option.id ? 'selected' : ''}"
                                        style="animation-delay: ${index * 0.05}s"
                                        onclick="paymentModal.selectPayment('${option.id}')">
                                    <div class="payment-option-content">
                                        <span class="payment-icon">${option.icon}</span>
                                        <div class="payment-text">
                                            <span class="payment-label">${option.label}</span>
                                            <span class="payment-description">${option.description}</span>
                                        </div>
                                    </div>
                                    ${this.selectedPayment === option.id ? '<span class="check-icon">✓</span>' : ''}
                                </button>
                            `).join('')}
                        </div>

                        ${this.selectedPayment === 'dinheiro' && !this.showChangeModal ? `
                            <div class="change-info">
                                ${this.needsChange ? `
                                    <div class="change-details">
                                        <div class="change-amount-display">
                                            <span class="change-icon">💵</span>
                                            <div class="change-text-content">
                                                <p class="change-label">Troco para</p>
                                                <p class="change-value">R$ ${parseFloat(this.changeAmount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <button class="btn-edit-change" 
                                                onclick="paymentModal.showChangeModal = true; paymentModal.render()">
                                            <span>✏️</span>
                                        </button>
                                    </div>
                                ` : `
                                    <div class="no-change-display">
                                        <span class="no-change-icon">✓</span>
                                        <p class="no-change-text">Tudo certinho! Valor exato</p>
                                    </div>
                                `}
                            </div>
                        ` : ''}
                    </div>

                    <div class="payment-modal-footer">
                        <button class="btn-cancel" onclick="paymentModal.close()">
                            <span>Voltar</span>
                        </button>
                        <button class="btn-confirm-payment ${!this.canConfirm() ? 'disabled' : ''}" 
                                onclick="paymentModal.handleConfirm()"
                                ${!this.canConfirm() ? 'disabled' : ''}>
                            <span class="btn-text">✓ Confirmar</span>
                            <span class="btn-loader"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Animar entrada das opções
        setTimeout(() => {
            document.querySelectorAll('.payment-option').forEach((option, index) => {
                setTimeout(() => {
                    option.classList.add('animate-in');
                }, index * 50);
            });
        }, 10);

        if (this.showChangeModal) {
            this.renderChangeModal();
        }
    }

    renderChangeModal() {
        let existingModal = document.getElementById('change-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="change-modal-overlay" id="change-modal">
                <div class="change-modal" onclick="event.stopPropagation()">
                    <div class="change-modal-header">
                        <div class="header-icon-title">
                            <div class="header-icon">💵</div>
                            <h3>Vai precisar de troco?</h3>
                        </div>
                        <button class="close-btn" onclick="paymentModal.showChangeModal = false; paymentModal.render()">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="change-modal-body">
                        <div class="change-options">
                            <button class="change-option ${!this.needsChange ? 'selected' : ''}"
                                    onclick="paymentModal.needsChange = false; paymentModal.changeAmount = ''; paymentModal.renderChangeModal()">
                                <div class="change-option-content">
                                    <span class="option-icon">✓</span>
                                    <span class="option-label">Não, tenho o valor certinho</span>
                                </div>
                                ${!this.needsChange ? '<span class="check-icon">✓</span>' : ''}
                            </button>

                            <button class="change-option ${this.needsChange ? 'selected' : ''}"
                                    onclick="paymentModal.needsChange = true; paymentModal.renderChangeModal()">
                                <div class="change-option-content">
                                    <span class="option-icon">💵</span>
                                    <span class="option-label">Sim, vou precisar de troco</span>
                                </div>
                                ${this.needsChange ? '<span class="check-icon">✓</span>' : ''}
                            </button>
                        </div>

                        ${this.needsChange ? `
                            <div class="change-input-container">
                                <label for="changeAmount">
                                    <span class="label-icon">💰</span>
                                    Qual o valor da nota que você vai dar?
                                </label>
                                <div class="input-with-prefix">
                                    <span class="currency-prefix">R$</span>
                                    <input id="changeAmount" type="number" step="0.01" min="0.01"
                                           placeholder="0,00" value="${this.changeAmount}"
                                           oninput="paymentModal.changeAmount = this.value; paymentModal.updateChangeButton()"
                                           autofocus>
                                </div>
                                <p class="input-hint">
                                    <span class="hint-icon">💡</span>
                                    Assim a gente já separa o troco pra você!
                                </p>
                            </div>
                        ` : ''}
                    </div>

                    <div class="change-modal-footer">
                        <button class="btn-confirm-change ${this.needsChange && (!this.changeAmount || parseFloat(this.changeAmount) <= 0) ? 'disabled' : ''}"
                                onclick="paymentModal.confirmChange()"
                                ${this.needsChange && (!this.changeAmount || parseFloat(this.changeAmount) <= 0) ? 'disabled' : ''}>
                            <span class="btn-text">✓ Pronto!</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Adicionar evento de clique no overlay
        const overlay = document.getElementById('change-modal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.showChangeModal = false;
                    this.render();
                }
            });
        }

        // Focar no input se necessário
        if (this.needsChange) {
            setTimeout(() => {
                const input = document.getElementById('changeAmount');
                if (input) input.focus();
            }, 100);
        }

        // Animar entrada das opções
        setTimeout(() => {
            document.querySelectorAll('.change-option').forEach((option, index) => {
                setTimeout(() => {
                    option.classList.add('animate-in');
                }, index * 50);
            });
        }, 10);
    }
}

// Instâncias globais
const mapModal = new MapModal();
const paymentModal = new PaymentModal();
