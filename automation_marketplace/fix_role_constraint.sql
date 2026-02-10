-- FIX: Corrigir restrição (Constraint) na coluna ROLE da tabela PROFILES

-- 1. Tentar remover constraints restritivas antigas (nomes comuns)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_check_role;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_role;

-- 2. Adicionar nova constraint permitindo múltiplos papéis
-- Isso garante que 'user' (que estamos tentando inserir) seja aceito
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'expert', 'admin', 'client'));

-- 3. (Opcional) Garantir que status também aceite 'pending', 'active' etc
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
-- Não vamos adicionar constraint de status agora para evitar travamentos, deixa livre por enquanto.

-- O trigger handle_new_user já está configurado para inserir 'user', então agora deve passar.
