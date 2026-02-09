-- 1. Adicionar coluna phone na tabela profiles
alter table public.profiles
add column if not exists phone text;

-- 2. Atualizar a função do trigger para salvar o telefone dos metadados
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'phone' -- Pega o telefone dos metadados
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recarregar configurações
NOTIFY pgrst, 'reload config';

select 'Coluna phone adicionada e trigger atualizado com sucesso' as status;
