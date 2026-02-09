-- SOLUÇÃO DEFINITIVA PARA ERRO RLS 42501
-- Execute este script COMPLETO no Supabase SQL Editor

-- 1. Limpar Políticas Antigas da Tabela Projects
DROP POLICY IF EXISTS "Clients can create projects" ON public.projects;
DROP POLICY IF EXISTS "Public create projects" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.projects;
DROP POLICY IF EXISTS "Clients see their own projects" ON public.projects;

-- 2. Criar Políticas Novas e Permissivas para Insert
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Permite que QUALQUER UM (anon ou logado) insira projetos
CREATE POLICY "Anyone can insert projects" ON public.projects
    FOR INSERT 
    WITH CHECK (true);

-- Permite selects básicos (necessário para o 'RETURNING id' funcionar em alguns casos)
CREATE POLICY "Any active policies for select" ON public.projects
    FOR SELECT
    USING (true);

-- 3. Garantir Permissões de Tabela e Sequence
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.projects TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 4. Recriar a Função RPC com SECURITY DEFINER (Ignora RLS internamente)
CREATE OR REPLACE FUNCTION public.rpc_submit_project_anon(
    p_client_name text,
    p_client_email text,
    p_client_whatsapp text,
    p_title text,
    p_description text,
    p_budget numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- IMPORTANTE: Roda como administrador
SET search_path = public -- IMPORTANTE: Segurança contra search_path hijacking
AS $$
DECLARE
    new_project_id uuid;
    match_result jsonb;
BEGIN
    -- Inserir
    INSERT INTO public.projects (
        client_id,
        client_name,
        client_email,
        client_whatsapp,
        title,
        description,
        budget,
        status
    ) VALUES (
        NULL, -- Anônimo
        p_client_name,
        p_client_email,
        p_client_whatsapp,
        p_title,
        p_description,
        p_budget,
        'open'
    )
    RETURNING id INTO new_project_id;

    -- Tentar match (pode falhar sem erro crítico)
    BEGIN
        match_result := public.rpc_create_offer_for_project(new_project_id);
    EXCEPTION WHEN OTHERS THEN
        match_result := jsonb_build_object('error', SQLERRM);
    END;

    RETURN jsonb_build_object(
        'success', true,
        'project_id', new_project_id,
        'match_result', match_result
    );
END;
$$;

-- 5. Garantir permissão de execução na função
GRANT EXECUTE ON FUNCTION public.rpc_submit_project_anon TO anon, authenticated, service_role;
