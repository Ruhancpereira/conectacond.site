# Fazer deploy do site com seu autor (para o Vercel aceitar)

O Vercel pode exigir que o último commit tenha **você** como autor (sua conta GitHub). Se os commits foram feitos por outra ferramenta (ex.: Cursor/agent), siga os passos abaixo **no seu computador** para adicionar um commit com seu nome.

---

## Passo a passo (no seu terminal)

### 1. Clonar o repositório do site

```bash
cd ~
git clone https://github.com/Ruhancpereira/conectacond-site.git conectacond-site-deploy
cd conectacond-site-deploy
```

### 2. Garantir que seu Git está com seu nome e e-mail

```bash
git config user.name
git config user.email
```

Se não estiver correto (seu nome e o e-mail da conta GitHub):

```bash
git config user.name "Seu Nome"
git config user.email "seu-email@exemplo.com"
```

### 3. Criar um commit “vazio” com você como autor

Isso gera um novo commit na branch `main` com **você** como autor, sem mudar nenhum arquivo:

```bash
git commit --allow-empty -m "Deploy: atualizar site (trigger Vercel)"
git push origin main
```

### 4. No Vercel

- O Vercel deve detectar o push e iniciar um deploy automático, ou
- Vá em **Deployments** → no último deploy → **Redeploy** (agora o último commit é seu).

---

## Depois disso: como publicar novas alterações do site

Quando você alterar arquivos em **ConectaCond/site/** no projeto principal:

1. No projeto **ConectaCond** (raiz):
   ```bash
   git add site/
   git commit -m "Site: sua mensagem"
   git push origin main
   git subtree push --prefix=site site-repo main
   ```
   (O último comando envia a pasta `site` para o repositório conectacond-site.)

2. Os commits do `git subtree push` ainda podem aparecer com o autor da sua máquina local. Se o Vercel reclamar de novo, repita o passo 3 acima dentro do clone de **conectacond-site**: entre na pasta, rode `git pull`, depois `git commit --allow-empty -m "Deploy"` e `git push origin main`.

Ou use o **Deploy Hook** do Vercel (Settings → Git → Deploy Hooks): depois do `git subtree push`, chame a URL do hook com `curl -X POST "URL"` para disparar o deploy sem depender do autor do commit.
