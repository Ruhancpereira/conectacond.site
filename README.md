# Site comercial – ConectaCond

Site institucional/comercial do aplicativo ConectaCond. Inspirado em layout moderno (estilo Karuso), com cores oficiais: **azul #0175C2** e **cinza escuro #1a202c**.

## Estrutura

- **index.html** – Página inicial (hero, funcionalidades, sobre, contato)
- **privacidade.html** – Política de Privacidade (LGPD)
- **css/style.css** – Estilos globais
- **assets/conectacond-logo.png** – Logo do ConectaCond

## Como visualizar

Abra `index.html` no navegador (duplo clique ou servidor local). Para servir com um servidor local:

```bash
cd site
python3 -m http.server 8000
# Acesse http://localhost:8000
```

## Publicação

Basta fazer upload da pasta `site/` (ou apenas os arquivos estáticos) para qualquer hospedagem estática (GitHub Pages, Netlify, Vercel, etc.). A URL da Política de Privacidade pode ser usada no app e nas lojas.
