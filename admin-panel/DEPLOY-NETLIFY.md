# 🚀 Deploy do Painel Admin no Netlify

Guia completo para fazer deploy do painel administrativo no subdomínio `acaiecia-julioadmin.netlify.app`

---

## 📋 **PRÉ-REQUISITOS**

Antes de começar, você precisa ter:

1. ✅ Conta no Netlify (https://app.netlify.com)
2. ✅ Node.js instalado (https://nodejs.org)
3. ✅ Terminal/PowerShell aberto

---

## 🔧 **PASSO 1: Instalar Netlify CLI**

Abra o terminal/PowerShell e execute:

```bash
npm install -g netlify-cli
```

Aguarde a instalação terminar.

---

## 🔐 **PASSO 2: Fazer Login no Netlify**

```bash
netlify login
```

Isso abrirá o navegador para você autorizar. Clique em **"Authorize"**.

---

## 📁 **PASSO 3: Navegar até a pasta admin-panel**

```bash
cd "c:\Users\Favera\Downloads\renamed_images\home\ubuntu\renamed_images\imagens_referentes_pdf\SITE BOM BONITO E TOP DO IGOR - Copia\admin-panel"
```

Ou navegue pelo File Explorer e abra o terminal nesta pasta.

---

## 🚀 **PASSO 4: Fazer Deploy**

### **Opção A: Deploy Direto (Recomendado)**

```bash
netlify deploy --prod --site acaiecia-julioadmin
```

Se o site não existir, será criado automaticamente.

### **Opção B: Deploy Manual Passo a Passo**

1. **Inicializar o site:**

```bash
netlify init
```

Escolha:
- `Create & configure a new site` → Yes
- Team: `Escolha seu time`
- Site name: `acaiecia-julioadmin`
- Build command: `Deixe em branco` (Enter)
- Directory to deploy: `.` (Enter)

2. **Fazer o deploy:**

```bash
netlify deploy --prod
```

Quando perguntar "Publish directory", digite: `.` (ponto) e Enter

---

## ✅ **PASSO 5: Verificar o Deploy**

Após o deploy, você verá:

```
✔ Deploy is live!
```

E o link: `https://acaiecia-julioadmin.netlify.app`

---

## 🔄 **ATUALIZAR O PAINEL (DEPLOYAR NOVAMENTE)**

Sempre que fizer alterações:

```bash
cd "c:\Users\Favera\Downloads\renamed_images\home\ubuntu\renamed_images\imagens_referentes_pdf\SITE BOM BONITO E TOP DO IGOR - Copia\admin-panel"
netlify deploy --prod
```

---

## 🛠️ **CONFIGURAÇÕES IMPORTANTES**

### **1. Configurar Site ID e Access Token**

Depois do deploy, configure no painel admin:

1. Acesse: `https://acaiecia-julioadmin.netlify.app`
2. Faça login (senha padrão: `admin123`)
3. Clique em **⚙️ Configurações**
4. Preencha:
   - **Site ID**: Encontre em https://app.netlify.com/sites/acaiecia-julioadmin/settings/general
   - **Access Token**: Crie em https://app.netlify.com/user/applications#personal-access-tokens

### **2. Apontar para o JSON do site principal**

No arquivo `admin-panel/admin.js`, linha 13, atualize:

```javascript
// ANTES (local):
const PRODUCTS_JSON_URL = '../products_with_prices.json';

// DEPOIS (produção):
const PRODUCTS_JSON_URL = 'https://seu-site-principal.netlify.app/products_with_prices.json';
```

Substitua `seu-site-principal.netlify.app` pelo URL do seu site principal.

---

## 🔒 **SEGURANÇA**

### **Alterar a Senha Padrão**

1. Acesse o painel admin
2. Vá em **⚙️ Configurações**
3. Em "Alterar Senha do Painel", digite a nova senha
4. Clique em **Salvar**

### **Adicionar Proteção com Senha do Netlify (Opcional)**

No Netlify Dashboard:

1. Site Settings → Visitor access
2. Scroll até "Restrict site access"
3. Enable password protection
4. Set password

---

## 📝 **COMANDOS ÚTEIS**

```bash
# Ver status do site
netlify status

# Abrir painel Netlify no navegador
netlify open

# Ver logs
netlify watch

# Listar todos os seus sites
netlify sites:list

# Deletar o site (cuidado!)
netlify sites:delete acaiecia-julioadmin
```

---

## ❌ **SOLUÇÃO DE PROBLEMAS**

### **Erro: "Command not found: netlify"**

Reinstale o Netlify CLI:
```bash
npm install -g netlify-cli
```

### **Erro: "Site not found"**

Use o Site ID ao invés do nome:
```bash
netlify link
```
Escolha o site manualmente.

### **Erro: "Unauthorized"**

Faça login novamente:
```bash
netlify logout
netlify login
```

---

## 🎯 **RESULTADO FINAL**

Após o deploy bem-sucedido:

✅ **Painel Admin:** https://acaiecia-julioadmin.netlify.app  
✅ **Site Principal:** (o que você já tem)

---

## 📞 **SUPORTE**

Documentação Netlify: https://docs.netlify.com/cli/get-started/

---

**Pronto! Seu painel admin estará no ar!** 🚀
