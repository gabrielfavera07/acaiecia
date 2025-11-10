# ⚡ FAZER AGORA - 3 PASSOS

## ✅ O que já está pronto:
- Todas as Netlify Functions foram enviadas para o GitHub
- netlify.toml configurado
- JSON com 1 inscrito já cadastrado
- Netlify está fazendo deploy agora (~1-2 minutos)

---

## 🚨 VOCÊ PRECISA FAZER 3 COISAS:

### 1️⃣ Configurar Variáveis de Ambiente - Site Principal

Acesse: **https://app.netlify.com/sites/acaiecia/settings/deploys#environment**

Clique em **"Add a variable"** e adicione estas 3 variáveis:

```
Nome: VAPID_PUBLIC_KEY
Valor: BACihuFGt0HxEbRJVZkcU5wdwoUFaaFlVPhgA-57ruT7VuojMh4rcKPkXyn3wYOMKuvuJDZum0b9GvNNPJEgXMs
```

```
Nome: VAPID_PRIVATE_KEY
Valor: DyOCHdLbV_7CMU-YoLpkyVQ4Jy-0kKQhIU5Xmge9KKA
```

```
Nome: GITHUB_TOKEN
Valor: [SEU TOKEN DO GITHUB]
```

> 💡 **Para pegar o GITHUB_TOKEN:**
> 1. Vá em: https://github.com/settings/tokens
> 2. Clique em "Generate new token (classic)"
> 3. Marque o scope "repo"
> 4. Copie o token

---

### 2️⃣ Configurar Variáveis de Ambiente - Painel Admin

Acesse: **https://app.netlify.com/sites/acaiecia-julio-admin/settings/deploys#environment**

Adicione as **MESMAS 3 VARIÁVEIS** acima (copie e cole os mesmos valores)

---

### 3️⃣ Aguardar e Testar

1. **Aguarde 2-3 minutos** para o Netlify fazer deploy
2. Acesse: https://acaiecia-julioadmin.netlify.app
3. Clique no card "1 Inscritos em Notificações"
4. Preencha e envie uma notificação de teste
5. **SE DER ERRO 404**: Aguarde mais 1 minuto e tente novamente

---

## 🎯 RESUMO DO QUE FAZER:

- [ ] Adicionar 3 variáveis no site principal (acaiecia)
- [ ] Adicionar 3 variáveis no painel admin (acaiecia-julio-admin)
- [ ] Gerar GITHUB_TOKEN em: https://github.com/settings/tokens
- [ ] Aguardar 2-3 minutos
- [ ] Testar envio de notificação

---

## ⚠️ IMPORTANTE:

**As Netlify Functions SÓ vão funcionar DEPOIS que você configurar as variáveis de ambiente!**

Sem as variáveis, elas vão retornar erro 500 (não 404).

Quando o 404 virar 500 = significa que o deploy aconteceu mas faltam as variáveis.

Quando funcionar = você verá "✅ X notificações enviadas com sucesso!"

---

**🚀 É ISSO! Só configurar as variáveis e está PRONTO!**
