# ConectaCond – Site e Painel Administrativo

Um único app (React + Vite) que serve:

- **`/`** – Landing (institucional, funcionalidades, contato)
- **`/system/login`** – Login do painel administrativo
- **`/system/licenses`**, **`/system/condos`**, etc. – Área logada (gestão de licenças)

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

Saída em `dist/`.

## Deploy (Vercel)

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Variáveis de ambiente:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Configurar no Supabase (Authentication → URL Configuration) a **Site URL** e **Redirect URLs** do domínio onde o app está publicado (ex.: `https://conectacond.com` e `https://conectacond.com/**`).
