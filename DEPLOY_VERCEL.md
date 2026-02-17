# Publicar o site no Vercel (repositório separado)

Como o Vercel às vezes não lista a pasta `site` no seletor de Root Directory, use um **repositório só para o site**. O conteúdo de `site/` fica na **raiz** desse repo, então no Vercel você deixa Root Directory em branco (raiz).

---

## 1. Criar o repositório no GitHub

1. Acesse [github.com/new](https://github.com/new).
2. Nome sugerido: **conectacond-site** (ou conectacond-landing).
3. Deixe **vazio** (sem README, sem .gitignore).
4. Clique em **Create repository**.

---

## 2. Enviar a pasta `site` para esse repositório

No terminal, na **raiz do projeto ConectaCond** (não dentro de `site/`):

```bash
# Adicionar o novo repositório como remote (troque pelo seu usuário/repo se for diferente)
git remote add site-repo https://github.com/Ruhancpereira/conectacond-site.git

# Enviar só a pasta site como raiz do repositório site-repo
git subtree push --prefix=site site-repo main
```

Se você usar SSH:

```bash
git remote add site-repo git@github.com:Ruhancpereira/conectacond-site.git
git subtree push --prefix=site site-repo main
```

Pronto: o repositório **conectacond-site** passa a ter na raiz os arquivos que estão em `site/` (index.html, privacidade.html, css/, assets/).

---

## 3. Conectar no Vercel

1. Vercel → **Add New…** → **Project**.
2. Importe o repositório **conectacond-site**.
3. **Root Directory**: deixe em branco (raiz).
4. **Deploy**.

---

## 4. Quando atualizar o site

Sempre que você alterar arquivos dentro de `site/` no ConectaCond e der push no **conectacond** (main), atualize o repositório do site com:

```bash
git subtree push --prefix=site site-repo main
```

Assim o Vercel pode fazer um novo deploy (automático, se o deploy estiver ligado ao repo conectacond-site).

---

## Resumo

| Repositório        | Conteúdo                          | Uso                    |
|--------------------|-----------------------------------|------------------------|
| conectacond        | Projeto inteiro (app, docs, site) | Desenvolvimento        |
| conectacond-site   | Só o site (raiz = pasta site)     | Vercel (deploy do site)|
