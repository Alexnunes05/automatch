-- check_constraints_triggers.sql

-- 1. Listar Constraints da tabela profiles
SELECT conname as constraint_name, pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' AND conrelid = 'public.profiles'::regclass;

-- 2. Listar Triggers da tabela profiles
SELECT tgname as trigger_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles';
