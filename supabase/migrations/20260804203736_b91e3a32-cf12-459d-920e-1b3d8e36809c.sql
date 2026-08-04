-- 1) profiles extension (non-destructive)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS community_goal text,
  ADD COLUMN IF NOT EXISTS account_type text,
  ADD COLUMN IF NOT EXISTS employee_count integer,
  ADD COLUMN IF NOT EXISTS newsletter_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_type_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_type_check
      CHECK (account_type IS NULL OR account_type IN ('individual','company'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_employee_count_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_employee_count_check
      CHECK (employee_count IS NULL OR employee_count >= 1);
  END IF;
END $$;

-- 2) handle_new_user picks up optional metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_account_type text := nullif(meta->>'account_type','');
  v_employee_count integer;
begin
  if v_account_type is not null and v_account_type not in ('individual','company') then
    v_account_type := null;
  end if;

  begin
    v_employee_count := nullif(meta->>'employee_count','')::integer;
  exception when others then
    v_employee_count := null;
  end;
  if v_employee_count is not null and v_employee_count < 1 then
    v_employee_count := null;
  end if;

  insert into public.profiles (
    id, full_name, company, phone, community_goal,
    account_type, employee_count, newsletter_opt_in
  )
  values (
    new.id,
    nullif(meta->>'full_name',''),
    nullif(meta->>'company',''),
    nullif(meta->>'phone',''),
    nullif(meta->>'community_goal',''),
    v_account_type,
    v_employee_count,
    coalesce((meta->>'newsletter_opt_in')::boolean, false)
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'member') on conflict do nothing;
  return new;
end;
$function$;

-- 3) projects
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title jsonb NOT NULL DEFAULT '{}'::jsonb,
  category jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  automation jsonb NOT NULL DEFAULT '{}'::jsonb,
  solution jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}'::text[],
  interaction_type text NOT NULL DEFAULT 'details',
  interaction_label jsonb NOT NULL DEFAULT '{}'::jsonb,
  interaction_url text,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT projects_interaction_type_check
    CHECK (interaction_type IN ('details','external_demo','whatsapp'))
);

GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "published projects public read" ON public.projects;
CREATE POLICY "published projects public read" ON public.projects
  FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins insert projects" ON public.projects;
CREATE POLICY "admins insert projects" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update projects" ON public.projects;
CREATE POLICY "admins update projects" ON public.projects
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete projects" ON public.projects;
CREATE POLICY "admins delete projects" ON public.projects
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS projects_sort_order_idx ON public.projects (sort_order, created_at);

-- 4) site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site settings public read" ON public.site_settings;
CREATE POLICY "site settings public read" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admins insert site settings" ON public.site_settings;
CREATE POLICY "admins insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins update site settings" ON public.site_settings;
CREATE POLICY "admins update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete site settings" ON public.site_settings;
CREATE POLICY "admins delete site settings" ON public.site_settings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (key, value) VALUES (
  'founder',
  jsonb_build_object(
    'image_url', null,
    'name', jsonb_build_object('pt','', 'en','', 'es',''),
    'role', jsonb_build_object(
      'pt','Fundadora da YESOD',
      'en','Founder of YESOD',
      'es','Fundadora de YESOD'
    ),
    'bio', jsonb_build_object(
      'pt','A YESOD nasceu da convicção de que nenhuma equipe deveria gastar o dia em tarefas repetitivas. Desde então, desenhamos automações com inteligência artificial que devolvem tempo às pessoas e permitem que a operação cresça sem crescer o esforço.',
      'en','YESOD was born from the conviction that no team should spend its day on repetitive tasks. Since then, we design AI-powered automations that give people their time back and let operations grow without growing the effort.',
      'es','YESOD nació de la convicción de que ningún equipo debería pasar el día en tareas repetitivas. Desde entonces, diseñamos automatizaciones con inteligencia artificial que devuelven tiempo a las personas y permiten que la operación crezca sin aumentar el esfuerzo.'
    )
  )
) ON CONFLICT (key) DO NOTHING;

-- 5) seed current projects
INSERT INTO public.projects (slug, title, category, summary, context, automation, solution, result, interaction_type, interaction_label, published, sort_order)
VALUES
(
  'automacao-de-pre-impressao',
  '{"pt":"Automação de pré-impressão","en":"Prepress automation","es":"Automatización de preimpresión"}',
  '{"pt":"Automação Gráfica","en":"Print Automation","es":"Automatización Gráfica"}',
  '{"pt":"Conferência e preparação automática de arquivos gráficos antes da produção.","en":"Automatic checking and preparation of print files before production.","es":"Verificación y preparación automática de archivos gráficos antes de la producción."}',
  '{"pt":"A equipe técnica revisava manualmente cada arquivo recebido, o que gerava filas, retrabalho e atrasos na produção.","en":"The technical team manually reviewed every incoming file, creating queues, rework and production delays.","es":"El equipo técnico revisaba manualmente cada archivo recibido, generando colas, retrabajos y retrasos en la producción."}',
  '{"pt":"Verificação de sangria, cores, fontes e imposição, com sinalização automática de problemas.","en":"Bleed, color, font and imposition checks, with automatic flagging of issues.","es":"Verificación de sangrado, colores, fuentes e imposición, con señalización automática de problemas."}',
  '{"pt":"Fluxo automatizado de preflight integrado ao recebimento dos arquivos, com relatório enviado ao responsável.","en":"Automated preflight flow integrated with file intake, with a report sent to the owner.","es":"Flujo automatizado de preflight integrado con la recepción de archivos, con informe enviado al responsable."}',
  '{"pt":"Redução expressiva de retrabalho e equipe técnica liberada para tarefas de decisão.","en":"Significant rework reduction and a technical team freed up for decision-making.","es":"Reducción notable de retrabajos y equipo técnico liberado para tareas de decisión."}',
  'details',
  '{"pt":"Ver projeto","en":"View project","es":"Ver proyecto"}',
  true, 1
),
(
  'qualificacao-automatica-de-leads',
  '{"pt":"Qualificação automática de leads","en":"Automatic lead qualification","es":"Calificación automática de leads"}',
  '{"pt":"Automação Comercial","en":"Sales Automation","es":"Automatización Comercial"}',
  '{"pt":"Triagem, enriquecimento e distribuição automática dos contatos recebidos.","en":"Automatic triage, enrichment and routing of incoming contacts.","es":"Triaje, enriquecimiento y distribución automática de los contactos recibidos."}',
  '{"pt":"Contatos chegavam por canais diferentes e ficavam horas sem resposta, sem critério claro de prioridade.","en":"Contacts arrived through different channels and waited hours for a reply, with no clear priority criteria.","es":"Los contactos llegaban por canales distintos y esperaban horas sin respuesta, sin criterio claro de prioridad."}',
  '{"pt":"Coleta dos contatos, enriquecimento de dados, classificação por potencial e envio ao vendedor certo.","en":"Contact capture, data enrichment, potential scoring and routing to the right rep.","es":"Captura de contactos, enriquecimiento de datos, clasificación por potencial y envío al vendedor adecuado."}',
  '{"pt":"Integração entre formulários, WhatsApp e CRM com regras de roteamento e IA de classificação.","en":"Integration between forms, WhatsApp and CRM with routing rules and AI scoring.","es":"Integración entre formularios, WhatsApp y CRM con reglas de enrutamiento y IA de clasificación."}',
  '{"pt":"Resposta muito mais rápida ao cliente e um funil organizado sem trabalho manual.","en":"Much faster response to customers and an organized funnel with no manual work.","es":"Respuesta mucho más rápida al cliente y un embudo organizado sin trabajo manual."}',
  'details',
  '{"pt":"Ver projeto","en":"View project","es":"Ver proyecto"}',
  true, 2
),
(
  'leitura-inteligente-de-documentos',
  '{"pt":"Leitura inteligente de documentos","en":"Intelligent document reading","es":"Lectura inteligente de documentos"}',
  '{"pt":"IA Aplicada","en":"Applied AI","es":"IA Aplicada"}',
  '{"pt":"Extração de dados de notas, contratos e planilhas com validação assistida.","en":"Data extraction from invoices, contracts and spreadsheets with assisted validation.","es":"Extracción de datos de facturas, contratos y hojas de cálculo con validación asistida."}',
  '{"pt":"Documentos chegavam em formatos variados e eram digitados manualmente em vários sistemas.","en":"Documents arrived in varied formats and were manually typed into several systems.","es":"Los documentos llegaban en formatos variados y se digitaban manualmente en varios sistemas."}',
  '{"pt":"Leitura dos documentos, extração dos campos relevantes e gravação nos sistemas de destino.","en":"Document reading, extraction of relevant fields and writing to target systems.","es":"Lectura de documentos, extracción de campos relevantes y registro en los sistemas de destino."}',
  '{"pt":"Modelos de IA para extração, com etapa de revisão humana somente nos casos de baixa confiança.","en":"AI models for extraction, with human review only on low-confidence cases.","es":"Modelos de IA para extracción, con revisión humana solo en casos de baja confianza."}',
  '{"pt":"Digitação praticamente eliminada e histórico consultável de tudo que foi processado.","en":"Manual typing nearly eliminated and a searchable history of everything processed.","es":"Digitación casi eliminada e historial consultable de todo lo procesado."}',
  'details',
  '{"pt":"Ver projeto","en":"View project","es":"Ver proyecto"}',
  true, 3
),
(
  'relatorios-operacionais-automaticos',
  '{"pt":"Relatórios operacionais automáticos","en":"Automated operational reports","es":"Informes operativos automáticos"}',
  '{"pt":"Automação de Dados","en":"Data Automation","es":"Automatización de Datos"}',
  '{"pt":"Coleta de indicadores em múltiplas fontes e montagem periódica dos relatórios.","en":"Metric collection across multiple sources and scheduled report assembly.","es":"Recolección de indicadores en múltiples fuentes y armado periódico de informes."}',
  '{"pt":"A consolidação dos números era feita à mão em planilhas, sempre com atraso e risco de erro.","en":"Numbers were consolidated by hand in spreadsheets, always late and error-prone.","es":"La consolidación de los números se hacía a mano en hojas de cálculo, siempre con retraso y riesgo de error."}',
  '{"pt":"Extração dos dados nas fontes, cálculo dos indicadores e distribuição automática dos relatórios.","en":"Data extraction from sources, metric calculation and automatic report distribution.","es":"Extracción de datos de las fuentes, cálculo de indicadores y distribución automática de informes."}',
  '{"pt":"Pipeline agendado de dados com painel de acompanhamento e envio programado por e-mail.","en":"Scheduled data pipeline with a tracking dashboard and scheduled email delivery.","es":"Pipeline programado de datos con panel de seguimiento y envío programado por correo."}',
  '{"pt":"Informação pronta no início do dia, sem consolidação manual de planilhas.","en":"Information ready at the start of the day, with no manual spreadsheet work.","es":"Información lista al inicio del día, sin consolidación manual de hojas de cálculo."}',
  'details',
  '{"pt":"Ver projeto","en":"View project","es":"Ver proyecto"}',
  true, 4
)
ON CONFLICT (slug) DO NOTHING;