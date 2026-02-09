-- CORREÇÃO: ADICIONAR COLUNAS DE DATA NA TABELA PROFILES
-- Execute este script no SQL Editor do Supabase se estiver recebendo erro de 'updated_at'.

alter table public.profiles
add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null,
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Recarregar schema cache (geralmente automático, mas bom garantir)
NOTIFY pgrst, 'reload config';

select 'Colunas de data verificadas com sucesso' as status;
