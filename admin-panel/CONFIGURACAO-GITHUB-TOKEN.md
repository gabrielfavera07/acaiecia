# 🔐 Configuração do GitHub Token - GUIA COMPLETO

## ⚠️ PROBLEMA ATUAL
Erro 403 (Forbidden) ao tentar fazer commit via Netlify Function porque o GitHub Token não tem permissões adequadas.

## 📋 SOLUÇÃO PASSO A PASSO

### 1️⃣ Criar/Verificar GitHub Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Dê um nome: `Netlify Deploy - Acaiecia`
4. Defina expiração: **No expiration** (ou o período desejado)
5. **IMPORTANTE**: Marque as seguintes permissões:
   - ✅ **repo** (Full control of private repositories)
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events
   - ✅ **workflow** (Update GitHub Action workflows)

6. Clique em **"Generate token"**
7. **COPIE O TOKEN** (ele só aparece uma vez!)

---

### 2️⃣ Configurar Variável de Ambiente no Netlify (AMBOS OS SITES)

#### Para o site: **acaiecia.netlify.app**

1. Acesse: https://app.netlify.com/sites/acaiecia/settings/deploys
2. Vá em **"Environment variables"** ou **"Build & deploy → Environment"**
3. Clique em **"Add a variable"**
4. Configure:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: `cole_o_token_aqui`
   - **Scopes**: Marque **Functions** (importante!)
5. Clique em **"Create variable"**

#### Para o site: **acaiecia-julioadmin.netlify.app**

1. Acesse: https://app.netlify.com/sites/acaiecia-julioadmin/settings/deploys
2. Repita os mesmos passos acima
3. Configure a mesma variável `GITHUB_TOKEN`

---

### 3️⃣ Fazer Redeploy dos Sites

Após adicionar as variáveis, você precisa fazer redeploy:

1. Em cada site no Netlify, vá em **"Deploys"**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde o deploy terminar

---

### 4️⃣ Testar

1. Acesse o painel admin: https://acaiecia-julioadmin.netlify.app/dashboard.html
2. Faça uma alteração em um produto
3. Clique em **"Publicar no GitHub"**
4. Deve funcionar sem erro 403!

---

## 🔍 VERIFICAÇÃO RÁPIDA

⚠️ **ATENÇÃO**: Certifique-se de gerar um novo token completo com todas as permissões necessárias.

### Como verificar se o token tem permissões corretas:

```bash
# No terminal (substitua SEU_TOKEN pelo token completo)
curl -H "Authorization: Bearer SEU_TOKEN" https://api.github.com/user
```

Se retornar seus dados do GitHub, o token está válido.

Para testar permissões no repo:
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  https://api.github.com/repos/gabrielfavera07/acaiecia
```

---

## 📌 CHECKLIST

- [ ] Token gerado com permissão **repo**
- [ ] Token gerado com permissão **workflow**
- [ ] Variável `GITHUB_TOKEN` configurada em **acaiecia.netlify.app**
- [ ] Variável `GITHUB_TOKEN` configurada em **acaiecia-julioadmin.netlify.app**
- [ ] Scope **Functions** marcado em ambas variáveis
- [ ] Redeploy feito em ambos os sites
- [ ] Teste realizado com sucesso

---

## 🆘 TROUBLESHOOTING

### Se continuar dando erro 403:

1. **Verifique se o token tem todas as permissões** (especialmente "repo")
2. **Verifique se o scope "Functions" está marcado** na variável de ambiente
3. **Faça redeploy** depois de adicionar a variável
4. **Verifique se o repositório não é privado** sem permissões adequadas
5. **Tente gerar um novo token** do zero

### Se der erro "Token not configured":

- A variável `GITHUB_TOKEN` não foi configurada no Netlify
- Ou o scope "Functions" não foi marcado

### Se der erro "Resource not accessible":

- O token não tem a permissão "repo" completa
- Ou você não tem acesso de escrita ao repositório gabrielfavera07/acaiecia

---

## 🎯 RESUMO

O erro 403 ocorre porque:
1. O GitHub Token precisa da permissão **"repo"** para fazer commits
2. Essa permissão só pode ser dada criando um Personal Access Token
3. O token deve ser configurado como variável de ambiente **em ambos** os sites do Netlify
4. O scope **Functions** deve estar marcado

Após configurar corretamente, o fluxo será:
1. Usuário altera produtos no admin
2. Clica em "Publicar"
3. Frontend chama a Netlify Function
4. Function usa o GITHUB_TOKEN para fazer commit
5. GitHub recebe o commit
6. Netlify detecta mudança e faz deploy automático
7. Site atualiza em 10-20 segundos!
