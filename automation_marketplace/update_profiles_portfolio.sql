-- ATUALIZAÇÃO: PERFIL DE GESTOR E PORTFÓLIO
-- Execute este script no SQL Editor do Supabase.

-- 1. Adicionar colunas na tabela profiles (se não existirem)
alter table public.profiles
add column if not exists whatsapp text,
add column if not exists instagram text,
add column if not exists linkedin text,
add column if not exists bio text,
add column if not exists title text, -- Ex: "Especialista em n8n e Make"
add column if not exists portfolio_url text, -- Link externo opcional
add column if not exists skills text[], -- Array de habilidades: ['n8n', 'Python']
add column if not exists hourly_rate numeric; -- Valor hora técnica (opcional)

-- 2. Criar tabela de Portfólio (Projetos do Gestor)
create table if not exists public.portfolio_items (
  id uuid default gen_random_uuid() primary key,
  expert_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text, -- URL da imagem de capa do projeto
  project_link text, -- Link para o projeto ao vivo (se houver)
  tools_used text[], -- Array: ['Zapier', 'OpenAI']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar RLS na tabela de Portfólio
alter table public.portfolio_items enable row level security;

-- 4. Policies para Portfólio

-- Leitura Pública: Qualquer um pode ver os projetos
drop policy if exists "Portfolio items are public" on public.portfolio_items;
create policy "Portfolio items are public"
  on public.portfolio_items for select
  using ( true );

-- Escrita: Apenas o dono (expert) pode criar/editar/deletar seus próprios projetos
drop policy if exists "Experts manage own portfolio" on public.portfolio_items;
create policy "Experts manage own portfolio"
  on public.portfolio_items for all
  using ( auth.uid() = expert_id )
  with check ( auth.uid() = expert_id );

-- 5. Atualizar Policies de Profiles (para permitir edição dos novos campos)
-- (A policy "Users can update own profile" já deve existir do script anterior, 
-- mas reforçamos aqui para garantir que os novos campos sejam graváveis)

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Comentário de confirmação
select 'Atualização concluída com sucesso' as status;
