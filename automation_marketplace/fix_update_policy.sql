-- FIX: Permitir que gestores atualizem o status dos projetos atribuídos a eles

-- 1. Habilitar RLS (já deve estar habilitado, mas por garantia)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Remover política de update anterior se existir (para evitar conflitos)
DROP POLICY IF EXISTS "Managers can update their assigned projects" ON public.projects;

-- 3. Criar a política de atualização restrita ao gestor responsável
CREATE POLICY "Managers can update their assigned projects"
    ON public.projects
    FOR UPDATE
    USING (auth.uid() = assigned_manager_id)
    WITH CHECK (auth.uid() = assigned_manager_id);

-- 4. Garantir permissões de UPDATE na tabela para users autenticados
GRANT UPDATE ON TABLE public.projects TO authenticated;
