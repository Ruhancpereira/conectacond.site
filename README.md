# ConectaCond – Painel Administrativo

App React (Vite) do painel administrativo: gestão de licenças, condomínios, etc. A rota `/` redireciona para `/system/login`. Em produção o app é servido em **/portal** (base: `/portal/`).

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em [http://localhost:8080](http://localhost:8080).

## Build

```bash
npm run build
```

Saída em `dist/`. Em produção usa `base: '/portal/'`.

## Deploy (Vercel)

- **Root Directory:** `Portal` (se o repositório for o ConectaCond completo) ou vazio (se o repositório for só o conteúdo do Portal na raiz).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Variáveis de ambiente:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

No Supabase (Authentication → URL Configuration): **Site URL** e **Redirect URLs** com a URL do Portal (ex.: `https://conectacond.com/portal` e `https://conectacond.com/portal/**`).
