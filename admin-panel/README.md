# 📱 Painel Administrativo - Açaí & Cia

Sistema completo de gerenciamento de produtos com integração ao Netlify para publicação automática.

---

## 🎯 Funcionalidades

✅ **Edição de Preços** - Altere preços originais e de venda em tempo real  
✅ **Pausar/Ativar Produtos** - Toggle visual para controlar visibilidade no site  
✅ **Busca Inteligente** - Encontre produtos rapidamente  
✅ **Publicação Automática** - Deploy direto no Netlify com um clique  
✅ **Dashboard Estatístico** - Visualize métricas em tempo real  
✅ **Sistema de Login** - Acesso protegido por senha  
✅ **Responsivo** - Funciona perfeitamente em mobile e desktop  

---

## 🚀 Como Configurar

### Passo 1: Deploy do Painel Admin

1. **Criar novo site no Netlify** para o painel admin
2. Fazer upload da pasta `admin-panel` ou conectar via Git
3. Site estará disponível em: `seu-painel-admin.netlify.app`

### Passo 2: Obter Credenciais do Netlify

#### 2.1 Site ID do Site Principal
1. Acesse seu site principal no Netlify
2. Vá em **Site Settings** → **General**
3. Copie o **Site ID** (ex: `abc123-def456-ghi789`)

#### 2.2 Personal Access Token
1. Acesse https://app.netlify.com
2. Clique no seu avatar → **User Settings**
3. Vá em **Applications** → **Personal Access Tokens**
4. Clique em **New access token**
5. Dê um nome (ex: "Admin Panel")
6. Copie o token gerado (guarde em local seguro!)

### Passo 3: Configurar o Painel

1. Acesse `seu-painel-admin.netlify.app`
2. **Login:** Use a senha padrão `admin123`
3. Clique no ícone de **configurações** ⚙️
4. Preencha:
   - **Site ID:** Cole o Site ID do site principal
   - **Access Token:** Cole o token pessoal
   - **Nova Senha:** (Opcional) Altere a senha padrão
5. Clique em **Salvar Configurações**

---

## 📖 Como Usar

### Login
```
URL: seu-painel-admin.netlify.app
Senha padrão: admin123
```

### Editar Preços
1. Localize o produto na lista
2. Altere os valores em "Preço Original" ou "Preço Venda"
3. Alterações são salvas automaticamente
4. Botão "Publicar" ficará habilitado

### Pausar/Ativar Produtos
1. Clique no **toggle** (botão verde/cinza) ao lado do produto
2. Verde = Ativo (visível no site)
3. Cinza = Pausado (oculto no site)

### Buscar Produtos
1. Digite o nome do produto na barra de busca
2. Resultados aparecem em tempo real

### Publicar Alterações
1. Após fazer as alterações desejadas
2. Clique em **"Publicar no Netlify"**
3. Confirme a ação
4. Aguarde o deploy (15-30 segundos)
5. Site principal será atualizado automaticamente!

---

## ⚙️ Configurações Avançadas

### Alterar URL do JSON

No arquivo `admin.js`, linha 14:

```javascript
// Para desenvolvimento local
const PRODUCTS_JSON_URL = '../products_with_prices.json';

// Para produção (descomente e atualize)
// const PRODUCTS_JSON_URL = 'https://seu-site.netlify.app/products_with_prices.json';
```

### Alterar Senha Padrão

No arquivo `index.html`, linha 55:

```javascript
const DEFAULT_PASSWORD = 'admin123'; // Altere aqui
```

Ou use a interface de configurações no painel.

---

## 🔒 Segurança

### Boas Práticas

1. **Altere a senha padrão** imediatamente
2. **Não compartilhe** o Access Token
3. **Use HTTPS** sempre (Netlify já fornece)
4. **Revogue tokens** não utilizados
5. **Faça logout** após usar em computadores públicos

### Proteção de Dados

- Senha armazenada localmente (localStorage)
- Token nunca enviado para terceiros
- Comunicação criptografada (HTTPS)
- Deploy via API oficial do Netlify

---

## 📊 Estrutura de Arquivos

```
admin-panel/
├── index.html          # Página de login
├── dashboard.html      # Dashboard principal
├── admin.css           # Estilos do painel
├── admin.js            # Lógica e integração Netlify
└── README.md           # Esta documentação
```

---

## 🐛 Resolução de Problemas

### "Erro ao carregar produtos"
**Causa:** URL do JSON incorreta  
**Solução:** Verifique a URL em `admin.js` linha 14

### "Configure as credenciais do Netlify"
**Causa:** Site ID ou Access Token não configurados  
**Solução:** Acesse configurações ⚙️ e preencha os dados

### "Erro ao publicar"
**Causa:** Token inválido ou expirado  
**Solução:** Gere um novo token no Netlify e atualize

### Produtos não aparecem no site após publicar
**Causa:** Cache do navegador  
**Solução:** Aguarde 1-2 minutos ou faça refresh com Ctrl+F5

### Botão "Publicar" desabilitado
**Causa:** Nenhuma alteração foi feita  
**Solução:** Faça alguma edição primeiro

---

## 🎨 Personalização

### Cores do Tema

No arquivo `admin.css`, linha 8-19:

```css
:root {
    --primary: #8E24AA;        /* Roxo principal */
    --success: #4CAF50;        /* Verde sucesso */
    --warning: #FF9800;        /* Laranja aviso */
    --danger: #F44336;         /* Vermelho erro */
    /* ... */
}
```

### Logo e Nome

No arquivo `dashboard.html`, linha 13:

```html
<i class="fas fa-ice-cream"></i>
<h1>Painel Admin - Açaí & Cia</h1>
```

---

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ Sistema de login com senha
- ✅ Edição de preços inline
- ✅ Toggle de ativação/desativação
- ✅ Busca em tempo real
- ✅ Integração com Netlify API
- ✅ Dashboard com estatísticas
- ✅ Modal de configurações
- ✅ Prevenção de perda de dados
- ✅ Mensagens de feedback
- ✅ Design responsivo

---

## 🆘 Suporte

### Recursos Úteis

- [Documentação Netlify API](https://docs.netlify.com/api/get-started/)
- [Gerenciar Access Tokens](https://app.netlify.com/user/applications)
- [Status do Netlify](https://www.netlifystatus.com/)

### Contato

Para suporte técnico ou dúvidas sobre o painel, entre em contato com o desenvolvedor.

---

## 📄 Licença

Sistema desenvolvido exclusivamente para Açaí & Cia.

**Desenvolvido com ❤️ usando HTML, CSS e JavaScript puro**

---

## 🎓 Tutorial em Vídeo (Recomendado)

### Como Usar o Painel - Passo a Passo

1. **Primeiro Acesso:**
   - Acesse o painel admin
   - Faça login com senha padrão
   - Vá em configurações
   - Configure Site ID e Token
   - Altere a senha

2. **Editar Produtos:**
   - Busque o produto
   - Clique para editar preço
   - Toggle para pausar/ativar
   - Clique em "Publicar"

3. **Verificar Publicação:**
   - Aguarde mensagem de sucesso
   - Abra o site em nova aba
   - Verifique as alterações
   - Produtos pausados não aparecem

---

**✨ Pronto! Seu painel está configurado e pronto para uso!**
