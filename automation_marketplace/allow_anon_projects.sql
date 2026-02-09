-- PERMITIR PEDIDOS ANÔNIMOS (SEM LOGIN)
-- Execute este script no SQL Editor do Supabase

-- 1. Tornar client_id opcional
ALTER TABLE public.projects 
ALTER COLUMN client_id DROP NOT NULL;

-- 2. Adicionar campos de contato direto na tabela projects
-- (Já que não teremos um perfil de usuário linkado para anônimos)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_name text,
ADD COLUMN IF NOT EXISTS client_email text,
ADD COLUMN IF NOT EXISTS client_whatsapp text;

-- 3. Atualizar Políticas de Segurança (RLS)
-- Permitir que qualquer um (anon) insira projetos
DROP POLICY IF EXISTS "Clients can create projects" ON public.projects;

CREATE POLICY "Public create projects" ON public.projects
    FOR INSERT WITH CHECK (true);

-- Nota: Anônimos não poderão VER os projetos depois de criados (apenas o gestor vê),
-- a menos que a gente crie uma lógica de token/cookie, mas para "pedir orçamento" isso basta.
