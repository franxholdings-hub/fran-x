
-- knowledge base
CREATE TABLE public.knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  reference_code text,
  tags text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean NOT NULL DEFAULT false,
  is_confidential boolean NOT NULL DEFAULT false,
  valid_until date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;
GRANT ALL ON public.knowledge_base TO service_role;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kb admin all" ON public.knowledge_base FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AI agents
CREATE TABLE public.ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  domains text[] NOT NULL DEFAULT '{}',
  system_prompt text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'openai/gpt-5.6-terra',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_agents TO authenticated;
GRANT ALL ON public.ai_agents TO service_role;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents admin all" ON public.ai_agents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- AI settings (singleton row)
CREATE TABLE public.ai_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  ai_enabled boolean NOT NULL DEFAULT true,
  tone text NOT NULL DEFAULT 'Professional, intelligent, concise and corporate',
  business_hours text NOT NULL DEFAULT 'Mon-Fri 9:00-18:00 WAT',
  base_instructions text NOT NULL DEFAULT '',
  escalation_rules text NOT NULL DEFAULT 'Escalate on human request, negotiation, high-value transactions, sensitive documents, legal or regulatory judgement, custom proposals, physical verification.',
  scoring_rules jsonb NOT NULL DEFAULT '{"requirement":20,"budget":20,"timeline":15,"contact":20,"fit":15,"urgency":10}'::jsonb,
  hot_threshold int NOT NULL DEFAULT 75,
  warm_threshold int NOT NULL DEFAULT 50,
  cold_threshold int NOT NULL DEFAULT 25,
  show_score_to_user boolean NOT NULL DEFAULT false,
  allowed_services text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;
GRANT ALL ON public.ai_settings TO service_role;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings admin all" ON public.ai_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.ai_settings (id) VALUES (true);

-- conversations
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  visitor_id text,
  agent_slug text NOT NULL DEFAULT 'business',
  category text,
  status text NOT NULL DEFAULT 'active',
  lead_score int,
  classification text,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  collected jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_flags text[] NOT NULL DEFAULT '{}',
  escalated boolean NOT NULL DEFAULT false,
  escalation_reason text,
  inquiry_id uuid,
  message_count int NOT NULL DEFAULT 0,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv admin all" ON public.ai_conversations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "conv own read" ON public.ai_conversations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  agent_slug text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_messages_conv_idx ON public.ai_messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_messages TO authenticated;
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aimsg admin all" ON public.ai_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "aimsg own read" ON public.ai_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- unknown questions
CREATE TABLE public.ai_unknown_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  category text,
  conversation_id uuid,
  times_asked int NOT NULL DEFAULT 1,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_unknown_questions TO authenticated;
GRANT ALL ON public.ai_unknown_questions TO service_role;
ALTER TABLE public.ai_unknown_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unk admin all" ON public.ai_unknown_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- callback requests
CREATE TABLE public.callback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid,
  inquiry_id uuid,
  full_name text,
  contact_method text,
  contact_value text,
  preferred_date text,
  preferred_time text,
  timezone text,
  reason text,
  status text NOT NULL DEFAULT 'Requested',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.callback_requests TO authenticated;
GRANT ALL ON public.callback_requests TO service_role;
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cb admin all" ON public.callback_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- departments and staff
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  routing_keywords text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dept admin all" ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.staff_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, department_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_assignments TO authenticated;
GRANT ALL ON public.staff_assignments TO service_role;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff admin all" ON public.staff_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "staff own read" ON public.staff_assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

INSERT INTO public.departments (name, description, routing_keywords) VALUES
  ('Sales','First-line commercial enquiries', ARRAY['pricing','quote','buy']),
  ('Business Development','Partnerships, investment and acquisitions', ARRAY['partnership','investment','acquisition']),
  ('Real Estate','Property sourcing, sales and leasing', ARRAY['property','land','house','rent']),
  ('Automotive','Vehicle sourcing and sales', ARRAY['car','vehicle','truck']),
  ('Energy','Oil, gas and energy transactions', ARRAY['oil','gas','fuel','crude']),
  ('Technology','Websites, apps, AI and software', ARRAY['website','app','software','ai']),
  ('Customer Support','General support and follow-up', ARRAY['support','help']),
  ('Project Management','Delivery of active projects', ARRAY['project','milestone','delivery']);

INSERT INTO public.ai_agents (slug, name, description, domains, system_prompt, model, sort_order) VALUES
  ('business','FRIX Business AI','General FRAN-X business enquiries and company information', ARRAY['general','company','consulting','faq'], 'Handle general business enquiries about FRAN-X Holdings, its companies, services and processes.', 'openai/gpt-5.6-terra', 1),
  ('tech','FRIX Tech AI','Websites, mobile apps, software, AI, APIs and digital solutions', ARRAY['website','mobile app','software','ai','api','e-commerce'], 'Qualify technology projects. Ask about business type, website/app type, required features, number of pages, e-commerce and payment needs, timeline, budget range, country and contact details.', 'openai/gpt-5.6-terra', 2),
  ('property','FRIX Property AI','Real estate sourcing, sales and leasing', ARRAY['property','real estate','land','house','rent'], 'Qualify property enquiries: property type, location, budget, purpose, required size, purchase or rental, timeline. Only reference properties present and verified in the knowledge base.', 'openai/gpt-5.6-terra', 3),
  ('auto','FRIX Auto AI','Vehicle sourcing and automotive enquiries', ARRAY['car','vehicle','automotive','truck'], 'Qualify vehicle enquiries: vehicle type, make, model, year range, budget, location, condition, purchase timeline. Only reference vehicles present and verified in the knowledge base.', 'openai/gpt-5.6-terra', 4),
  ('energy','FRIX Energy AI','Oil, gas and energy opportunities', ARRAY['oil','gas','energy','crude','lng','diesel'], 'Qualify energy enquiries with strict regulatory care: role, buyer/seller/supplier/off-taker, product, quantity, location, transaction requirements, documentation available, company information, contact information. Never confirm buyers, sellers, cargoes or prices that are not verified in the knowledge base.', 'openai/gpt-5.6-sol', 5),
  ('bizdev','FRIX Business Development AI','Partnerships, investments, acquisitions and strategic opportunities', ARRAY['partnership','investment','acquisition','strategic','agriculture','hospitality','aviation'], 'Qualify partnership, investment and acquisition opportunities. Capture the opportunity type, structure, capital involved, jurisdiction, documentation and contact details.', 'openai/gpt-5.6-sol', 6);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER kb_updated BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER conv_updated BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
