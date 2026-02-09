-- CORREÇÃO DE PERMISSÕES PARA ANÔNIMOS
-- Execute este script no SQL Editor do Supabase para corrigir o erro 42501

-- 1. Garantir que a tabela projects permite inserts de anônimos (role 'anon')
GRANT INSERT ON public.projects TO anon;
GRANT SELECT ON public.projects TO anon; -- Opcional, se precisar ler o retorno

-- 2. Garantir que a sequence (auto-incremento/uuid) seja acessível
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 3. Reforçar a Politica RLS (Row Level Security)
-- Removemos a antiga para evitar conflitos
DROP POLICY IF EXISTS "Public create projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can create projects" ON public.projects;

-- Cria uma política que permite TUDO para insert (pois validamos no backend/frontend quem é quem)
CREATE POLICY "Enable insert for everyone" ON public.projects
    FOR INSERT 
    WITH CHECK (true);

-- 4. Garantir que client_id seja opcional (caso o script anterior não tenha rodado)
ALTER TABLE public.projects 
ALTER COLUMN client_id DROP NOT NULL;

-- 5. Se as colunas novas não existirem, cria agora
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_name text,
ADD COLUMN IF NOT EXISTS client_email text,
ADD COLUMN IF NOT EXISTS client_whatsapp text;
