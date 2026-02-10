-- 1. Dropar TODAS as assinaturas possíveis da função antiga para evitar conflito
DROP FUNCTION IF EXISTS public.rpc_submit_project_anon(text, text, text, text, text, numeric);
DROP FUNCTION IF EXISTS public.rpc_submit_project_anon(text, text, text, text, text, numeric, text, text, text);

-- 2. CORRIGIR TIPO DA COLUNA DEADLINE:
-- O erro anterior (42804) indica que 'deadline' era Timestamp, mas estamos enviando texto ("1 semana", "Imediato").
-- Vamos alterar para TEXT para aceitar qualquer formato descritivo.
ALTER TABLE public.projects ALTER COLUMN deadline TYPE text USING deadline::text;

-- 3. Adicionar colunas faltantes, se não existirem
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tools text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS automation_type text;

-- 4. Recriar a função RPC corrigida
CREATE OR REPLACE FUNCTION public.rpc_submit_project_anon(
    p_client_name text,
    p_client_email text,
    p_client_whatsapp text,
    p_title text,
    p_description text,
    p_budget numeric,
    p_deadline text DEFAULT NULL,
    p_tools text DEFAULT NULL,
    p_type text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_project_id uuid;
    match_result jsonb;
BEGIN
    INSERT INTO public.projects (
        client_name,
        client_email,
        client_whatsapp,
        title,
        description,
        budget,
        deadline,
        tools,
        automation_type,
        status
    ) VALUES (
        p_client_name,
        p_client_email,
        p_client_whatsapp,
        p_title,
        p_description,
        p_budget,
        p_deadline,
        p_tools,
        p_type,
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

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.rpc_submit_project_anon TO anon, authenticated, service_role;
