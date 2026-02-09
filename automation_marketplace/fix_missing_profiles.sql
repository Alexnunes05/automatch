-- Este script cria perfis para todos os usuários que já existem no Auth
-- mas ainda não têm registro na tabela 'profiles'.
-- Isso corrige o erro: "insert or update on table "leads" violates foreign key constraint"

insert into public.profiles (id, email, full_name, role, status)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', 'Usuário Sem Nome'), -- Se não tiver nome, usa padrão
  'expert', -- Define cargo como expert
  'approved' -- Auto-aprova para evitar bloqueios
from auth.users
where id not in (select id from public.profiles);

-- Confirmação
select count(*) as perfis_criados from public.profiles;
