# Yesod Hub

Crie uma plataforma de comunidade para a marca YESOD (automação para o setor gráfico), inspirada em comunidades como lucasmoreira.ai. NÃO é landing page — é um hub de conteúdo e interação com login de membros e planos. Construa TUDO de uma vez:

IDENTIDADE: paleta azul royal #2563EB, branco #FFFFFF, grafite #1A1A1A, cinza claro #F5F7FA; tipografia Space Grotesk (títulos) e Inter (textos); logo Yesod_Normal_Logo.png (em fundo escuro, colocar dentro de contêiner branco arredondado).

PÁGINAS (crie todas):

1. Home — hero acolhedor "Bem-vindo à Comunidade YESOD", seção "O que você encontra aqui" (Novidades, Vitrine de projetos, Serviços, Área exclusiva), prova social "+X membros" (placeholder), visão geral dos planos, depoimentos placeholder, FAQ com 5 perguntas (O que é pré-impressão? Como envio meu arquivo? Quais formatos são aceitos? Como funciona o relatório de preflight? Posso cancelar o plano?)

2. Feed — posts do administrador (título, autor, data, categoria, conteúdo, imagem opcional) no Supabase, ordenados do mais recente, com curtidas e comentários para usuários logados, filtro por categoria (Novidades, Dicas de pré-impressão, Projetos, Ofertas), campo "Publicar" só para o admin

3. Serviços — 6 cards: Análise Inteligente, Correção Automática, Relatório de Preflight, Painel Interativo, Integrações com RIPs, IA Explicativa

4. Projetos — galeria de 4 cases (cartão de visita, folder, revista/catálogo, embalagem com faca) com placeholder de imagem (gradiente elegante, substituível depois)

5. Planos — ESTRUTURA com 4 cards (Iniciante, "Mais popular" em destaque, Avançado, Sob consulta), cada um com lista de recursos genéricos e o texto "Preço a definir" no lugar do valor. NENHUM valor em reais. Botão "Começar agora" abre WhatsApp com mensagem pré-preenchida

6. Área de membros — cadastro/login via Supabase (e-mail + senha), página "Meu espaço" com perfil (nome, empresa), conteúdo exclusivo, proteção de rota, botão "Sair"

7. Contato — WhatsApp como canal principal, formulário que abre o WhatsApp preenchido, informações da empresa

EXTRAS: navegação fixa com logo, botão flutuante de WhatsApp em todas as páginas, rodapé completo, 100% português, responsivo mobile-first. Conecte ao Supabase existente para autenticação e dados.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b346e8fa-20b7-4409-992c-ad986ea390de).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
