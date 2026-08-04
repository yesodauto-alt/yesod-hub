export const WHATSAPP_NUMBER = "5511934136614";

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const ADMIN_EMAIL = "yesod.auto@gmail.com";

export const CATEGORIES = ["Novidades", "Automação", "Projetos", "Ofertas"] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Produtos configuráveis.
 * Edite livremente: adicione, remova ou altere qualquer campo abaixo.
 * Mantenha `price` como "Preço a definir" enquanto os valores não estiverem fechados.
 */
export type Product = {
  name: string;
  description: string;
  features: string[];
  price: string;
  availability: string;
  featured?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    name: "Diagnóstico de Automação",
    description:
      "Mapeamento dos processos manuais da sua operação e um plano claro do que pode ser automatizado primeiro.",
    features: [
      "Mapeamento de processos",
      "Priorização por impacto",
      "Relatório com plano de ação",
      "Reunião de devolutiva",
    ],
    price: "Preço a definir",
    availability: "Disponível",
  },
  {
    name: "Automação Sob Medida",
    description:
      "Construção de fluxos automatizados para as rotinas repetitivas do seu time, com IA onde faz sentido.",
    features: [
      "Escopo desenhado com você",
      "Automação de rotinas repetitivas",
      "IA aplicada a decisões e leitura de dados",
      "Acompanhamento durante a implantação",
    ],
    price: "Preço a definir",
    availability: "Disponível",
    featured: true,
  },
  {
    name: "Integrações e APIs",
    description:
      "Conexão entre os sistemas que você já usa, para que os dados circulem sem digitação manual.",
    features: [
      "Integração entre sistemas internos",
      "Conexão com APIs de terceiros",
      "Sincronização de dados",
      "Monitoramento de falhas",
    ],
    price: "Preço a definir",
    availability: "Disponível",
  },
  {
    name: "Operação em Escala",
    description:
      "Acompanhamento contínuo da sua operação automatizada, com evolução e suporte da equipe YESOD.",
    features: [
      "Suporte contínuo",
      "Ajustes e melhorias periódicas",
      "Painel de acompanhamento",
      "Conteúdo exclusivo da comunidade",
    ],
    price: "Preço a definir",
    availability: "Sob consulta",
  },
];

export type Project = {
  name: string;
  category: string;
  automates: string;
  result: string;
};

export const PROJECTS: Project[] = [
  {
    name: "Automação de pré-impressão",
    category: "Automação Gráfica",
    automates:
      "Conferência e preparação de arquivos gráficos: sangria, cores, fontes e imposição verificadas automaticamente.",
    result: "Redução expressiva de retrabalho e liberação da equipe técnica para tarefas de decisão.",
  },
  {
    name: "Qualificação automática de leads",
    category: "Automação Comercial",
    automates:
      "Triagem, enriquecimento e distribuição de contatos recebidos por diferentes canais.",
    result: "Resposta muito mais rápida ao cliente e um funil organizado sem trabalho manual.",
  },
  {
    name: "Leitura inteligente de documentos",
    category: "IA Aplicada",
    automates:
      "Extração de dados de notas, contratos e planilhas com modelos de IA, com validação assistida.",
    result: "Digitação praticamente eliminada e histórico consultável de tudo que foi processado.",
  },
  {
    name: "Relatórios operacionais automáticos",
    category: "Automação de Dados",
    automates:
      "Coleta de indicadores em múltiplas fontes e montagem periódica dos relatórios da operação.",
    result: "Informação pronta no início do dia, sem consolidação manual de planilhas.",
  },
];
