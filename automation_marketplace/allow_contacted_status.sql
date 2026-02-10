-- FIX: Atualizar constraints de status para incluir 'contacted'

-- 1. Remover a constraint antiga que limita os status
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- 2. Adicionar a nova constraint com os status permitidos, incluindo 'contacted'
ALTER TABLE public.projects
    ADD CONSTRAINT projects_status_check
    CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'contacted'));

-- Opcional: Se houver tipos/enums no banco, a abordagem acima é mais segura para texto simples.
-- Se o campo status for um TYPE Enum, o comando seria diferente (ALTER TYPE ... ADD VALUE), mas geralmente em Supabase é texto com constraint.
