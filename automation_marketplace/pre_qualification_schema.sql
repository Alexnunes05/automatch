-- Tabela para leads pré-qualificados
create table public.pre_qualified_leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  whatsapp text not null,
  objective text, -- Vendas, Atendimento, etc.
  urgency text, -- Imediata, 30 dias, Pesquisando
  budget_range text, -- Menos de 1500, 1500-3000, etc.
  aware_of_recurring boolean default false,
  qualified boolean default false, -- Se passou no filtro
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Segurança)
alter table public.pre_qualified_leads enable row level security;

-- Permitir inserção pública (qualquer um pode preencher)
create policy "Public insert pre_qualified_leads"
  on public.pre_qualified_leads for insert
  with check ( true );

-- Apenas admins/experts podem ver (opcional, mas boa prática)
create policy "Admins/Experts can view pre_qualified_leads"
  on public.pre_qualified_leads for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'expert')
    )
  );
