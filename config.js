// ===== CONFIGURAÇÃO GLOBAL DO PROJETO =====
// Este arquivo centraliza as URLs e configurações usadas em todo o projeto

const CONFIG = {
    // Configurações do GitHub
    github: {
        owner: 'gabrielfavera07',
        repo: 'acaiecia',
        branch: 'main',
        filePath: 'products_with_prices.json'
    },
    
    // URL do JSON (GitHub Raw - atualização em tempo real)
    // Esta URL serve o arquivo JSON diretamente do GitHub sem passar pelo Netlify
    // Quando o admin faz commit, o arquivo é atualizado instantaneamente aqui
    jsonUrl: 'https://raw.githubusercontent.com/gabrielfavera07/acaiecia/main/products_with_prices.json',
    
    // Informações do restaurante
    whatsappNumber: '5521987943015'
};

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
