-- CORREÇÃO DE ERRO 422 NO CADASTRO (SUPABASE)
-- Execute este script no SQL Editor do Supabase para garantir que a tabela profiles e o trigger existam corretamente.

-- 1. Cria a tabela profiles se não existir
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'client',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilita RLS (Segurança)
alter table public.profiles enable row level security;

-- 3. Policies (Permissões de acesso)
-- Leitura pública de perfis (necessário para marketplace ver nome do expert, etc)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

-- Usuário pode atualizar seu próprio perfil
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Função Trigger para criar perfil automaticamente ao cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Recria o Trigger na tabela auth.users
-- Dropa primeiro para evitar duplicação ou erro
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Opcional: Garante que perfis faltantes sejam criados (para usuários já existentes)
insert into public.profiles (id, email, full_name, role)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', 'Usuário Sem Nome'),
  coalesce(raw_user_meta_data->>'role', 'client')
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
