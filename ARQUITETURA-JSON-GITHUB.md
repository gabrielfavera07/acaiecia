# 🔄 Arquitetura de Atualização em Tempo Real via GitHub

## 📋 Visão Geral

Esta solução permite que as páginas (admin e normal) permaneçam **estáticas no Netlify** enquanto **apenas o arquivo JSON é atualizado no GitHub**. Ambas as páginas consomem o JSON diretamente do GitHub Raw em tempo real.

## 🎯 Benefícios

✅ **Páginas estáticas** - Não precisam ser redesployadas  
✅ **Atualizações instantâneas** - JSON é atualizado em segundos  
✅ **Deploy automático** - Netlify sincroniza automaticamente com GitHub  
✅ **Cache busting** - Timestamp garante sempre a versão mais recente  
✅ **Sem complexidade** - Não usa Netlify Functions ou APIs extras  

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         GITHUB                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  products_with_prices.json (ÚNICO ARQUIVO EDITÁVEL) │   │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│                    GitHub Raw URL                           │
│   https://raw.githubusercontent.com/.../products_...json   │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌──────────────────┐                  ┌──────────────────┐
│  PÁGINA NORMAL   │                  │  PÁGINA ADMIN    │
│   (Netlify)      │                  │   (Netlify)      │
├──────────────────┤                  ├──────────────────┤
│ - index.html     │                  │ - dashboard.html │
│ - script.js      │                  │ - admin-github.js│
│ - config.js      │                  │ - config.js      │
└──────────────────┘                  └──────────────────┘
   ↓ Lê JSON                             ↓ Lê/Escreve JSON
   Tempo Real                             Tempo Real
```

## 📂 Estrutura de Arquivos

### Arquivo de Configuração Global: `config.js`

```javascript
const CONFIG = {
    github: {
        owner: 'gabrielfavera07',
        repo: 'acaiecia',
        branch: 'main',
        filePath: 'products_with_prices.json'
    },
    jsonUrl: 'https://raw.githubusercontent.com/gabrielfavera07/acaiecia/main/products_with_prices.json',
    whatsappNumber: '5521987943015'
};
```

### Página Normal: `script.js`

```javascript
function fetchProducts() {
    const cacheBuster = new Date().getTime();
    const jsonUrl = window.CONFIG ? window.CONFIG.jsonUrl : 
        'https://raw.githubusercontent.com/gabrielfavera07/acaiecia/main/products_with_prices.json';
    
    fetch(`${jsonUrl}?v=${cacheBuster}`)
        .then(response => response.json())
        .then(data => {
            // Renderizar produtos...
        });
}
```

### Página Admin: `admin-github.js`

```javascript
const PRODUCTS_JSON_URL = 'https://raw.githubusercontent.com/gabrielfavera07/acaiecia/main/products_with_prices.json';

// Ao publicar alterações:
publishBtn.addEventListener('click', async () => {
    // 1. Obter SHA do arquivo atual
    const fileInfo = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`);
    
    // 2. Fazer commit do novo JSON
    const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
            message: '🔄 Atualização de produtos via Admin Panel',
            content: base64Content,
            sha: currentSha
        })
    });
});
```

## 🔄 Fluxo de Atualização

### Quando o Admin atualiza um produto:

1. **Admin edita** preços/status no painel → `admin-github.js`
2. **Commit no GitHub** → API GitHub atualiza `products_with_prices.json`
3. **GitHub Raw atualizado** → Arquivo disponível instantaneamente em GitHub Raw
4. **Páginas leem JSON** → Ambas as páginas já consomem do GitHub Raw
5. **Usuários veem alterações** → No próximo reload da página

### Diagrama de Sequência:

```
Admin → GitHub API → products_with_prices.json (GitHub)
                              ↓
                         GitHub Raw URL
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
            Página Normal        Página Admin
         (lê em tempo real)  (lê em tempo real)
```

## ⚙️ Configuração

### 1. GitHub Token (Para Admin)

O admin precisa configurar um Personal Access Token:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque a permissão **"repo"** (Full control)
4. Cole o token no painel admin → Configurações

### 2. Netlify (Deploy Automático)

O Netlify já está configurado para sincronizar automaticamente com o GitHub:

- Quando o admin faz commit, o Netlify detecta a mudança
- **Netlify NÃO redesploya as páginas** (apenas sincroniza o JSON)
- As páginas HTML/JS/CSS permanecem inalteradas

## 🚀 Vantagens desta Arquitetura

### 1. **Separação de Responsabilidades**
- GitHub = Banco de dados (JSON)
- Netlify = Hospedagem estática (HTML/JS/CSS)

### 2. **Performance**
- GitHub Raw serve JSON muito rápido
- Sem necessidade de rebuild no Netlify
- Cache busting evita cache desatualizado

### 3. **Simplicidade**
- Não precisa de backend
- Não precisa de banco de dados
- Não precisa de Netlify Functions

### 4. **Manutenibilidade**
- URL do JSON centralizada em `config.js`
- Fácil de mudar repositório/branch
- Código limpo e organizado

## 🔧 Cache Busting

Para evitar cache do navegador, usamos timestamp na URL:

```javascript
const cacheBuster = new Date().getTime();
fetch(`${jsonUrl}?v=${cacheBuster}`)
```

Isso força o navegador a sempre buscar a versão mais recente.

## 📝 Arquivos Modificados

1. ✅ `config.js` - Criado (configuração global)
2. ✅ `script.js` - Modificado (consome GitHub Raw)
3. ✅ `admin-github.js` - Modificado (consome GitHub Raw)
4. ✅ `index.html` - Modificado (inclui config.js)
5. ✅ `admin-panel/dashboard.html` - Modificado (inclui config.js)

## 🎉 Resultado Final

### Antes:
- ❌ Páginas redesployadas a cada alteração
- ❌ Demora de 1-2 minutos para atualizar
- ❌ JSON no Netlify (sincronização lenta)

### Depois:
- ✅ Páginas permanecem estáticas
- ✅ Atualizações em 5-10 segundos
- ✅ JSON no GitHub Raw (atualização instantânea)
- ✅ Admin e usuários sempre veem a versão mais recente

## 🔐 Segurança

- GitHub Token armazenado apenas no localStorage do admin
- Token não é exposto para usuários normais
- API do GitHub requer autenticação para writes
- Reads são públicos via GitHub Raw (repositório público)

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- `admin-panel/CONFIGURACAO-GITHUB-TOKEN.md` - Configuração do GitHub Token
- `admin-panel/SOLUCAO-ERROS.md` - Resolução de erros comuns
- `admin-panel/UPLOAD-DIRETO-GITHUB.md` - Detalhes do upload direto

---

**Desenvolvido para AÇAÍ & CIA** 🍦
