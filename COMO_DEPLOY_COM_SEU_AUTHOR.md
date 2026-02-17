# Deploy com seu nome (para o Vercel aceitar)

O Vercel exige que o **autor do commit** seja uma conta GitHub reconhecida. Por isso o push para o repositório do site (**conectacond.site**) deve ser feito **no seu terminal**, no seu computador.

---

## O que fazer

1. No projeto **ConectaCond**, na pasta raiz, rode no **seu** terminal:
   ```bash
   ./scripts/deploy-site.sh
   ```
   Ou:
   ```bash
   git subtree push --prefix=site vercel-repo main
   ```

2. O Git usará o **seu** `user.name` e `user.email`; os commits no **conectacond.site** ficarão com seu nome e o Vercel aceitará o deploy.

3. No Vercel, conecte o projeto ao repositório **conectacond.site** (Settings → Git). Root Directory em branco.

---

## Conferir seu autor no Git

```bash
git config user.name
git config user.email
```

O e-mail deve ser um que esteja **vinculado à sua conta GitHub** (em github.com → Settings → Emails). Se precisar alterar:

```bash
git config user.name "Seu Nome"
git config user.email "seu-email@github.com"
```
