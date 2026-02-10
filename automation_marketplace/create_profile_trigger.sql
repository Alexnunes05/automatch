-- AUTO-CREATE PROFILE TRIGGER
-- Este script garante que todo usuário criado no Auth (auth.users) gerará automaticamente um perfil em public.profiles.

-- 1. Função que será executada pelo Trigger
create or replace function public.handle_new_user()
returns trigger
security definer -- Roda com privilégios de sistema (necessário para insert)
set search_path = public -- Segurança
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name, -- Tentar pegar do metadata ou usar email
    active,    -- Default true solicitado
    role       -- Default user
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    true,      -- Requisito: active = true
    'user'     -- Default role
  )
  on conflict (id) do nothing; -- Evita duplicação se o perfil já existir

  return new;
end;
$$ language plpgsql;

-- 2. Trigger na tabela auth.users
-- Dropa se já existir para atualizar
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Comentário de Sucesso
select 'Trigger criado com sucesso: Usuários novos agora terão perfil automaticamente.' as status;
