-- 1. Tabela de Templates
create table public.templates (
  id uuid default gen_random_uuid() primary key,
  expert_id uuid references auth.users not null,
  title text not null,
  slug text, -- Opcional, para URL amigável
  short_description text,
  full_description text,
  category text, -- Vendas, Atendimento, Financeiro, Marketing, IA
  tools jsonb default '[]'::jsonb, -- Array de strings: ["n8n", "Zapier"]
  integrations jsonb default '[]'::jsonb, -- Array de strings: ["WhatsApp", "Sheets"]
  difficulty text, -- Iniciante, Intermediário, Avançado
  delivery_type text, -- download, instalacao, ambos
  price numeric(10,2) default 0,
  preview_images jsonb default '[]'::jsonb, -- URLs das imagens
  template_file_url text, -- Link para download ou privado
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Pedidos (Template Orders)
create table public.template_orders (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.templates not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_whatsapp text,
  order_type text check (order_type in ('download', 'instalacao')),
  status text default 'novo' check (status in ('novo', 'em_conversa', 'entregue', 'cancelado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar RLS
alter table public.templates enable row level security;
alter table public.template_orders enable row level security;

-- 4. Policies para TEMPLATES

-- Leitura pública apenas de templates PUBLICADOS
create policy "Templates publicados são públicos"
  on public.templates for select
  using ( status = 'published' );

-- Experts podem ver TODOS os SEUS templates (rascunho ou publicado)
create policy "Experts veem seus próprios templates"
  on public.templates for select
  using ( auth.uid() = expert_id );

-- Experts podem criar templates (vinculados a si mesmos)
create policy "Experts podem criar templates"
  on public.templates for insert
  with check ( auth.uid() = expert_id );

-- Experts podem atualizar seus próprios templates
create policy "Experts podem atualizar seus templates"
  on public.templates for update
  using ( auth.uid() = expert_id );

-- Experts podem deletar seus próprios templates
create policy "Experts podem deletar seus templates"
  on public.templates for delete
  using ( auth.uid() = expert_id );

-- 5. Policies para TEMPLATE ORDERS

-- Qualquer um (Anon ou Logado) pode criar um pedido
create policy "Qualquer um pode fazer pedido de template"
  on public.template_orders for insert
  with check ( true );

-- Apenas o DONO do template (Expert) pode ver os pedidos dos SEUS templates
-- Isso exige um JOIN, que em RLS pode ser custoso, mas funcional para MVP.
-- Uma alternativa performática é desnormalizar e salvar expert_id na order, 
-- mas aqui faremos via EXISTS para manter a normalização.
create policy "Experts veem pedidos de seus templates"
  on public.template_orders for select
  using (
    exists (
      select 1 from public.templates
      where templates.id = template_orders.template_id
      and templates.expert_id = auth.uid()
    )
  );

-- Experts podem atualizar status dos pedidos de seus templates
create policy "Experts gerenciam pedidos de seus templates"
  on public.template_orders for update
  using (
    exists (
      select 1 from public.templates
      where templates.id = template_orders.template_id
      and templates.expert_id = auth.uid()
    )
  );
