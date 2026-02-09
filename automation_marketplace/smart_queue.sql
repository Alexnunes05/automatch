-- SMART QUEUE SYSTEM IMPLEMENTATION
-- 2024 - Marketplace Automation
-- Execute this script in Supabase SQL Editor

-- ==============================================================================
-- 1. SCHEMA & TABLES
-- ==============================================================================

-- 1.1. Update PROFILES (Managers)
-- Adding fields for ranking and availability
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS max_active_jobs integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS active_jobs_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_assigned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS paused_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS avg_rating numeric(3,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS accept_rate_30d numeric(5,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS total_offers_last_24h integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS expired_offers_last_24h integer DEFAULT 0;

-- Index for fast ranking query
CREATE INDEX IF NOT EXISTS idx_profiles_ranking ON public.profiles (role, is_active, active_jobs_count, last_assigned_at);

-- 1.2. PROJECTS Table (New Lead System)
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES auth.users(id) NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    budget numeric(10,2),
    deadline timestamp with time zone,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'offered', 'accepted', 'in_progress', 'delivered', 'closed', 'cancelled')),
    assigned_manager_id uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Assigned managers can see project" ON public.projects
    FOR SELECT USING (auth.uid() = assigned_manager_id);

-- 1.3. PROJECT OFFERS (The Queue Mechanism)
CREATE TABLE IF NOT EXISTS public.project_offers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    manager_id uuid REFERENCES public.profiles(id) NOT NULL,
    status text NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'declined', 'expired')),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for expiration check and finding active offers
CREATE INDEX IF NOT EXISTS idx_offers_project_active ON public.project_offers (project_id) WHERE status = 'offered';
CREATE INDEX IF NOT EXISTS idx_offers_expiration ON public.project_offers (expires_at) WHERE status = 'offered';

-- RLS for Offers
ALTER TABLE public.project_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see their own offers" ON public.project_offers
    FOR SELECT USING (auth.uid() = manager_id);

-- 1.4. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL,
    user_id uuid, -- Optional, system events might be null
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 2. RPC FUNCTIONS (CORE LOGIC)
-- ==============================================================================

-- 2.1. CREATE OFFER FOR PROJECT (The Matchmaker)
-- This function finds the best manager and creates an offer
CREATE OR REPLACE FUNCTION public.rpc_create_offer_for_project(target_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Run as superuser to bypass RLS during assignment
AS $$
DECLARE
    selected_manager_id uuid;
    new_offer_id uuid;
    proj_record record;
BEGIN
    -- 1. Lock Project to prevent race conditions
    SELECT * INTO proj_record FROM public.projects 
    WHERE id = target_project_id 
    FOR UPDATE;

    IF proj_record.status NOT IN ('open', 'offered') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Project not available');
    END IF;

    -- 2. Check if there is already an active offer
    PERFORM 1 FROM public.project_offers 
    WHERE project_id = target_project_id AND status = 'offered';
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Active offer already exists');
    END IF;

    -- 3. FIND BEST MANAGER (Smart Queue Logic)
    -- Using FOR UPDATE SKIP LOCKED to ensure concurrency safety
    SELECT id INTO selected_manager_id
    FROM public.profiles
    WHERE role = 'expert'
      AND is_active = true
      AND (paused_until IS NULL OR paused_until < now())
      AND active_jobs_count < max_active_jobs
      -- Exclude managers who already received this project (declined/expired)
      AND id NOT IN (
          SELECT manager_id FROM public.project_offers WHERE project_id = target_project_id
      )
    ORDER BY 
      active_jobs_count ASC,         -- 1) Least busy
      last_assigned_at ASC NULLS FIRST, -- 2) Longest waiting
      avg_rating DESC,               -- 3) Best ratings
      accept_rate_30d DESC           -- 4) Best reliability
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    -- 4. Create Offer or Handle No Match
    IF selected_manager_id IS NULL THEN
        -- No eligible manager found. Keep project 'open' but maybe log warning.
        -- Could initiate a fallback or admin alert here.
        RETURN jsonb_build_object('success', false, 'message', 'No eligible managers found');
    END IF;

    -- Insert Offer
    INSERT INTO public.project_offers (project_id, manager_id, expires_at)
    VALUES (target_project_id, selected_manager_id, now() + interval '30 minutes')
    RETURNING id INTO new_offer_id;

    -- Update Project Status
    UPDATE public.projects 
    SET status = 'offered' 
    WHERE id = target_project_id;

    -- Update Manager Metrics (Optional at this stage, usually on accept)
    UPDATE public.profiles
    SET total_offers_last_24h = total_offers_last_24h + 1
    WHERE id = selected_manager_id;

    -- Log
    INSERT INTO public.audit_logs (event_type, user_id, metadata)
    VALUES ('offer_created', selected_manager_id, jsonb_build_object('project_id', target_project_id, 'offer_id', new_offer_id));

    RETURN jsonb_build_object('success', true, 'offer_id', new_offer_id, 'manager_id', selected_manager_id);
END;
$$;


-- 2.2. ACCEPT OFFER
CREATE OR REPLACE FUNCTION public.rpc_accept_offer(offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offer_record record;
    manager_id_from_auth uuid;
BEGIN
    manager_id_from_auth := auth.uid(); -- Securely get caller ID

    -- Lock offer row
    SELECT * INTO offer_record FROM public.project_offers 
    WHERE id = offer_id 
    FOR UPDATE;

    -- Validation
    IF offer_record.status != 'offered' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Offer is not valid');
    END IF;

    IF offer_record.expires_at < now() THEN
        -- It expired just now. Mark as expired.
        UPDATE public.project_offers SET status = 'expired' WHERE id = offer_id;
        RETURN jsonb_build_object('success', false, 'message', 'Offer expired');
    END IF;

    IF offer_record.manager_id != manager_id_from_auth THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- EXECUTE ACCEPTANCE
    -- 1. Update Offer
    UPDATE public.project_offers 
    SET status = 'accepted' 
    WHERE id = offer_id;

    -- 2. Update Project
    UPDATE public.projects
    SET status = 'accepted', 
        assigned_manager_id = manager_id_from_auth,
        updated_at = now()
    WHERE id = offer_record.project_id;

    -- 3. Update Manager Stats
    UPDATE public.profiles
    SET active_jobs_count = active_jobs_count + 1,
        last_assigned_at = now()
    WHERE id = manager_id_from_auth;

    -- 4. Log
    INSERT INTO public.audit_logs (event_type, user_id, metadata)
    VALUES ('offer_accepted', manager_id_from_auth, jsonb_build_object('offer_id', offer_id));

    RETURN jsonb_build_object('success', true);
END;
$$;


-- 2.3. DECLINE OFFER
CREATE OR REPLACE FUNCTION public.rpc_decline_offer(offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offer_record record;
    project_id_var uuid;
BEGIN
    SELECT * INTO offer_record FROM public.project_offers WHERE id = offer_id FOR UPDATE;
    
    IF offer_record.manager_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    IF offer_record.status != 'offered' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid status');
    END IF;

    -- Update Offer
    UPDATE public.project_offers SET status = 'declined' WHERE id = offer_id;
    project_id_var := offer_record.project_id;

    -- Re-trigger matching for the project immediately
    PERFORM public.rpc_create_offer_for_project(project_id_var);

    RETURN jsonb_build_object('success', true);
END;
$$;


-- 2.4. EXPIRE AND REASSIGN (CRON JOB FUNCTION)
-- This function checks for expired offers AND attempts to assign stuck 'open' projects
CREATE OR REPLACE FUNCTION public.rpc_process_queue_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_offer record;
    pending_project record;
BEGIN
    -- A. Handle Expired Offers
    FOR expired_offer IN 
        SELECT po.id, po.manager_id, po.project_id 
        FROM public.project_offers po
        WHERE po.status = 'offered' AND po.expires_at < now()
        FOR UPDATE SKIP LOCKED -- Process safely in parallel if needed
    LOOP
        -- 1. Mark as expired
        UPDATE public.project_offers 
        SET status = 'expired' 
        WHERE id = expired_offer.id;

        -- 2. Penalize Manager (Logic: Check if > 3 expires in 24h)
        UPDATE public.profiles
        SET expired_offers_last_24h = expired_offers_last_24h + 1
        WHERE id = expired_offer.manager_id;
        
        -- Check for Cooldown Trigger
        UPDATE public.profiles
        SET paused_until = now() + interval '10 minutes'
        WHERE id = expired_offer.manager_id 
          AND expired_offers_last_24h >= 3;

        -- 3. Log
        INSERT INTO public.audit_logs (event_type, user_id, metadata)
        VALUES ('offer_expired', expired_offer.manager_id, jsonb_build_object('offer_id', expired_offer.id));
        
        -- 4. Re-queue Project: ensure it's marked as 'open' so it can be picked up
        UPDATE public.projects SET status = 'open' WHERE id = expired_offer.project_id;
    END LOOP;

    -- B. Process Open Projects (Retry assignment for any project sitting in 'open')
    FOR pending_project IN
        SELECT id FROM public.projects
        WHERE status = 'open'
        -- Optional: order by priority/deadline
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Attempt to create offer
        PERFORM public.rpc_create_offer_for_project(pending_project.id);
    END LOOP;
END;
$$;

-- IMPORTANT: You must schedule `select public.rpc_process_queue_updates();` to run every minute in pg_cron.
