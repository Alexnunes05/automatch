-- MARKETPLACE TRANSITION MIGRATION
-- Objective: Switch from Auto-Assign to Open Marketplace with Proposals

-- 1. Create project_proposals table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_proposals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    manager_id uuid NOT NULL REFERENCES auth.users(id),
    cover_letter text,
    proposed_budget numeric,
    proposed_deadline text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for proposals
ALTER TABLE public.project_proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Managers can view their own proposals
CREATE POLICY "Managers can view own proposals" ON public.project_proposals
    FOR SELECT USING (auth.uid() = manager_id);

-- Policy: Managers can insert their own proposals
CREATE POLICY "Managers can insert own proposals" ON public.project_proposals
    FOR INSERT WITH CHECK (auth.uid() = manager_id);

-- Policy: Managers can update/delete their own proposals (if needed)
CREATE POLICY "Managers can update own proposals" ON public.project_proposals
    FOR UPDATE USING (auth.uid() = manager_id);

-- 2. Update projects table (Expiration Logic)
-- ==============================================================================
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '15 days');

-- Optional: Update existing open projects to expire in 15 days if they don't have a date
UPDATE public.projects
SET expires_at = now() + interval '15 days'
WHERE status = 'open' AND expires_at IS NULL;

-- 3. Update Submission Logic (RPC)
-- ==============================================================================
-- We overwrite the existing rpc_submit_project_anon to STOP auto-distribution
-- and instead just leave the project as 'open' for the marketplace.

-- DROP existing function first to avoid signature conflicts
DROP FUNCTION IF EXISTS public.rpc_submit_project_anon(text,text,text,text,text,numeric,text,text,text);

CREATE OR REPLACE FUNCTION public.rpc_submit_project_anon(
    p_client_name text,
    p_client_email text,
    p_client_whatsapp text,
    p_title text,
    p_description text,
    p_budget numeric,
    p_deadline text,
    p_tools text,
    p_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_project_id uuid;
BEGIN
    -- Insert Project with 'open' status and 15-day expiration
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
        status,
        expires_at
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
        'open', -- Marketplace submission
        now() + interval '15 days' -- AUTO-EXPIRE IN 15 DAYS
    ) RETURNING id INTO new_project_id;

    -- Log
    INSERT INTO public.audit_logs (event_type, metadata)
    VALUES ('project_submitted_anon', jsonb_build_object('project_id', new_project_id));

    -- AUTO-DISTRIBUTION LOGIC REMOVED/SKIPPED
    -- The project is now visible in the "Marketplace Feed" for all managers to apply.

    RETURN jsonb_build_object('success', true, 'project_id', new_project_id);
END;
$$;
