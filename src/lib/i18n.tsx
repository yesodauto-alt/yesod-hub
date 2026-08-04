import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const LANGUAGES = ["pt", "en", "es"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANG_LABELS: Record<Lang, string> = { pt: "PT", en: "EN", es: "ES" };
export const LANG_NAMES: Record<Lang, string> = {
  pt: "Português (Brasil)",
  en: "English",
  es: "Español",
};
export const HTML_LANG: Record<Lang, string> = { pt: "pt-BR", en: "en", es: "es" };
export const LOCALES: Record<Lang, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

const STORAGE_KEY = "yesod-lang";

/** Multilingual value coming from the database (JSONB). */
export type Multilingual = Partial<Record<Lang, string>>;

export function pickLang(value: unknown, lang: Lang): string {
  if (!value || typeof value !== "object") return typeof value === "string" ? value : "";
  const record = value as Record<string, unknown>;
  const order: Lang[] = [lang, "pt", "en", "es"];
  for (const key of order) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return "";
}

const pt = {
  "brand.hub": "Yesod HUB",
  "brand.tagline": "Automação e escala com inteligência artificial",

  "nav.home": "Início",
  "nav.hub": "Yesod HUB",
  "nav.projects": "Projetos",
  "nav.services": "Serviços",
  "nav.products": "Produtos",
  "nav.members": "Área de membros",
  "nav.contact": "Contato",
  "nav.navigation": "Navegação",
  "nav.openMenu": "Abrir menu",
  "nav.closeMenu": "Fechar menu",
  "nav.mySpace": "Meu espaço",
  "nav.signup": "Criar conta",
  "nav.signin": "Entrar",
  "nav.language": "Idioma",

  "common.loading": "Carregando…",
  "common.save": "Salvar alterações",
  "common.saving": "Salvando…",
  "common.cancel": "Cancelar",
  "common.delete": "Excluir",
  "common.edit": "Editar",
  "common.create": "Criar",
  "common.back": "Voltar",
  "common.share": "Compartilhar",
  "common.linkCopied": "Link copiado!",
  "common.talkToYesod": "Falar com a YESOD",
  "common.error": "Algo deu errado. Tente novamente.",
  "common.required": "Campo obrigatório.",
  "common.optional": "opcional",
  "common.remove": "Remover",
  "common.yes": "Sim",
  "common.no": "Não",
  "common.preview": "Pré-visualizar",
  "common.published": "Publicado",
  "common.draft": "Rascunho",

  "home.heroTitle": "Bem-vindo ao Yesod HUB",
  "home.heroText":
    "A YESOD transforma processos manuais e repetitivos em operações automatizadas, escaláveis e precisas com inteligência artificial. Aqui você acompanha esse trabalho de perto: conteúdo, projetos reais e um espaço exclusivo para membros.",
  "home.ctaJoin": "Entrar no Yesod HUB",
  "home.ctaSee": "Ver o Yesod HUB",
  "home.pillarsTitle": "O que você encontra aqui",
  "home.pillarsText": "Quatro frentes para acompanhar a automação inteligente na prática.",
  "home.pillar.news": "Novidades",
  "home.pillar.newsText":
    "O que está sendo construído na YESOD e no universo da automação com IA, direto no feed.",
  "home.pillar.projects": "Projetos",
  "home.pillar.projectsText":
    "Automações reais em operação, com o que cada uma automatiza e o resultado alcançado.",
  "home.pillar.exclusive": "Conteúdo exclusivo",
  "home.pillar.exclusiveText":
    "Materiais, dicas e novidades em primeira mão liberados apenas para membros.",
  "home.pillar.members": "Área de membros",
  "home.pillar.membersText":
    "Seu espaço com perfil, acompanhamento e acesso ao que é exclusivo do Yesod HUB.",
  "home.productsTitle": "Nossas soluções",
  "home.productsText":
    "Formatos de trabalho configuráveis, do diagnóstico inicial à operação em escala.",
  "home.seeProducts": "Ver soluções",
  "home.founderTitle": "Quem está por trás da YESOD",
  "home.testimonialsTitle": "O que dizem os membros",
  "home.testimonialsText": "Espaços reservados para depoimentos reais do Yesod HUB.",
  "home.testimonialQuote": "“Espaço reservado para o depoimento de um membro do Yesod HUB.”",
  "home.testimonialName": "Nome do membro",
  "home.testimonialRole": "Cargo · Empresa",
  "home.faqTitle": "Perguntas frequentes",
  "home.finalTitle": "Pronto para automatizar sua operação?",
  "home.finalText":
    "Conte qual rotina consome mais tempo do seu time e a gente mostra por onde começar.",

  "faq.q1": "O que a YESOD faz?",
  "faq.a1":
    "A YESOD transforma processos manuais e repetitivos em operações automatizadas, escaláveis e precisas. Unimos automação de fluxos, integração de sistemas e inteligência artificial para que o time cuide de decisão, não de tarefa repetida.",
  "faq.q2": "Como funciona a automação com IA?",
  "faq.a2":
    "Começamos entendendo o processo como ele é hoje. Depois desenhamos o fluxo automatizado e aplicamos IA nos pontos em que ela realmente ajuda: leitura de documentos, classificação, geração de conteúdo e apoio à decisão. Tudo com validação humana onde é necessário.",
  "faq.q3": "Quais projetos existem?",
  "faq.a3":
    "Há automações em áreas diferentes: gráfica (incluindo pré-impressão), comercial, dados e IA aplicada a documentos. A página Projetos mostra o que cada uma automatiza e o resultado alcançado.",
  "faq.q4": "Como acesso a área de membros?",
  "faq.a4":
    "Crie sua conta com e-mail e senha e entre em Área de membros. Lá ficam seu perfil, o conteúdo exclusivo e as novidades em primeira mão do Yesod HUB.",
  "faq.q5": "Posso encerrar quando quiser?",
  "faq.a5":
    "Sim. Não há fidelidade: você pode sair ou ajustar o que contratou falando com a equipe pelo WhatsApp.",

  "hub.title": "Yesod HUB",
  "hub.subtitle": "Novidades, automação, projetos e ofertas publicados pela equipe YESOD.",
  "hub.all": "Todas",
  "hub.cat.Novidades": "Novidades",
  "hub.cat.Automação": "Automação",
  "hub.cat.Projetos": "Projetos",
  "hub.cat.Ofertas": "Ofertas",
  "hub.loadingPosts": "Carregando publicações…",
  "hub.loadError": "Não foi possível carregar as publicações.",
  "hub.empty": "Ainda não há publicações nesta categoria.",
  "hub.signInBanner": "Entre na sua conta para curtir e comentar as publicações.",
  "hub.signInLink": "Entrar ou criar conta",
  "hub.noComments": "Nenhum comentário ainda.",
  "hub.commentPlaceholder": "Escreva um comentário…",
  "hub.sendComment": "Enviar comentário",
  "hub.signInToComment": "para comentar.",
  "hub.signIn": "Entre",
  "hub.needAuthLike": "Entre na sua conta para curtir.",
  "hub.needAuthComment": "Entre na sua conta para comentar.",
  "hub.composerTitle": "Publicar (administrador)",
  "hub.postTitle": "Título",
  "hub.postCategory": "Categoria",
  "hub.postContent": "Conteúdo",
  "hub.postImage": "URL da imagem (opcional)",
  "hub.publish": "Publicar",
  "hub.publishing": "Publicando…",
  "hub.published": "Publicação criada!",

  "services.title": "Serviços",
  "services.subtitle":
    "O que a YESOD entrega como empresa de automação e escala com inteligência artificial.",
  "services.s1": "Consultoria em automação de processos",
  "services.s1Text":
    "Mapeamos como sua operação funciona hoje, identificamos o que é repetitivo e desenhamos o caminho para automatizar com prioridade por impacto.",
  "services.s2": "Desenvolvimento de soluções com IA",
  "services.s2Text":
    "Construímos soluções que aplicam inteligência artificial onde ela realmente resolve: leitura de documentos, classificação, geração de conteúdo e apoio à decisão.",
  "services.s3": "Integração de sistemas e APIs",
  "services.s3Text":
    "Conectamos as ferramentas que você já usa para que os dados circulem entre elas sem digitação manual e sem planilhas intermediárias.",
  "services.s4": "Operação em escala",
  "services.s4Text":
    "Automações preparadas para volume: menos tempo por tarefa, menos custo por operação e resultado previsível mesmo em picos de demanda.",
  "services.s5": "Suporte e evolução contínua",
  "services.s5Text":
    "Acompanhamento após a entrega, com monitoramento, ajustes e novas melhorias conforme o negócio muda.",
  "services.ctaTitle": "Vamos olhar o seu processo juntos?",
  "services.ctaText":
    "Conte qual rotina consome mais tempo do seu time e a gente mostra por onde começar.",

  "products.title": "Soluções",
  "products.subtitle":
    "Cada solução é um formato de trabalho configurável, desenhado a partir da realidade da sua operação. O escopo é definido em conversa com a equipe.",
  "products.featured": "Mais procurado",
  "products.cta": "Quero conversar sobre isso",

  "product.diagnostic.name": "Diagnóstico de Automação",
  "product.diagnostic.desc":
    "Mapeamento dos processos manuais da sua operação e um plano claro do que pode ser automatizado primeiro.",
  "product.diagnostic.f1": "Mapeamento de processos",
  "product.diagnostic.f2": "Priorização por impacto",
  "product.diagnostic.f3": "Relatório com plano de ação",
  "product.diagnostic.f4": "Reunião de devolutiva",
  "product.custom.name": "Automação Sob Medida",
  "product.custom.desc":
    "Construção de fluxos automatizados para as rotinas repetitivas do seu time, com IA onde faz sentido.",
  "product.custom.f1": "Escopo desenhado com você",
  "product.custom.f2": "Automação de rotinas repetitivas",
  "product.custom.f3": "IA aplicada a decisões e leitura de dados",
  "product.custom.f4": "Acompanhamento durante a implantação",
  "product.integrations.name": "Integrações e APIs",
  "product.integrations.desc":
    "Conexão entre os sistemas que você já usa, para que os dados circulem sem digitação manual.",
  "product.integrations.f1": "Integração entre sistemas internos",
  "product.integrations.f2": "Conexão com APIs de terceiros",
  "product.integrations.f3": "Sincronização de dados",
  "product.integrations.f4": "Monitoramento de falhas",
  "product.scale.name": "Operação em Escala",
  "product.scale.desc":
    "Acompanhamento contínuo da sua operação automatizada, com evolução e suporte da equipe YESOD.",
  "product.scale.f1": "Suporte contínuo",
  "product.scale.f2": "Ajustes e melhorias periódicas",
  "product.scale.f3": "Painel de acompanhamento",
  "product.scale.f4": "Conteúdo exclusivo do Yesod HUB",

  "projects.title": "Projetos",
  "projects.subtitle":
    "Uma vitrine das automações que a YESOD constrói e mantém em operação, em áreas diferentes do negócio.",
  "projects.view": "Ver projeto",
  "projects.openDemo": "Abrir demonstração",
  "projects.talk": "Falar sobre este projeto",
  "projects.empty": "Novos projetos serão publicados em breve.",
  "projects.loading": "Carregando projetos…",
  "projects.notFound": "Projeto não encontrado.",
  "projects.backToList": "Voltar para projetos",
  "projects.context": "Contexto",
  "projects.automation": "O que foi automatizado",
  "projects.solution": "Solução aplicada",
  "projects.result": "Resultado",
  "projects.gallery": "Galeria",

  "contact.title": "Contato",
  "contact.subtitle":
    "O WhatsApp é o canal principal da YESOD. Fale direto com a equipe ou preencha o formulário — ele monta a mensagem e abre a conversa para você.",
  "contact.whatsappTitle": "Fale no WhatsApp",
  "contact.whatsappText":
    "Resposta rápida em horário comercial. Conte qual rotina consome o tempo do seu time.",
  "contact.openWhatsapp": "Abrir conversa no WhatsApp",
  "contact.hours": "Seg a sex, 9h às 18h (horário de Brasília)",
  "contact.remote": "Atendimento 100% remoto — Brasil",
  "contact.formTitle": "Prefere escrever antes?",
  "contact.formText": "Ao enviar, o WhatsApp abre com a mensagem já preenchida.",
  "contact.name": "Seu nome",
  "contact.namePlaceholder": "Como podemos te chamar?",
  "contact.company": "Empresa",
  "contact.companyPlaceholder": "Nome da sua empresa",
  "contact.process": "Processo que quer automatizar",
  "contact.processPlaceholder": "Ex.: orçamentos, conferência de arquivos, relatórios",
  "contact.message": "Mensagem",
  "contact.messagePlaceholder": "Conte um pouco sobre o seu cenário atual.",
  "contact.submit": "Enviar pelo WhatsApp",

  "auth.signupTitle": "Criar sua conta",
  "auth.loginTitle": "Entrar no Yesod HUB",
  "auth.subtitle": "Acesso ao feed, conteúdo exclusivo e suporte da YESOD.",
  "auth.fullName": "Nome completo",
  "auth.company": "Empresa",
  "auth.email": "E-mail",
  "auth.password": "Senha",
  "auth.wait": "Aguarde…",
  "auth.createAccount": "Criar conta",
  "auth.signin": "Entrar",
  "auth.haveAccount": "Já tenho conta — quero entrar",
  "auth.noAccount": "Ainda não tenho conta — quero me cadastrar",
  "auth.created": "Conta criada! Bem-vindo ao Yesod HUB.",
  "auth.confirmEmail": "Conta criada! Confirme seu e-mail para acessar.",
  "auth.welcomeBack": "Bem-vindo de volta!",
  "auth.failed": "Não foi possível continuar.",

  "space.title": "Meu espaço",
  "space.signOut": "Sair",
  "space.profileTitle": "Meu perfil profissional",
  "space.photo": "Foto de perfil",
  "space.uploadPhoto": "Enviar foto",
  "space.changePhoto": "Trocar foto",
  "space.removePhoto": "Remover foto",
  "space.photoHint": "Imagem JPG, PNG ou WEBP de até 5 MB.",
  "space.photoInvalidType": "Selecione um arquivo de imagem.",
  "space.photoTooLarge": "A imagem deve ter no máximo 5 MB.",
  "space.name": "Nome",
  "space.phone": "Telefone",
  "space.phonePlaceholder": "+55 11 90000-0000",
  "space.phoneInvalid": "Informe um telefone válido.",
  "space.accountType": "Tipo de conta",
  "space.individual": "Pessoa física",
  "space.companyType": "Empresa",
  "space.companyName": "Nome da empresa",
  "space.employees": "Quantidade de funcionários",
  "space.employeesInvalid": "Informe pelo menos 1 funcionário.",
  "space.goal": "Seu principal objetivo no Yesod HUB",
  "space.goalPlaceholder": "Ex.: automatizar a conferência de arquivos e reduzir retrabalho.",
  "space.newsletter": "Quero receber novidades e conteúdos da YESOD por e-mail",
  "space.saved": "Perfil atualizado!",
  "space.exclusiveTitle": "Conteúdo exclusivo",
  "space.exclusiveText": "Materiais disponíveis apenas para membros do Yesod HUB.",
  "space.ex1": "Guia de automação YESOD",
  "space.ex1Text":
    "Como identificar processos repetitivos e priorizar o que automatizar primeiro.",
  "space.ex2": "Receitas de integração",
  "space.ex2Text": "Padrões prontos para conectar sistemas e APIs sem digitação manual.",
  "space.ex3": "Trilha de IA aplicada",
  "space.ex3Text": "Materiais de estudo para usar inteligência artificial na rotina da operação.",
  "space.adminTitle": "Administração",
  "space.manageProjects": "Gerenciar projetos",
  "space.manageProjectsText": "Criar, editar, ordenar e publicar os projetos da vitrine.",
  "space.manageSite": "Configurações do site",
  "space.manageSiteText": "Foto e textos institucionais da fundadora exibidos na Home.",

  "admin.projects.title": "Gerenciar projetos",
  "admin.projects.new": "Novo projeto",
  "admin.projects.slug": "Slug (URL)",
  "admin.projects.cover": "Imagem de capa",
  "admin.projects.galleryUpload": "Adicionar à galeria",
  "admin.projects.interaction": "Ação do card",
  "admin.projects.interactionDetails": "Abrir página de detalhes",
  "admin.projects.interactionDemo": "Abrir link externo",
  "admin.projects.interactionWhatsapp": "Abrir WhatsApp",
  "admin.projects.interactionLabel": "Texto do botão",
  "admin.projects.interactionUrl": "URL externa",
  "admin.projects.sortOrder": "Ordem",
  "admin.projects.publishedField": "Publicado",
  "admin.projects.projectTitle": "Título",
  "admin.projects.category": "Categoria",
  "admin.projects.summary": "Resumo",
  "admin.projects.context": "Problema / contexto",
  "admin.projects.automation": "O que foi automatizado",
  "admin.projects.solution": "Solução aplicada",
  "admin.projects.result": "Resultado",
  "admin.projects.content": "Conteúdo detalhado",
  "admin.projects.saved": "Projeto salvo!",
  "admin.projects.deleted": "Projeto excluído.",
  "admin.projects.confirmDelete": "Excluir este projeto definitivamente?",
  "admin.projects.empty": "Nenhum projeto cadastrado ainda.",
  "admin.projects.moveUp": "Mover para cima",
  "admin.projects.moveDown": "Mover para baixo",
  "admin.projects.slugRequired": "Informe um slug válido (letras minúsculas, números e hífens).",

  "admin.site.title": "Configurações do site",
  "admin.site.founder": "Fundadora",
  "admin.site.founderName": "Nome",
  "admin.site.founderRole": "Função",
  "admin.site.founderBio": "Texto institucional",
  "admin.site.founderPhoto": "Foto",
  "admin.site.saved": "Configurações salvas!",

  "wa.float": "Falar no WhatsApp",
  "wa.floatMsg": "Olá! Quero saber mais sobre automação com IA na YESOD.",
  "wa.generic": "Olá! Quero falar com a YESOD sobre automação e escala com inteligência artificial.",
  "wa.product": "Olá! Quero saber mais sobre a solução {name} da YESOD.",
  "wa.project": "Olá! Quero saber mais sobre o projeto {name} da YESOD.",
  "wa.contactIntro": "Olá, YESOD! Vim pelo site.",
  "wa.contactName": "Nome",
  "wa.contactCompany": "Empresa",
  "wa.contactProcess": "Processo que quero automatizar",
  "wa.contactMessage": "Mensagem",
  "wa.notInformed": "não informado",

  "footer.about":
    "A YESOD transforma processos manuais e repetitivos em operações automatizadas, escaláveis e precisas com inteligência artificial. O Yesod HUB é o espaço onde isso é compartilhado na prática.",
  "footer.contact": "Contato",
  "footer.rights": "Todos os direitos reservados.",

  "meta.home.title": "Yesod HUB — automação e escala com inteligência artificial",
  "meta.home.desc":
    "Yesod HUB: novidades, projetos de automação, conteúdo exclusivo e área de membros para quem quer escalar processos com inteligência artificial.",
  "meta.hub.title": "Yesod HUB — feed de automação e IA",
  "meta.hub.desc":
    "Publicações da equipe YESOD: novidades, automação, projetos e ofertas. Curta e comente com sua conta de membro.",
  "meta.projects.title": "Projetos YESOD — automações em operação",
  "meta.projects.desc":
    "Vitrine de projetos da YESOD: automação gráfica, comercial, de dados e IA aplicada, com o que cada projeto automatiza e o resultado alcançado.",
  "meta.services.title": "Serviços YESOD — automação de processos com IA",
  "meta.services.desc":
    "Consultoria em automação de processos, desenvolvimento de soluções com IA, integração de sistemas e APIs, operação em escala e suporte contínuo.",
  "meta.products.title": "Soluções YESOD — formatos de automação configuráveis",
  "meta.products.desc":
    "Soluções configuráveis da YESOD: diagnóstico de automação, automação sob medida, integrações e APIs e operação em escala.",
  "meta.contact.title": "Contato YESOD — fale com a equipe pelo WhatsApp",
  "meta.contact.desc":
    "Fale com a YESOD pelo WhatsApp (+55 11 93413-6614) e conte qual processo você quer automatizar. Atendimento remoto em todo o Brasil.",
  "meta.auth.title": "Entrar no Yesod HUB — área de membros",
  "meta.auth.desc":
    "Acesse sua conta ou cadastre-se para participar do Yesod HUB e ver o conteúdo exclusivo.",
  "meta.space.title": "Meu espaço — Yesod HUB",
  "meta.space.desc": "Área exclusiva de membros do Yesod HUB: seu perfil e conteúdos reservados.",
};

export type TranslationKey = keyof typeof pt;
type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  "brand.hub": "Yesod HUB",
  "brand.tagline": "Automation and scale with artificial intelligence",

  "nav.home": "Home",
  "nav.hub": "Yesod HUB",
  "nav.projects": "Projects",
  "nav.services": "Services",
  "nav.products": "Solutions",
  "nav.members": "Members area",
  "nav.contact": "Contact",
  "nav.navigation": "Navigation",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.mySpace": "My space",
  "nav.signup": "Create account",
  "nav.signin": "Sign in",
  "nav.language": "Language",

  "common.loading": "Loading…",
  "common.save": "Save changes",
  "common.saving": "Saving…",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.create": "Create",
  "common.back": "Back",
  "common.share": "Share",
  "common.linkCopied": "Link copied!",
  "common.talkToYesod": "Talk to YESOD",
  "common.error": "Something went wrong. Please try again.",
  "common.required": "This field is required.",
  "common.optional": "optional",
  "common.remove": "Remove",
  "common.yes": "Yes",
  "common.no": "No",
  "common.preview": "Preview",
  "common.published": "Published",
  "common.draft": "Draft",

  "home.heroTitle": "Welcome to Yesod HUB",
  "home.heroText":
    "YESOD turns manual, repetitive processes into automated, scalable and precise operations powered by artificial intelligence. Here you follow that work closely: content, real projects and an exclusive space for members.",
  "home.ctaJoin": "Join Yesod HUB",
  "home.ctaSee": "Explore Yesod HUB",
  "home.pillarsTitle": "What you'll find here",
  "home.pillarsText": "Four ways to follow intelligent automation in practice.",
  "home.pillar.news": "News",
  "home.pillar.newsText":
    "What is being built at YESOD and across the AI automation world, straight in the feed.",
  "home.pillar.projects": "Projects",
  "home.pillar.projectsText":
    "Real automations in production, with what each one automates and the outcome achieved.",
  "home.pillar.exclusive": "Exclusive content",
  "home.pillar.exclusiveText": "Materials, tips and early news released to members only.",
  "home.pillar.members": "Members area",
  "home.pillar.membersText":
    "Your space with profile, progress and access to everything exclusive to Yesod HUB.",
  "home.productsTitle": "Our solutions",
  "home.productsText":
    "Configurable ways of working, from the first diagnosis to running at scale.",
  "home.seeProducts": "See solutions",
  "home.founderTitle": "Who is behind YESOD",
  "home.testimonialsTitle": "What members say",
  "home.testimonialsText": "Reserved space for real Yesod HUB testimonials.",
  "home.testimonialQuote": "“Reserved space for a Yesod HUB member testimonial.”",
  "home.testimonialName": "Member name",
  "home.testimonialRole": "Role · Company",
  "home.faqTitle": "Frequently asked questions",
  "home.finalTitle": "Ready to automate your operation?",
  "home.finalText":
    "Tell us which routine consumes most of your team's time and we'll show you where to start.",

  "faq.q1": "What does YESOD do?",
  "faq.a1":
    "YESOD turns manual, repetitive processes into automated, scalable and precise operations. We combine workflow automation, systems integration and artificial intelligence so your team handles decisions, not repeated tasks.",
  "faq.q2": "How does AI automation work?",
  "faq.a2":
    "We start by understanding the process as it is today. Then we design the automated flow and apply AI where it truly helps: document reading, classification, content generation and decision support — always with human validation where needed.",
  "faq.q3": "Which projects exist?",
  "faq.a3":
    "There are automations across different areas: print (including prepress), sales, data and AI applied to documents. The Projects page shows what each one automates and the outcome achieved.",
  "faq.q4": "How do I access the members area?",
  "faq.a4":
    "Create your account with email and password and open the Members area. That's where your profile, exclusive content and early Yesod HUB news live.",
  "faq.q5": "Can I stop whenever I want?",
  "faq.a5":
    "Yes. There is no lock-in: you can leave or adjust what you contracted by talking to the team on WhatsApp.",

  "hub.title": "Yesod HUB",
  "hub.subtitle": "News, automation, projects and offers published by the YESOD team.",
  "hub.all": "All",
  "hub.cat.Novidades": "News",
  "hub.cat.Automação": "Automation",
  "hub.cat.Projetos": "Projects",
  "hub.cat.Ofertas": "Offers",
  "hub.loadingPosts": "Loading posts…",
  "hub.loadError": "We couldn't load the posts.",
  "hub.empty": "There are no posts in this category yet.",
  "hub.signInBanner": "Sign in to like and comment on posts.",
  "hub.signInLink": "Sign in or create an account",
  "hub.noComments": "No comments yet.",
  "hub.commentPlaceholder": "Write a comment…",
  "hub.sendComment": "Send comment",
  "hub.signInToComment": "to comment.",
  "hub.signIn": "Sign in",
  "hub.needAuthLike": "Sign in to like posts.",
  "hub.needAuthComment": "Sign in to comment.",
  "hub.composerTitle": "Publish (administrator)",
  "hub.postTitle": "Title",
  "hub.postCategory": "Category",
  "hub.postContent": "Content",
  "hub.postImage": "Image URL (optional)",
  "hub.publish": "Publish",
  "hub.publishing": "Publishing…",
  "hub.published": "Post created!",

  "services.title": "Services",
  "services.subtitle":
    "What YESOD delivers as a company focused on automation and scale with artificial intelligence.",
  "services.s1": "Process automation consulting",
  "services.s1Text":
    "We map how your operation works today, identify what is repetitive and design the path to automate, prioritised by impact.",
  "services.s2": "AI solution development",
  "services.s2Text":
    "We build solutions that apply artificial intelligence where it really solves things: document reading, classification, content generation and decision support.",
  "services.s3": "Systems and API integration",
  "services.s3Text":
    "We connect the tools you already use so data flows between them without manual typing or intermediate spreadsheets.",
  "services.s4": "Operating at scale",
  "services.s4Text":
    "Automations built for volume: less time per task, lower cost per operation and predictable results even in demand peaks.",
  "services.s5": "Support and continuous evolution",
  "services.s5Text":
    "Follow-up after delivery, with monitoring, adjustments and new improvements as the business changes.",
  "services.ctaTitle": "Shall we look at your process together?",
  "services.ctaText":
    "Tell us which routine consumes most of your team's time and we'll show you where to start.",

  "products.title": "Solutions",
  "products.subtitle":
    "Each solution is a configurable way of working, designed around the reality of your operation. Scope is defined together with the team.",
  "products.featured": "Most requested",
  "products.cta": "I'd like to talk about this",

  "product.diagnostic.name": "Automation Diagnosis",
  "product.diagnostic.desc":
    "Mapping of the manual processes in your operation and a clear plan of what can be automated first.",
  "product.diagnostic.f1": "Process mapping",
  "product.diagnostic.f2": "Prioritisation by impact",
  "product.diagnostic.f3": "Report with action plan",
  "product.diagnostic.f4": "Findings meeting",
  "product.custom.name": "Tailor-made Automation",
  "product.custom.desc":
    "Building automated flows for your team's repetitive routines, with AI where it makes sense.",
  "product.custom.f1": "Scope designed with you",
  "product.custom.f2": "Automation of repetitive routines",
  "product.custom.f3": "AI applied to decisions and data reading",
  "product.custom.f4": "Follow-up during rollout",
  "product.integrations.name": "Integrations and APIs",
  "product.integrations.desc":
    "Connecting the systems you already use so data flows without manual typing.",
  "product.integrations.f1": "Integration between internal systems",
  "product.integrations.f2": "Third-party API connections",
  "product.integrations.f3": "Data synchronisation",
  "product.integrations.f4": "Failure monitoring",
  "product.scale.name": "Operating at Scale",
  "product.scale.desc":
    "Continuous follow-up of your automated operation, with evolution and support from the YESOD team.",
  "product.scale.f1": "Continuous support",
  "product.scale.f2": "Periodic adjustments and improvements",
  "product.scale.f3": "Monitoring dashboard",
  "product.scale.f4": "Exclusive Yesod HUB content",

  "projects.title": "Projects",
  "projects.subtitle":
    "A showcase of the automations YESOD builds and keeps running across different areas of the business.",
  "projects.view": "View project",
  "projects.openDemo": "Open demo",
  "projects.talk": "Talk about this project",
  "projects.empty": "New projects will be published soon.",
  "projects.loading": "Loading projects…",
  "projects.notFound": "Project not found.",
  "projects.backToList": "Back to projects",
  "projects.context": "Context",
  "projects.automation": "What was automated",
  "projects.solution": "Applied solution",
  "projects.result": "Outcome",
  "projects.gallery": "Gallery",

  "contact.title": "Contact",
  "contact.subtitle":
    "WhatsApp is YESOD's main channel. Talk directly to the team or fill in the form — it composes the message and opens the conversation for you.",
  "contact.whatsappTitle": "Talk on WhatsApp",
  "contact.whatsappText":
    "Quick replies during business hours. Tell us which routine consumes your team's time.",
  "contact.openWhatsapp": "Open WhatsApp conversation",
  "contact.hours": "Mon to Fri, 9am to 6pm (Brasília time)",
  "contact.remote": "100% remote service — Brazil",
  "contact.formTitle": "Prefer to write first?",
  "contact.formText": "On submit, WhatsApp opens with the message already filled in.",
  "contact.name": "Your name",
  "contact.namePlaceholder": "What should we call you?",
  "contact.company": "Company",
  "contact.companyPlaceholder": "Your company name",
  "contact.process": "Process you want to automate",
  "contact.processPlaceholder": "e.g. quotes, file checking, reports",
  "contact.message": "Message",
  "contact.messagePlaceholder": "Tell us a bit about your current scenario.",
  "contact.submit": "Send via WhatsApp",

  "auth.signupTitle": "Create your account",
  "auth.loginTitle": "Sign in to Yesod HUB",
  "auth.subtitle": "Access to the feed, exclusive content and YESOD support.",
  "auth.fullName": "Full name",
  "auth.company": "Company",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.wait": "Please wait…",
  "auth.createAccount": "Create account",
  "auth.signin": "Sign in",
  "auth.haveAccount": "I already have an account — sign in",
  "auth.noAccount": "I don't have an account — sign up",
  "auth.created": "Account created! Welcome to Yesod HUB.",
  "auth.confirmEmail": "Account created! Confirm your email to get access.",
  "auth.welcomeBack": "Welcome back!",
  "auth.failed": "We couldn't continue.",

  "space.title": "My space",
  "space.signOut": "Sign out",
  "space.profileTitle": "My professional profile",
  "space.photo": "Profile photo",
  "space.uploadPhoto": "Upload photo",
  "space.changePhoto": "Change photo",
  "space.removePhoto": "Remove photo",
  "space.photoHint": "JPG, PNG or WEBP image up to 5 MB.",
  "space.photoInvalidType": "Please select an image file.",
  "space.photoTooLarge": "The image must be 5 MB or smaller.",
  "space.name": "Name",
  "space.phone": "Phone",
  "space.phonePlaceholder": "+55 11 90000-0000",
  "space.phoneInvalid": "Enter a valid phone number.",
  "space.accountType": "Account type",
  "space.individual": "Individual",
  "space.companyType": "Company",
  "space.companyName": "Company name",
  "space.employees": "Number of employees",
  "space.employeesInvalid": "Enter at least 1 employee.",
  "space.goal": "Your main goal at Yesod HUB",
  "space.goalPlaceholder": "e.g. automate file checking and reduce rework.",
  "space.newsletter": "I want to receive YESOD news and content by email",
  "space.saved": "Profile updated!",
  "space.exclusiveTitle": "Exclusive content",
  "space.exclusiveText": "Materials available to Yesod HUB members only.",
  "space.ex1": "YESOD automation guide",
  "space.ex1Text": "How to spot repetitive processes and prioritise what to automate first.",
  "space.ex2": "Integration recipes",
  "space.ex2Text": "Ready-made patterns to connect systems and APIs without manual typing.",
  "space.ex3": "Applied AI track",
  "space.ex3Text": "Study materials to use artificial intelligence in day-to-day operations.",
  "space.adminTitle": "Administration",
  "space.manageProjects": "Manage projects",
  "space.manageProjectsText": "Create, edit, reorder and publish the showcase projects.",
  "space.manageSite": "Site settings",
  "space.manageSiteText": "Founder photo and institutional texts shown on the Home page.",

  "admin.projects.title": "Manage projects",
  "admin.projects.new": "New project",
  "admin.projects.slug": "Slug (URL)",
  "admin.projects.cover": "Cover image",
  "admin.projects.galleryUpload": "Add to gallery",
  "admin.projects.interaction": "Card action",
  "admin.projects.interactionDetails": "Open details page",
  "admin.projects.interactionDemo": "Open external link",
  "admin.projects.interactionWhatsapp": "Open WhatsApp",
  "admin.projects.interactionLabel": "Button label",
  "admin.projects.interactionUrl": "External URL",
  "admin.projects.sortOrder": "Order",
  "admin.projects.publishedField": "Published",
  "admin.projects.projectTitle": "Title",
  "admin.projects.category": "Category",
  "admin.projects.summary": "Summary",
  "admin.projects.context": "Problem / context",
  "admin.projects.automation": "What was automated",
  "admin.projects.solution": "Applied solution",
  "admin.projects.result": "Outcome",
  "admin.projects.content": "Detailed content",
  "admin.projects.saved": "Project saved!",
  "admin.projects.deleted": "Project deleted.",
  "admin.projects.confirmDelete": "Permanently delete this project?",
  "admin.projects.empty": "No projects registered yet.",
  "admin.projects.moveUp": "Move up",
  "admin.projects.moveDown": "Move down",
  "admin.projects.slugRequired": "Enter a valid slug (lowercase letters, numbers and hyphens).",

  "admin.site.title": "Site settings",
  "admin.site.founder": "Founder",
  "admin.site.founderName": "Name",
  "admin.site.founderRole": "Role",
  "admin.site.founderBio": "Institutional text",
  "admin.site.founderPhoto": "Photo",
  "admin.site.saved": "Settings saved!",

  "wa.float": "Talk on WhatsApp",
  "wa.floatMsg": "Hi! I'd like to know more about AI automation at YESOD.",
  "wa.generic": "Hi! I'd like to talk to YESOD about automation and scale with AI.",
  "wa.product": "Hi! I'd like to know more about the {name} solution from YESOD.",
  "wa.project": "Hi! I'd like to know more about the {name} project from YESOD.",
  "wa.contactIntro": "Hi YESOD! I came from the website.",
  "wa.contactName": "Name",
  "wa.contactCompany": "Company",
  "wa.contactProcess": "Process I want to automate",
  "wa.contactMessage": "Message",
  "wa.notInformed": "not provided",

  "footer.about":
    "YESOD turns manual, repetitive processes into automated, scalable and precise operations powered by artificial intelligence. Yesod HUB is where that is shared in practice.",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved.",

  "meta.home.title": "Yesod HUB — automation and scale with artificial intelligence",
  "meta.home.desc":
    "Yesod HUB: news, automation projects, exclusive content and a members area for people scaling processes with artificial intelligence.",
  "meta.hub.title": "Yesod HUB — automation and AI feed",
  "meta.hub.desc":
    "Posts from the YESOD team: news, automation, projects and offers. Like and comment with your member account.",
  "meta.projects.title": "YESOD projects — automations in production",
  "meta.projects.desc":
    "YESOD project showcase: print, sales, data and applied AI automation, with what each project automates and the outcome achieved.",
  "meta.services.title": "YESOD services — process automation with AI",
  "meta.services.desc":
    "Process automation consulting, AI solution development, systems and API integration, operating at scale and continuous support.",
  "meta.products.title": "YESOD solutions — configurable automation formats",
  "meta.products.desc":
    "Configurable YESOD solutions: automation diagnosis, tailor-made automation, integrations and APIs and operating at scale.",
  "meta.contact.title": "Contact YESOD — talk to the team on WhatsApp",
  "meta.contact.desc":
    "Talk to YESOD on WhatsApp (+55 11 93413-6614) and tell us which process you want to automate. Remote service across Brazil.",
  "meta.auth.title": "Sign in to Yesod HUB — members area",
  "meta.auth.desc":
    "Sign in or create your account to join Yesod HUB and see the exclusive content.",
  "meta.space.title": "My space — Yesod HUB",
  "meta.space.desc": "Exclusive Yesod HUB members area: your profile and reserved content.",
};

const es: Dictionary = {
  "brand.hub": "Yesod HUB",
  "brand.tagline": "Automatización y escala con inteligencia artificial",

  "nav.home": "Inicio",
  "nav.hub": "Yesod HUB",
  "nav.projects": "Proyectos",
  "nav.services": "Servicios",
  "nav.products": "Soluciones",
  "nav.members": "Área de miembros",
  "nav.contact": "Contacto",
  "nav.navigation": "Navegación",
  "nav.openMenu": "Abrir menú",
  "nav.closeMenu": "Cerrar menú",
  "nav.mySpace": "Mi espacio",
  "nav.signup": "Crear cuenta",
  "nav.signin": "Entrar",
  "nav.language": "Idioma",

  "common.loading": "Cargando…",
  "common.save": "Guardar cambios",
  "common.saving": "Guardando…",
  "common.cancel": "Cancelar",
  "common.delete": "Eliminar",
  "common.edit": "Editar",
  "common.create": "Crear",
  "common.back": "Volver",
  "common.share": "Compartir",
  "common.linkCopied": "¡Enlace copiado!",
  "common.talkToYesod": "Hablar con YESOD",
  "common.error": "Algo salió mal. Inténtalo de nuevo.",
  "common.required": "Campo obligatorio.",
  "common.optional": "opcional",
  "common.remove": "Eliminar",
  "common.yes": "Sí",
  "common.no": "No",
  "common.preview": "Vista previa",
  "common.published": "Publicado",
  "common.draft": "Borrador",

  "home.heroTitle": "Bienvenido a Yesod HUB",
  "home.heroText":
    "YESOD transforma procesos manuales y repetitivos en operaciones automatizadas, escalables y precisas con inteligencia artificial. Aquí sigues ese trabajo de cerca: contenido, proyectos reales y un espacio exclusivo para miembros.",
  "home.ctaJoin": "Entrar en Yesod HUB",
  "home.ctaSee": "Ver Yesod HUB",
  "home.pillarsTitle": "Lo que encuentras aquí",
  "home.pillarsText": "Cuatro frentes para seguir la automatización inteligente en la práctica.",
  "home.pillar.news": "Novedades",
  "home.pillar.newsText":
    "Lo que se está construyendo en YESOD y en el universo de la automatización con IA, directo en el feed.",
  "home.pillar.projects": "Proyectos",
  "home.pillar.projectsText":
    "Automatizaciones reales en operación, con lo que cada una automatiza y el resultado logrado.",
  "home.pillar.exclusive": "Contenido exclusivo",
  "home.pillar.exclusiveText":
    "Materiales, consejos y novedades en primicia liberados solo para miembros.",
  "home.pillar.members": "Área de miembros",
  "home.pillar.membersText":
    "Tu espacio con perfil, seguimiento y acceso a todo lo exclusivo de Yesod HUB.",
  "home.productsTitle": "Nuestras soluciones",
  "home.productsText":
    "Formatos de trabajo configurables, desde el diagnóstico inicial hasta la operación en escala.",
  "home.seeProducts": "Ver soluciones",
  "home.founderTitle": "Quién está detrás de YESOD",
  "home.testimonialsTitle": "Lo que dicen los miembros",
  "home.testimonialsText": "Espacios reservados para testimonios reales de Yesod HUB.",
  "home.testimonialQuote": "“Espacio reservado para el testimonio de un miembro de Yesod HUB.”",
  "home.testimonialName": "Nombre del miembro",
  "home.testimonialRole": "Cargo · Empresa",
  "home.faqTitle": "Preguntas frecuentes",
  "home.finalTitle": "¿Listo para automatizar tu operación?",
  "home.finalText":
    "Cuéntanos qué rutina consume más tiempo de tu equipo y te mostramos por dónde empezar.",

  "faq.q1": "¿Qué hace YESOD?",
  "faq.a1":
    "YESOD transforma procesos manuales y repetitivos en operaciones automatizadas, escalables y precisas. Unimos automatización de flujos, integración de sistemas e inteligencia artificial para que el equipo se ocupe de decidir, no de repetir tareas.",
  "faq.q2": "¿Cómo funciona la automatización con IA?",
  "faq.a2":
    "Empezamos entendiendo el proceso tal como es hoy. Después diseñamos el flujo automatizado y aplicamos IA en los puntos donde realmente ayuda: lectura de documentos, clasificación, generación de contenido y apoyo a la decisión, siempre con validación humana cuando es necesario.",
  "faq.q3": "¿Qué proyectos existen?",
  "faq.a3":
    "Hay automatizaciones en áreas distintas: gráfica (incluida la preimpresión), comercial, datos e IA aplicada a documentos. La página Proyectos muestra qué automatiza cada una y el resultado logrado.",
  "faq.q4": "¿Cómo accedo al área de miembros?",
  "faq.a4":
    "Crea tu cuenta con correo y contraseña y entra en Área de miembros. Allí están tu perfil, el contenido exclusivo y las novedades en primicia de Yesod HUB.",
  "faq.q5": "¿Puedo terminar cuando quiera?",
  "faq.a5":
    "Sí. No hay permanencia: puedes salir o ajustar lo contratado hablando con el equipo por WhatsApp.",

  "hub.title": "Yesod HUB",
  "hub.subtitle": "Novedades, automatización, proyectos y ofertas publicados por el equipo YESOD.",
  "hub.all": "Todas",
  "hub.cat.Novidades": "Novedades",
  "hub.cat.Automação": "Automatización",
  "hub.cat.Projetos": "Proyectos",
  "hub.cat.Ofertas": "Ofertas",
  "hub.loadingPosts": "Cargando publicaciones…",
  "hub.loadError": "No fue posible cargar las publicaciones.",
  "hub.empty": "Todavía no hay publicaciones en esta categoría.",
  "hub.signInBanner": "Entra en tu cuenta para dar me gusta y comentar.",
  "hub.signInLink": "Entrar o crear cuenta",
  "hub.noComments": "Aún no hay comentarios.",
  "hub.commentPlaceholder": "Escribe un comentario…",
  "hub.sendComment": "Enviar comentario",
  "hub.signInToComment": "para comentar.",
  "hub.signIn": "Entra",
  "hub.needAuthLike": "Entra en tu cuenta para dar me gusta.",
  "hub.needAuthComment": "Entra en tu cuenta para comentar.",
  "hub.composerTitle": "Publicar (administrador)",
  "hub.postTitle": "Título",
  "hub.postCategory": "Categoría",
  "hub.postContent": "Contenido",
  "hub.postImage": "URL de la imagen (opcional)",
  "hub.publish": "Publicar",
  "hub.publishing": "Publicando…",
  "hub.published": "¡Publicación creada!",

  "services.title": "Servicios",
  "services.subtitle":
    "Lo que YESOD entrega como empresa de automatización y escala con inteligencia artificial.",
  "services.s1": "Consultoría en automatización de procesos",
  "services.s1Text":
    "Mapeamos cómo funciona tu operación hoy, identificamos lo repetitivo y diseñamos el camino para automatizar priorizando por impacto.",
  "services.s2": "Desarrollo de soluciones con IA",
  "services.s2Text":
    "Construimos soluciones que aplican inteligencia artificial donde realmente resuelve: lectura de documentos, clasificación, generación de contenido y apoyo a la decisión.",
  "services.s3": "Integración de sistemas y APIs",
  "services.s3Text":
    "Conectamos las herramientas que ya usas para que los datos circulen entre ellas sin digitación manual ni hojas de cálculo intermedias.",
  "services.s4": "Operación en escala",
  "services.s4Text":
    "Automatizaciones preparadas para volumen: menos tiempo por tarea, menos costo por operación y resultado previsible incluso en picos de demanda.",
  "services.s5": "Soporte y evolución continua",
  "services.s5Text":
    "Acompañamiento tras la entrega, con monitoreo, ajustes y nuevas mejoras conforme cambia el negocio.",
  "services.ctaTitle": "¿Miramos tu proceso juntos?",
  "services.ctaText":
    "Cuéntanos qué rutina consume más tiempo de tu equipo y te mostramos por dónde empezar.",

  "products.title": "Soluciones",
  "products.subtitle":
    "Cada solución es un formato de trabajo configurable, diseñado a partir de la realidad de tu operación. El alcance se define en conversación con el equipo.",
  "products.featured": "Más solicitado",
  "products.cta": "Quiero hablar sobre esto",

  "product.diagnostic.name": "Diagnóstico de Automatización",
  "product.diagnostic.desc":
    "Mapeo de los procesos manuales de tu operación y un plan claro de lo que se puede automatizar primero.",
  "product.diagnostic.f1": "Mapeo de procesos",
  "product.diagnostic.f2": "Priorización por impacto",
  "product.diagnostic.f3": "Informe con plan de acción",
  "product.diagnostic.f4": "Reunión de devolución",
  "product.custom.name": "Automatización a Medida",
  "product.custom.desc":
    "Construcción de flujos automatizados para las rutinas repetitivas de tu equipo, con IA donde tiene sentido.",
  "product.custom.f1": "Alcance diseñado contigo",
  "product.custom.f2": "Automatización de rutinas repetitivas",
  "product.custom.f3": "IA aplicada a decisiones y lectura de datos",
  "product.custom.f4": "Acompañamiento durante la implantación",
  "product.integrations.name": "Integraciones y APIs",
  "product.integrations.desc":
    "Conexión entre los sistemas que ya usas, para que los datos circulen sin digitación manual.",
  "product.integrations.f1": "Integración entre sistemas internos",
  "product.integrations.f2": "Conexión con APIs de terceros",
  "product.integrations.f3": "Sincronización de datos",
  "product.integrations.f4": "Monitoreo de fallos",
  "product.scale.name": "Operación en Escala",
  "product.scale.desc":
    "Acompañamiento continuo de tu operación automatizada, con evolución y soporte del equipo YESOD.",
  "product.scale.f1": "Soporte continuo",
  "product.scale.f2": "Ajustes y mejoras periódicas",
  "product.scale.f3": "Panel de seguimiento",
  "product.scale.f4": "Contenido exclusivo de Yesod HUB",

  "projects.title": "Proyectos",
  "projects.subtitle":
    "Una vitrina de las automatizaciones que YESOD construye y mantiene en operación, en áreas distintas del negocio.",
  "projects.view": "Ver proyecto",
  "projects.openDemo": "Abrir demostración",
  "projects.talk": "Hablar sobre este proyecto",
  "projects.empty": "Pronto se publicarán nuevos proyectos.",
  "projects.loading": "Cargando proyectos…",
  "projects.notFound": "Proyecto no encontrado.",
  "projects.backToList": "Volver a proyectos",
  "projects.context": "Contexto",
  "projects.automation": "Qué se automatizó",
  "projects.solution": "Solución aplicada",
  "projects.result": "Resultado",
  "projects.gallery": "Galería",

  "contact.title": "Contacto",
  "contact.subtitle":
    "WhatsApp es el canal principal de YESOD. Habla directo con el equipo o completa el formulario — arma el mensaje y abre la conversación por ti.",
  "contact.whatsappTitle": "Habla por WhatsApp",
  "contact.whatsappText":
    "Respuesta rápida en horario comercial. Cuéntanos qué rutina consume el tiempo de tu equipo.",
  "contact.openWhatsapp": "Abrir conversación en WhatsApp",
  "contact.hours": "Lun a vie, 9h a 18h (hora de Brasilia)",
  "contact.remote": "Atención 100% remota — Brasil",
  "contact.formTitle": "¿Prefieres escribir antes?",
  "contact.formText": "Al enviar, WhatsApp se abre con el mensaje ya completado.",
  "contact.name": "Tu nombre",
  "contact.namePlaceholder": "¿Cómo podemos llamarte?",
  "contact.company": "Empresa",
  "contact.companyPlaceholder": "Nombre de tu empresa",
  "contact.process": "Proceso que quieres automatizar",
  "contact.processPlaceholder": "Ej.: presupuestos, revisión de archivos, informes",
  "contact.message": "Mensaje",
  "contact.messagePlaceholder": "Cuéntanos un poco sobre tu escenario actual.",
  "contact.submit": "Enviar por WhatsApp",

  "auth.signupTitle": "Crear tu cuenta",
  "auth.loginTitle": "Entrar en Yesod HUB",
  "auth.subtitle": "Acceso al feed, contenido exclusivo y soporte de YESOD.",
  "auth.fullName": "Nombre completo",
  "auth.company": "Empresa",
  "auth.email": "Correo electrónico",
  "auth.password": "Contraseña",
  "auth.wait": "Espera…",
  "auth.createAccount": "Crear cuenta",
  "auth.signin": "Entrar",
  "auth.haveAccount": "Ya tengo cuenta — quiero entrar",
  "auth.noAccount": "Aún no tengo cuenta — quiero registrarme",
  "auth.created": "¡Cuenta creada! Bienvenido a Yesod HUB.",
  "auth.confirmEmail": "¡Cuenta creada! Confirma tu correo para acceder.",
  "auth.welcomeBack": "¡Bienvenido de vuelta!",
  "auth.failed": "No fue posible continuar.",

  "space.title": "Mi espacio",
  "space.signOut": "Salir",
  "space.profileTitle": "Mi perfil profesional",
  "space.photo": "Foto de perfil",
  "space.uploadPhoto": "Subir foto",
  "space.changePhoto": "Cambiar foto",
  "space.removePhoto": "Eliminar foto",
  "space.photoHint": "Imagen JPG, PNG o WEBP de hasta 5 MB.",
  "space.photoInvalidType": "Selecciona un archivo de imagen.",
  "space.photoTooLarge": "La imagen debe pesar como máximo 5 MB.",
  "space.name": "Nombre",
  "space.phone": "Teléfono",
  "space.phonePlaceholder": "+55 11 90000-0000",
  "space.phoneInvalid": "Informa un teléfono válido.",
  "space.accountType": "Tipo de cuenta",
  "space.individual": "Persona física",
  "space.companyType": "Empresa",
  "space.companyName": "Nombre de la empresa",
  "space.employees": "Cantidad de empleados",
  "space.employeesInvalid": "Informa al menos 1 empleado.",
  "space.goal": "Tu principal objetivo en Yesod HUB",
  "space.goalPlaceholder": "Ej.: automatizar la revisión de archivos y reducir retrabajo.",
  "space.newsletter": "Quiero recibir novedades y contenidos de YESOD por correo",
  "space.saved": "¡Perfil actualizado!",
  "space.exclusiveTitle": "Contenido exclusivo",
  "space.exclusiveText": "Materiales disponibles solo para miembros de Yesod HUB.",
  "space.ex1": "Guía de automatización YESOD",
  "space.ex1Text":
    "Cómo identificar procesos repetitivos y priorizar qué automatizar primero.",
  "space.ex2": "Recetas de integración",
  "space.ex2Text": "Patrones listos para conectar sistemas y APIs sin digitación manual.",
  "space.ex3": "Ruta de IA aplicada",
  "space.ex3Text":
    "Materiales de estudio para usar inteligencia artificial en la rutina de la operación.",
  "space.adminTitle": "Administración",
  "space.manageProjects": "Gestionar proyectos",
  "space.manageProjectsText": "Crear, editar, ordenar y publicar los proyectos de la vitrina.",
  "space.manageSite": "Configuración del sitio",
  "space.manageSiteText": "Foto y textos institucionales de la fundadora mostrados en el Inicio.",

  "admin.projects.title": "Gestionar proyectos",
  "admin.projects.new": "Nuevo proyecto",
  "admin.projects.slug": "Slug (URL)",
  "admin.projects.cover": "Imagen de portada",
  "admin.projects.galleryUpload": "Añadir a la galería",
  "admin.projects.interaction": "Acción de la tarjeta",
  "admin.projects.interactionDetails": "Abrir página de detalles",
  "admin.projects.interactionDemo": "Abrir enlace externo",
  "admin.projects.interactionWhatsapp": "Abrir WhatsApp",
  "admin.projects.interactionLabel": "Texto del botón",
  "admin.projects.interactionUrl": "URL externa",
  "admin.projects.sortOrder": "Orden",
  "admin.projects.publishedField": "Publicado",
  "admin.projects.projectTitle": "Título",
  "admin.projects.category": "Categoría",
  "admin.projects.summary": "Resumen",
  "admin.projects.context": "Problema / contexto",
  "admin.projects.automation": "Qué se automatizó",
  "admin.projects.solution": "Solución aplicada",
  "admin.projects.result": "Resultado",
  "admin.projects.content": "Contenido detallado",
  "admin.projects.saved": "¡Proyecto guardado!",
  "admin.projects.deleted": "Proyecto eliminado.",
  "admin.projects.confirmDelete": "¿Eliminar definitivamente este proyecto?",
  "admin.projects.empty": "Todavía no hay proyectos registrados.",
  "admin.projects.moveUp": "Mover arriba",
  "admin.projects.moveDown": "Mover abajo",
  "admin.projects.slugRequired": "Informa un slug válido (minúsculas, números y guiones).",

  "admin.site.title": "Configuración del sitio",
  "admin.site.founder": "Fundadora",
  "admin.site.founderName": "Nombre",
  "admin.site.founderRole": "Función",
  "admin.site.founderBio": "Texto institucional",
  "admin.site.founderPhoto": "Foto",
  "admin.site.saved": "¡Configuración guardada!",

  "wa.float": "Hablar por WhatsApp",
  "wa.floatMsg": "¡Hola! Quiero saber más sobre automatización con IA en YESOD.",
  "wa.generic": "¡Hola! Quiero hablar con YESOD sobre automatización y escala con IA.",
  "wa.product": "¡Hola! Quiero saber más sobre la solución {name} de YESOD.",
  "wa.project": "¡Hola! Quiero saber más sobre el proyecto {name} de YESOD.",
  "wa.contactIntro": "¡Hola, YESOD! Vengo del sitio.",
  "wa.contactName": "Nombre",
  "wa.contactCompany": "Empresa",
  "wa.contactProcess": "Proceso que quiero automatizar",
  "wa.contactMessage": "Mensaje",
  "wa.notInformed": "no informado",

  "footer.about":
    "YESOD transforma procesos manuales y repetitivos en operaciones automatizadas, escalables y precisas con inteligencia artificial. Yesod HUB es el espacio donde esto se comparte en la práctica.",
  "footer.contact": "Contacto",
  "footer.rights": "Todos los derechos reservados.",

  "meta.home.title": "Yesod HUB — automatización y escala con inteligencia artificial",
  "meta.home.desc":
    "Yesod HUB: novedades, proyectos de automatización, contenido exclusivo y área de miembros para quien quiere escalar procesos con inteligencia artificial.",
  "meta.hub.title": "Yesod HUB — feed de automatización e IA",
  "meta.hub.desc":
    "Publicaciones del equipo YESOD: novedades, automatización, proyectos y ofertas. Da me gusta y comenta con tu cuenta de miembro.",
  "meta.projects.title": "Proyectos YESOD — automatizaciones en operación",
  "meta.projects.desc":
    "Vitrina de proyectos de YESOD: automatización gráfica, comercial, de datos e IA aplicada, con lo que cada proyecto automatiza y el resultado logrado.",
  "meta.services.title": "Servicios YESOD — automatización de procesos con IA",
  "meta.services.desc":
    "Consultoría en automatización de procesos, desarrollo de soluciones con IA, integración de sistemas y APIs, operación en escala y soporte continuo.",
  "meta.products.title": "Soluciones YESOD — formatos de automatización configurables",
  "meta.products.desc":
    "Soluciones configurables de YESOD: diagnóstico de automatización, automatización a medida, integraciones y APIs y operación en escala.",
  "meta.contact.title": "Contacto YESOD — habla con el equipo por WhatsApp",
  "meta.contact.desc":
    "Habla con YESOD por WhatsApp (+55 11 93413-6614) y cuéntanos qué proceso quieres automatizar. Atención remota en todo Brasil.",
  "meta.auth.title": "Entrar en Yesod HUB — área de miembros",
  "meta.auth.desc":
    "Accede a tu cuenta o regístrate para participar en Yesod HUB y ver el contenido exclusivo.",
  "meta.space.title": "Mi espacio — Yesod HUB",
  "meta.space.desc":
    "Área exclusiva de miembros de Yesod HUB: tu perfil y contenidos reservados.",
};

const DICTIONARIES: Record<Lang, Dictionary> = { pt, en, es };

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
  tm: (value: unknown) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return (LANGUAGES as readonly string[]).includes(stored ?? "") ? (stored as Lang) : "pt";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const stored = readStoredLang();
    if (stored !== "pt") setLangState(stored);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = HTML_LANG[lang];
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[lang];
    return {
      lang,
      setLang,
      t: (key, vars) => {
        let text = dict[key] ?? pt[key] ?? String(key);
        if (vars) {
          for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
        }
        return text;
      },
      tm: (raw) => pickLang(raw, lang),
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Keeps document title/description in sync with the active language. */
export function useLocalizedMeta(titleKey: TranslationKey, descKey: TranslationKey) {
  const { t, lang } = useI18n();
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = t(titleKey);
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", t(descKey));
  }, [t, lang, titleKey, descKey]);
}
