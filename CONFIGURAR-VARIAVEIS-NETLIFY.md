# Configurar Variáveis de Ambiente no Netlify

## Status Atual
- ✅ Todas as Netlify Functions foram enviadas para o GitHub
- ✅ JSON com push_subscriptions está atualizado (4 inscritos)
- ✅ VAPID keys já foram geradas
- ⏳ Aguardando deploy automático do Netlify (~1-2 minutos)
- ⚠️ **FALTA**: Configurar variáveis de ambiente

---

## 📋 Variáveis que Precisam Ser Configuradas

Você precisa adicionar estas 3 variáveis de ambiente **NOS DOIS SITES** do Netlify:
1. **acaiecia** (site principal)
2. **acaiecia-julio-admin** (painel admin)

### Variáveis:

```
VAPID_PUBLIC_KEY=BACihuFGt0HxEbRJVZkcU5wdwoUFaaFlVPhgA-57ruT7VuojMh4rcKPkXyn3wYOMKuvuJDZum0b9GvNNPJEgXMs

VAPID_PRIVATE_KEY=DyOCHdLbV_7CMU-YoLpkyVQ4Jy-0kKQhIU5Xmge9KKA

GITHUB_TOKEN=seu_github_token_aqui
```

> ⚠️ **IMPORTANTE**: O `GITHUB_TOKEN` você precisa pegar do GitHub Settings > Tokens

---

## 🔧 Como Configurar no Netlify

### Para o Site Principal (acaiecia):

1. Acesse: https://app.netlify.com/sites/acaiecia/settings/deploys#environment
2. Vá em **Environment variables**
3. Clique em **Add a variable**
4. Adicione cada variável:
   - Nome: `VAPID_PUBLIC_KEY`
   - Valor: `BACihuFGt0HxEbRJVZkcU5wdwoUFaaFlVPhgA-57ruT7VuojMh4rcKPkXyn3wYOMKuvuJDZum0b9GvNNPJEgXMs`

5. Repita para `VAPID_PRIVATE_KEY` e `GITHUB_TOKEN`
6. Clique em **Save**

### Para o Painel Admin (acaiecia-julio-admin):

1. Acesse: https://app.netlify.com/sites/acaiecia-julio-admin/settings/deploys#environment
2. Repita o mesmo processo acima
3. Adicione as mesmas 3 variáveis

---

## 🚀 Após Configurar

1. **Não é necessário fazer novo deploy** - as variáveis serão aplicadas automaticamente
2. Aguarde ~30 segundos para as funções reiniciarem
3. Teste enviando uma notificação pelo painel admin!

---

## 📱 Testando o Sistema

1. Acesse o site principal: https://acaiecia.netlify.app
2. Clique no sino (🔔) para permitir notificações
3. Vá para o painel admin: https://acaiecia-julio-admin.netlify.app
4. Na dashboard, você verá "4 Inscritos em Notificações" (ou mais)
5. Clique no card de notificações
6. Preencha título, mensagem e envie!

---

## ✅ Checklist Final

- [ ] Configurar `VAPID_PUBLIC_KEY` no site principal
- [ ] Configurar `VAPID_PRIVATE_KEY` no site principal
- [ ] Configurar `GITHUB_TOKEN` no site principal
- [ ] Configurar `VAPID_PUBLIC_KEY` no painel admin
- [ ] Configurar `VAPID_PRIVATE_KEY` no painel admin
- [ ] Configurar `GITHUB_TOKEN` no painel admin
- [ ] Aguardar ~1 minuto para deploy completar
- [ ] Testar envio de notificação

---

## 🔑 Onde Pegar o GITHUB_TOKEN

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Dê um nome: "Netlify Functions - Notificações"
4. Selecione os scopes:
   - `repo` (acesso completo ao repositório)
5. Clique em **Generate token**
6. **COPIE O TOKEN IMEDIATAMENTE** (não será mostrado novamente)
7. Cole nas variáveis de ambiente do Netlify

---

## 🎉 Sistema Completo!

Após configurar tudo, seu sistema de notificações push estará 100% funcional:

- ✅ Usuários podem se inscrever pelo site
- ✅ Subscriptions são salvas automaticamente no GitHub
- ✅ Admin vê o número de inscritos em tempo real
- ✅ Admin pode enviar notificações com título, mensagem, imagem e URL
- ✅ Notificações chegam no celular/desktop dos usuários
- ✅ Funciona em iOS, Android e Desktop (via PWA)

**🚀 Agora é só aproveitar o sistema!**
