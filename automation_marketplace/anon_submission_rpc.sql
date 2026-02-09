-- FUNÇÃO PARA ENVIO DE PROJETOS ANÔNIMOS (Bypass RLS)
-- Execute este script no SQL Editor do Supabase

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
SECURITY DEFINER -- Roda com permissões de admin (bypassa RLS)
AS $$
DECLARE
    new_project_id uuid;
    match_result jsonb;
BEGIN
    -- 1. Inserir o Projeto
    INSERT INTO public.projects (
        client_id, -- Será NULL
        client_name,
        client_email,
        client_whatsapp,
        title,
        description,
        budget,
        status
    ) VALUES (
        NULL,
        p_client_name,
        p_client_email,
        p_client_whatsapp,
        p_title,
        p_description,
        p_budget,
        'open'
    )
    RETURNING id INTO new_project_id;

    -- 2. Chamar o Smart Queue para encontrar um gestor
    -- (Como estamos dentro de uma função, podemos chamar a outra direto)
    match_result := public.rpc_create_offer_for_project(new_project_id);

    -- 3. Retornar sucesso e ID
    RETURN jsonb_build_object(
        'success', true,
        'project_id', new_project_id,
        'match_result', match_result
    );
END;
$$;

-- Garantir que anônimos podem chamar esta função
GRANT EXECUTE ON FUNCTION public.rpc_submit_project_anon TO anon;
GRANT EXECUTE ON FUNCTION public.rpc_submit_project_anon TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_submit_project_anon TO service_role;
