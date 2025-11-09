import React, { useState, useEffect, useRef } from 'react';
import './ProductCustomizationModal.css';

const ProductCustomizationModal = ({ item, onClose, onAddToCart }) => {
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(item.preco_venda);
  
  // Refs para scroll
  const salgadosRef = useRef(null);
  const saborAcaiRef = useRef(null);
  const molhosRef = useRef(null);
  const separacaoRef = useRef(null);
  const refrigeranteRef = useRef(null);

  // Calcula o preço total com as customizações
  const calculateTotalPrice = () => {
    let total = item.preco_venda;
    
    // Adicionar preço de separação
    if (selections.separacao === 'separado') {
      total += 4.00;
    }
    
    // Adicionar preço dos acompanhamentos
    if (selections.acompanhamentos) {
      selections.acompanhamentos.forEach(acomp => {
        const acompItem = acompanhamentos.find(a => a.nome === acomp);
        if (acompItem) total += acompItem.preco;
      });
    }
    
    // Adicionar preço dos adicionais
    if (selections.adicionais) {
      selections.adicionais.forEach(adic => {
        const adicItem = adicionais.find(a => a.nome === adic);
        if (adicItem) total += adicItem.preco;
      });
    }
    
    // Adicionar preço dos salgados
    if (selections.salgados) {
      selections.salgados.forEach(salg => {
        const salgItem = salgados.find(s => s.nome === salg);
        if (salgItem) total += salgItem.preco;
      });
    }
    
    // Adicionar preço das bebidas extras
    if (selections.bebidas) {
      selections.bebidas.forEach(beb => {
        const bebItem = bebidas.find(b => b.nome === beb);
        if (bebItem) total += bebItem.preco;
      });
    }
    
    return total;
  };

  // Atualizar preço sempre que seleções mudarem
  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [selections]);

  // Determina quais opções de customização mostrar baseado no tipo de produto
  const getCustomizationOptions = () => {
    const productName = item.nome.toLowerCase();
    
    // Para combos com salgados
    if (productName.includes('salgado') || productName.includes('combo')) {
      // Barca e Titanic NÃO têm opção de separação de complementos
      const isBarcaOrTitanic = productName.includes('barca') || productName.includes('titanic');
      const hasAcai = productName.includes('açaí') || productName.includes('acai');

      return {
        hasSalgados: true,
        hasAcai: hasAcai,
        hasAcompanhamentos: hasAcai,
        hasAdicionais: hasAcai,
        hasSeparacao: hasAcai && !isBarcaOrTitanic,
        hasMolhos: true,
        hasBebidas: !productName.includes('refrigerante') && !productName.includes('guaraná'),
        hasRefrigerante: productName.includes('refrigerante'),
        hasGuarana: productName.includes('guaravita'),
        numSalgados: productName.includes('2 salgados') ? 2 : 1
      };
    }
    
    // Para açaí e sorvete
    if (productName.includes('açaí') || productName.includes('sorvete') || productName.includes('barca') || productName.includes('Titanic') || productName.includes('titanic')) {
      // Barca e Titanic NÃO têm opção de separação de complementos
      const isBarcaOrTitanic = productName.includes('barca') || productName.includes('titanic');

      return {
        hasAcai: true,
        hasAcompanhamentos: true,
        hasAdicionais: true,
        hasSeparacao: !isBarcaOrTitanic
      };
    }
    
    // Para hambúrgueres
    if (productName.includes('x-') || productName.includes('big') || productName.includes('hamburguer')) {
      return {
        hasMolhos: true,
        hasAdicionais: true
      };
    }
    
    return {};
  };

  const customOptions = getCustomizationOptions();

  // Verificar se todos os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    // Validar salgados
    if (customOptions.hasSalgados) {
      const numRequired = customOptions.numSalgados || 1;
      const selected = selections.salgados?.length || 0;
      if (selected !== numRequired) return false;
    }
    
    // Validar sabor de açaí
    if (customOptions.hasAcai && !selections.saborAcai) return false;
    
    // Validar molhos
    if (customOptions.hasMolhos && (!selections.molhos || selections.molhos.length === 0)) return false;
    
    // Validar separação (açaí)
    if (customOptions.hasSeparacao && !selections.separacao) return false;
    
    // Validar refrigerante
    if (customOptions.hasRefrigerante && !selections.refrigerante) return false;
    
    return true;
  };

  const validateSelections = () => {
    const newErrors = {};
    
    // Validar salgados
    if (customOptions.hasSalgados) {
      const numRequired = customOptions.numSalgados || 1;
      const selected = selections.salgados?.length || 0;
      if (selected !== numRequired) {
        newErrors.salgados = `Selecione exatamente ${numRequired} salgado(s)`;
      }
    }
    
    // Validar sabor de açaí
    if (customOptions.hasAcai && !selections.saborAcai) {
      newErrors.saborAcai = 'Selecione o sabor do açaí ou sorvete';
    }
    
    // Validar molhos
    if (customOptions.hasMolhos && (!selections.molhos || selections.molhos.length === 0)) {
      newErrors.molhos = 'Selecione pelo menos 1 molho';
    }
    
    // Validar separação (açaí)
    if (customOptions.hasSeparacao && !selections.separacao) {
      newErrors.separacao = 'Escolha como deseja receber';
    }
    
    // Validar refrigerante
    if (customOptions.hasRefrigerante && !selections.refrigerante) {
      newErrors.refrigerante = 'Selecione 1 refrigerante';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Scroll até o primeiro campo vazio
  const scrollToFirstError = () => {
    // Verificar na ordem das seções
    if (customOptions.hasAcai && !selections.saborAcai && saborAcaiRef.current) {
      saborAcaiRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (customOptions.hasSeparacao && !selections.separacao && separacaoRef.current) {
      separacaoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (customOptions.hasSalgados && salgadosRef.current) {
      const numRequired = customOptions.numSalgados || 1;
      const selected = selections.salgados?.length || 0;
      if (selected !== numRequired) {
        salgadosRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    
    if (customOptions.hasMolhos && (!selections.molhos || selections.molhos.length === 0) && molhosRef.current) {
      molhosRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (customOptions.hasRefrigerante && !selections.refrigerante && refrigeranteRef.current) {
      refrigeranteRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  };

  const handleAddToCart = () => {
    if (!isFormValid()) {
      // Se não for válido, mostrar erros e rolar até o primeiro
      validateSelections();
      scrollToFirstError();
      return;
    }
    
    if (validateSelections()) {
      onAddToCart({
        ...item,
        preco_venda: totalPrice,
        preco_original_base: item.preco_venda,
        customizations: selections
      });
      onClose();
    }
  };

  const toggleSelection = (category, value, maxSelections = null) => {
    setSelections(prev => {
      const current = prev[category] || [];
      const index = current.indexOf(value);
      
      if (index > -1) {
        // Remove seleção
        return {
          ...prev,
          [category]: current.filter((_, i) => i !== index)
        };
      } else {
        // Adiciona seleção
        if (maxSelections && current.length >= maxSelections) {
          return prev; // Não adiciona se atingiu o máximo
        }
        return {
          ...prev,
          [category]: [...current, value]
        };
      }
    });
  };

  const setSelection = (category, value) => {
    setSelections(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.nome}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Talher */}
          <div className="customization-section">
            <h3>Precisa de talher?</h3>
            <div className="option-buttons">
              <button
                className={`option-btn ${selections.talher === 'sim' ? 'selected' : ''}`}
                onClick={() => setSelection('talher', 'sim')}
              >
                Sim, preciso de talher
              </button>
              <button
                className={`option-btn ${selections.talher === 'nao' ? 'selected' : ''}`}
                onClick={() => setSelection('talher', 'nao')}
              >
                Não preciso de talher
              </button>
            </div>
          </div>

          {/* Sabor do Açaí */}
          {customOptions.hasAcai && (
            <div className="customization-section" ref={saborAcaiRef}>
              <h3>Sabor do açaí ou sorvete <span className="required">*</span></h3>
              {errors.saborAcai && <p className="error-message">{errors.saborAcai}</p>}
              <div className="option-list">
                {saboresAcai.map((sabor) => (
                  <button
                    key={sabor}
                    className={`option-item ${selections.saborAcai === sabor ? 'selected' : ''}`}
                    onClick={() => setSelection('saborAcai', sabor)}
                  >
                    {sabor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Separação */}
          {customOptions.hasSeparacao && (
            <div className="customization-section" ref={separacaoRef}>
              <h3>Separados ou no copo? <span className="required">*</span></h3>
              {errors.separacao && <p className="error-message">{errors.separacao}</p>}
              <div className="option-buttons">
                <button
                  className={`option-btn ${selections.separacao === 'separado' ? 'selected' : ''}`}
                  onClick={() => setSelection('separacao', 'separado')}
                >
                  Separado (+R$ 4,00)
                  <small>Complementos separados em saquinhos</small>
                </button>
                <button
                  className={`option-btn ${selections.separacao === 'copo' ? 'selected' : ''}`}
                  onClick={() => setSelection('separacao', 'copo')}
                >
                  Dentro do copo
                  <small>Todos os complementos dentro do copo</small>
                </button>
              </div>
            </div>
          )}

          {/* Acompanhamentos */}
          {customOptions.hasAcompanhamentos && (
            <div className="customization-section">
              <h3>Acompanhamentos (até 4)</h3>
              <div className="option-grid">
                {acompanhamentos.map((acomp) => (
                  <button
                    key={acomp.nome}
                    className={`option-checkbox ${selections.acompanhamentos?.includes(acomp.nome) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('acompanhamentos', acomp.nome, 4)}
                    disabled={!selections.acompanhamentos?.includes(acomp.nome) && selections.acompanhamentos?.length >= 4}
                  >
                    {acomp.nome}
                    {acomp.preco > 0 && <span className="extra-price">+R$ {acomp.preco.toFixed(2)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adicionais */}
          {customOptions.hasAdicionais && (
            <div className="customization-section">
              <h3>Adicionais (até 8)</h3>
              <div className="option-grid">
                {adicionais.map((adicional) => (
                  <button
                    key={adicional.nome}
                    className={`option-checkbox ${selections.adicionais?.includes(adicional.nome) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('adicionais', adicional.nome, 8)}
                    disabled={!selections.adicionais?.includes(adicional.nome) && selections.adicionais?.length >= 8}
                  >
                    {adicional.nome}
                    <span className="extra-price">+R$ {adicional.preco.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Salgados */}
          {customOptions.hasSalgados && (
            <div className="customization-section" ref={salgadosRef}>
              <h3>Escolha o seu salgado <span className="required">*</span></h3>
              <p className="selection-counter">
                {selections.salgados?.length || 0}/{customOptions.numSalgados}
              </p>
              {errors.salgados && <p className="error-message">{errors.salgados}</p>}
              <div className="option-list">
                {salgados.map((salgado) => (
                  <button
                    key={salgado.nome}
                    className={`option-item ${selections.salgados?.includes(salgado.nome) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('salgados', salgado.nome, customOptions.numSalgados)}
                    disabled={!selections.salgados?.includes(salgado.nome) && selections.salgados?.length >= customOptions.numSalgados}
                  >
                    {salgado.nome}
                    {salgado.preco > 0 && <span className="extra-price">+R$ {salgado.preco.toFixed(2)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Molhos */}
          {customOptions.hasMolhos && (
            <div className="customization-section" ref={molhosRef}>
              <h3>Molhos <span className="required">*</span></h3>
              {errors.molhos && <p className="error-message">{errors.molhos}</p>}
              <div className="option-buttons">
                {molhos.map((molho) => (
                  <button
                    key={molho}
                    className={`option-checkbox ${selections.molhos?.includes(molho) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('molhos', molho, 3)}
                    disabled={!selections.molhos?.includes(molho) && selections.molhos?.length >= 3}
                  >
                    {molho}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Refrigerantes (obrigatório para combos com refrigerante) */}
          {customOptions.hasRefrigerante && (
            <div className="customization-section" ref={refrigeranteRef}>
              <h3>Refrigerantes <span className="required">*</span></h3>
              {errors.refrigerante && <p className="error-message">{errors.refrigerante}</p>}
              <div className="option-list">
                {refrigerantes.map((refri) => (
                  <button
                    key={refri}
                    className={`option-item ${selections.refrigerante === refri ? 'selected' : ''}`}
                    onClick={() => setSelection('refrigerante', refri)}
                  >
                    {refri}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bebidas extras (para combos) */}
          {customOptions.hasBebidas && (
            <div className="customization-section">
              <h3>Turbine seu lanche (até 3)</h3>
              <div className="option-list">
                {bebidas.map((bebida) => (
                  <button
                    key={bebida.nome}
                    className={`option-item ${selections.bebidas?.includes(bebida.nome) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('bebidas', bebida.nome, 3)}
                    disabled={!selections.bebidas?.includes(bebida.nome) && selections.bebidas?.length >= 3}
                  >
                    {bebida.nome}
                    <span className="extra-price">+R$ {bebida.preco.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-price-summary">
            <span>Total:</span>
            <span className="modal-total-price">R$ {totalPrice.toFixed(2)}</span>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className={`btn-add-cart ${!isFormValid() ? 'disabled' : ''}`}
              onClick={handleAddToCart}
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dados de opções
const saboresAcai = [
  'Açaí Natural',
  'Açaí de Banana',
  'Açaí de morango',
  'Açaí Natural Industrializado (tipo sorvete)',
  'Açaí de banana Industrializado (tipo sorvete)',
  'Açaí de morango Industrializado (tipo sorvete)',
  'Açaí de Cupuaçu',
  'Açaí de Ninho',
  'Açaí de Óreo',
  'Açaí chocotella',
  'Açaí Kinder',
  'Açaí de brownie',
  'Açaí de Ovomaltine',
  'Açaí Ferrero Rocher',
  'Açaí de Prestígio',
  'Açaí de Rafaello',
  'Sorvete de Chocolate',
  'Sorvete de morango',
  'Sorvete de Pistache',
  'Sorvete de Coco',
  'Sorvete de Yogurt',
  'Sorvete de Passas ao Rum',
  'Sorvete chocomenta',
  'Sorvete de abacaxi',
  'Sorvete de Ninho com Nutella',
  'Sorvete de chiclete',
  'Sorvete de Flocos',
  'Sorvete de Sensação',
  'Sorvete de maracujá',
  'Sorvete Blue Ice',
  'Sorvete de Pavê',
  'Sorvete de creme',
  'Sorvete Rafaello'
];

const acompanhamentos = [
  { nome: 'Amendoim picado', preco: 0.50 },
  { nome: 'Paçoca de amendoim', preco: 0.50 },
  { nome: 'Sucrilhos', preco: 0 },
  { nome: 'Flocos de arroz', preco: 0 },
  { nome: 'Aveia em flocos', preco: 0 },
  { nome: 'Chocoball', preco: 0 },
  { nome: 'Granola', preco: 0 },
  { nome: 'Coco ralado', preco: 0 },
  { nome: 'Granulado preto', preco: 0 },
  { nome: 'Granulado colorido', preco: 0 },
  { nome: 'Leite em pó', preco: 1.00 },
  { nome: 'Disquete', preco: 3.00 },
  { nome: 'Calda de doce de leite', preco: 0 },
  { nome: 'Calda de maracujá', preco: 0 },
  { nome: 'Calda de uva', preco: 0 },
  { nome: 'Calda de menta', preco: 0 },
  { nome: 'Calda de tutti-frutti', preco: 0 },
  { nome: 'Calda de leite condensado', preco: 0 },
  { nome: 'Calda de chocolate', preco: 0 },
  { nome: 'Calda de morango', preco: 0 },
  { nome: 'Calda de mel', preco: 0 },
  { nome: 'Amendoim colorido', preco: 0 },
  { nome: 'Calda de banana', preco: 0 },
  { nome: 'Calda de caramelo', preco: 0 },
  { nome: 'Calda de Cassis', preco: 0 },
  { nome: 'Calda de abacaxi', preco: 0 },
  { nome: 'Calda de limão', preco: 0 },
  { nome: 'Calda de açaí', preco: 0 },
  { nome: 'Calda de groselha', preco: 0 }
];

const adicionais = [
  { nome: 'Kit Kat', preco: 5.00 },
  { nome: 'Biscoito óreo', preco: 4.00 },
  { nome: 'Bala fini', preco: 3.00 },
  { nome: 'Bis', preco: 4.00 },
  { nome: 'Creme de avelã', preco: 7.00 },
  { nome: 'Leite condensado', preco: 4.00 },
  { nome: 'Banana', preco: 3.00 },
  { nome: 'Doce de leite', preco: 7.00 },
  { nome: 'Gotas de chocolate', preco: 5.00 },
  { nome: 'Chantilly', preco: 5.00 },
  { nome: 'Ovomaltine', preco: 5.00 },
  { nome: 'Creme de chocolate branco', preco: 7.00 },
  { nome: 'Bombom Sonho de Valsa', preco: 3.00 },
  { nome: 'Chocolate Trento', preco: 4.00 },
  { nome: 'Marshmallows', preco: 3.00 },
  { nome: 'Creme de chocolate ao leite', preco: 7.00 },
  { nome: 'Bombom Ouro Branco', preco: 3.00 },
  { nome: 'Creme de Pistache', preco: 7.00 }
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

const molhos = [
  'Ketchup',
  'Maionese',
  'Maionese Temperada',
  'Sem molho'
];

const refrigerantes = [
  'Coca-Cola Original 350ml',
  'Refrigerante Guaraná Antarctica 350ml',
  'Fanta Uva 350ml'
];

const bebidas = [
  { nome: 'Batata Frita', preco: 8.50 },
  { nome: 'Coca-Cola Original 350ml', preco: 7.50 },
  { nome: 'Fanta Uva 350ml', preco: 7.50 },
  { nome: 'Guaravita', preco: 4.00 },
  { nome: 'Refrigerante Guarana Antarctica 355ml', preco: 7.50 }
];

export default ProductCustomizationModal;
