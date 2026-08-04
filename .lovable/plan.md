# Reposicionamento da Comunidade YESOD

Transformar a plataforma atual (focada em pré-impressão, azul royal, menu horizontal) em uma comunidade de **automação e escala com IA**, com identidade azul marinho em degradê e navegação em sidebar.

## Identidade visual (nova)

- Paleta: fundo escuro #0A1128, azul marinho #0D1B2A, azul médio #1B3A6B, realce #2B5CB8, branco, cinza claro #F5F7FA. O azul royal atual (#2563EB) sai por completo.
- Gradientes `linear-gradient(135deg, #0A1128, #1B3A6B)` no hero e em cards de destaque.
- Tipografia: **Sora** para títulos (500–700, letter-spacing -0.02em) e **Inter** para corpo. Space Grotesk sai.
- Cards `rounded-2xl`, borda sutil, sombra difusa, hover com transição fluida e muito respiro.
- Logo YESOD em contêiner branco arredondado sobre fundo escuro.

## Navegação

- Sidebar fixa à esquerda: logo no topo + Início, Comunidade, Projetos, Serviços, Produtos, Área de membros, Contato.
- No mobile, vira menu hambúrguer retrátil (drawer). O menu horizontal atual é removido.
- Botão flutuante de WhatsApp e rodapé completo em todas as páginas.
- WhatsApp: +55 11 93413-6614 em todas as mensagens pré-preenchidas.

## Páginas

1. **Início** (`/`) — hero "Bem-vindo à Comunidade YESOD" com proposta de automação e escala com IA; "O que você encontra aqui" (Novidades, Projetos, Conteúdo exclusivo, Área de membros); prova social "+X membros"; visão geral dos produtos; 3 depoimentos placeholder; FAQ em acordeão com as 5 perguntas pedidas.
2. **Comunidade** (`/comunidade`) — o feed atual migra para esta rota, com categorias **Novidades, Automação, Projetos, Ofertas**, curtidas e comentários para logados, e "Publicar novidade" só para admin.
3. **Projetos** (`/projetos`) — cards com nome, o que automatiza, resultado, categoria (Automação Gráfica, Automação Comercial, IA Aplicada) e imagem placeholder em degradê. Pré-impressão entra como um case entre outros, sem destaque.
4. **Serviços** (`/servicos`) — Consultoria em automação, Soluções com IA, Integração de sistemas e APIs, Operação em escala, Suporte e evolução contínua + CTA "Falar com a YESOD".
5. **Produtos** (`/produtos`) — substitui Planos. Cards configuráveis (nome, descrição, recursos, preço, disponibilidade) definidos em uma lista no código, fácil de editar depois; preço sempre "Preço a definir"; botão abre WhatsApp com mensagem pré-preenchida. A rota `/planos` é removida.
6. **Área de membros** — `/auth` (cadastro/login e-mail + senha) e `/meu-espaco` protegido, com perfil (nome, empresa), conteúdo exclusivo e botão "Sair". `yesod.auto@gmail.com` recebe papel de admin.
7. **Contato** (`/contato`) — botão grande de WhatsApp, formulário (nome, e-mail, mensagem) que abre o WhatsApp preenchido e dados da empresa.

Cada página com título e meta description próprios; 404 já existente é reestilizada na nova identidade; favicon com a logo.

## Detalhes técnicos

- `src/styles.css`: novos tokens oklch da paleta marinho, gradientes, sombras suaves; fonte Sora + Inter carregadas via `<link>` no `__root.tsx`.
- Novo `src/components/layout/Sidebar.tsx` (shadcn sidebar ou implementação própria com drawer mobile); `Navbar.tsx` é removido; `__root.tsx` passa a usar layout com sidebar + `<Outlet />`.
- `src/lib/yesod.ts`: número real do WhatsApp, novas categorias do feed, lista `PRODUCTS` e conteúdo dos projetos.
- Rotas: `feed.tsx` → `comunidade.tsx`, `planos.tsx` → `produtos.tsx`, textos de `index.tsx`, `servicos.tsx`, `projetos.tsx` reescritos.
- Banco: sem mudança de schema. O papel admin de `yesod.auto@gmail.com` é atribuído em `user_roles` — só funciona depois que essa conta existir; se ela ainda não foi criada, aviso ao final para você cadastrar e então eu insiro o papel.
- Validação: build/typecheck e verificação visual da sidebar e do hero no preview.
