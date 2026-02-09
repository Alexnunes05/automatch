-- Primeiro, removemos políticas antigas para evitar conflitos
drop policy if exists "Qualquer um pode criar leads" on public.leads;
drop policy if exists "Experts veem leads novos ou seus próprios" on public.leads;
drop policy if exists "public_insert_leads" on public.leads;
drop policy if exists "authenticated_select_leads" on public.leads;
drop policy if exists "authenticated_update_leads" on public.leads;

-- Garante que RLS está ativo
alter table public.leads enable row level security;

-- 1. Permite INSERT para todos (Anon e Authenticated)
-- Isso corrige o erro "new row violates row-level security policy"
create policy "public_insert_leads"
on public.leads
for insert
to public -- 'public' inclui anon e authenticated
with check ( true );

-- 2. Permite SELECT apenas para usuários logados (Experts/Admins)
-- Isso protege os dados contra leitura pública
create policy "authenticated_select_leads"
on public.leads
for select
to authenticated
using ( true );

-- 3. Policy de UPDATE segura (Evita aceitar lead já atribuído)
drop policy if exists "authenticated_update_leads" on public.leads;
drop policy if exists "accept_lead_only_if_unassigned" on public.leads;

create policy "accept_lead_only_if_unassigned"
on public.leads
for update
to authenticated
using (assigned_expert_id is null)
with check (assigned_expert_id = auth.uid()); -- Garante que estou me atribuindo
