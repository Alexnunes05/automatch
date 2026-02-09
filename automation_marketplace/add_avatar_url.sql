-- ADICIONAR COLUNA AVATAR_URL NA TABELA PROFILES
-- Execute este script no SQL Editor do Supabase se estiver recebendo erro de 'avatar_url' missing.

alter table public.profiles
add column if not exists avatar_url text;

-- Recarregar schema cache
NOTIFY pgrst, 'reload config';

select 'Coluna avatar_url adicionada com sucesso' as status;
