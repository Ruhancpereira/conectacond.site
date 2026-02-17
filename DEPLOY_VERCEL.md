# Publicar o site no Vercel (conectacond.site)

O site é publicado a partir do repositório **conectacond.site**. Para o Vercel aceitar o deploy, os commits precisam ter **você** como autor (sua conta GitHub). Por isso, o push deve ser feito **no seu computador**, no seu terminal.

---

## Repositório usado no Vercel

- **GitHub:** [Ruhancpereira/conectacond.site](https://github.com/Ruhancpereira/conectacond.site)
- **Remote no projeto:** `vercel-repo`

No Vercel, conecte o projeto ao repositório **conectacond.site** (não conectacond-site com hífen). Root Directory em branco.

---

## Como publicar (sempre no SEU terminal)

Na **raiz do projeto ConectaCond** (pasta onde está `site/`, `conectaCondFlutter/`, etc.):

```bash
# 1. Garantir que está tudo commitado no ConectaCond
git status

# 2. Enviar a pasta site/ para conectacond.site (autor = você)
./scripts/deploy-site.sh
```

Ou manualmente:

```bash
git subtree push --prefix=site vercel-repo main
```

Como o comando roda no **seu** terminal, o Git usa o **seu** `user.name` e `user.email`; os commits no conectacond.site ficam com seu nome e o Vercel aceita.

---

## Quando alterar o site

1. Edite os arquivos em **ConectaCond/site/**.
2. No projeto ConectaCond:
   ```bash
   git add site/
   git commit -m "Site: descrição da alteração"
   git push origin main
   ```
3. **No seu terminal**, publique no conectacond.site:
   ```bash
   ./scripts/deploy-site.sh
   ```
4. O Vercel faz o deploy (automático ao detectar o push, ou use Deploy Hook se configurou).

---

## Deploy Hook (opcional)

No Vercel: **Settings** → **Git** → **Deploy Hooks** → crie um hook e copie a URL. Depois:

```bash
export VERCEL_DEPLOY_HOOK="https://api.vercel.com/v1/integrations/deploy/..."
./scripts/deploy-site.sh
```

O script fará o push e em seguida disparará o deploy no Vercel.
