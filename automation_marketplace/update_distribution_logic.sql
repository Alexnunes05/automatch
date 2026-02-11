-- MIGRATION: ADJUST LEAD DISTRIBUTION LOGIC
-- Objective: Limit 10 projects, Fair Rotation, Acceptance Cooldown (2h)
-- FIXED: Expire time for new offers is 24h
-- FIXED: Update EXISTING open offers to 24h as well

-- 1. UPDATE SCHEMA (PROFILES)
-- ==============================================================================

-- A) Add 'last_accepted_at' for the 2h cooldown logic
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_accepted_at timestamp with time zone;

-- B) Update Max Active Jobs to 10
ALTER TABLE public.profiles
ALTER COLUMN max_active_jobs SET DEFAULT 10;

-- Update existing profiles that might have the old default (3)
UPDATE public.profiles 
SET max_active_jobs = 10 
WHERE max_active_jobs = 3;

-- Ensure subscription_status exists (safeguard based on previous findings)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_status text DEFAULT 'inactive';
    END IF;
END $$;


-- 2. UPDATE DISTRIBUTION LOGIC (MATCHING)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_create_offer_for_project(target_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Run as superuser to bypass RLS
AS $$
DECLARE
    selected_manager_id uuid;
    new_offer_id uuid;
    proj_record record;
BEGIN
    -- 1. Lock Project
    SELECT * INTO proj_record FROM public.projects 
    WHERE id = target_project_id 
    FOR UPDATE;

    IF proj_record.status NOT IN ('open', 'offered') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Project not available');
    END IF;

    -- 2. Check if active offer exists
    PERFORM 1 FROM public.project_offers 
    WHERE project_id = target_project_id AND status = 'offered';
    
    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Active offer already exists');
    END IF;

    -- 3. FIND BEST MANAGER (UPDATED LOGIC)
    
    SELECT id INTO selected_manager_id
    FROM public.profiles
    WHERE role = 'expert'
      AND is_active = true
      -- A) Only Active Subscribers (if column exists and is populated)
      -- COMMENT OUT THE NEXT LINE IF YOU ARE TESTING WITHOUT SUBSCRIPTIONS
      AND (subscription_status = 'active' OR subscription_status IS NULL) 
      
      -- B) Cooldown logic (Paused)
      AND (paused_until IS NULL OR paused_until < now())
      
      -- C) Limit 10 (or dynamic limit)
      AND active_jobs_count < 10 -- Hard limit as requested
      AND active_jobs_count < max_active_jobs -- dynamic limit if set lower
      
      -- Exclude managers who already received this project logic...
      AND id NOT IN (
          SELECT manager_id FROM public.project_offers WHERE project_id = target_project_id
      )
    ORDER BY 
      -- D) Fair Rotation: Least assignments recently
      total_offers_last_24h ASC,
      
      -- Tiebreakers
      active_jobs_count ASC,         -- Least current load
      last_assigned_at ASC NULLS FIRST, -- Longest waiting
      avg_rating DESC,               -- Best rating
      random()                       -- Random shuffle for distinct fairness
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    -- 4. Create Offer
    IF selected_manager_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nenhum gestor ativo e elegível encontrado no momento.');
    END IF;

    -- FIXED: 24h expiration
    INSERT INTO public.project_offers (project_id, manager_id, expires_at)
    VALUES (target_project_id, selected_manager_id, now() + interval '24 hours') 
    RETURNING id INTO new_offer_id;

    UPDATE public.projects 
    SET status = 'offered' 
    WHERE id = target_project_id;

    -- Update Stats
    UPDATE public.profiles
    SET total_offers_last_24h = total_offers_last_24h + 1
    WHERE id = selected_manager_id;

    -- Log
    INSERT INTO public.audit_logs (event_type, user_id, metadata)
    VALUES ('offer_created', selected_manager_id, jsonb_build_object('project_id', target_project_id, 'offer_id', new_offer_id));

    RETURN jsonb_build_object('success', true, 'offer_id', new_offer_id, 'manager_id', selected_manager_id);
END;
$$;


-- 3. UPDATE ACCEPTANCE LOGIC (COOLDOWN)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.rpc_accept_offer(offer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offer_record record;
    manager_id_from_auth uuid;
    manager_profile record;
    cooldown_interval interval := '2 hours';
    remaining_time interval;
BEGIN
    manager_id_from_auth := auth.uid(); 

    -- Get Manager Profile for Cooldown Check
    SELECT * INTO manager_profile FROM public.profiles WHERE id = manager_id_from_auth;

    -- A) COOLDOWN CHECK
    -- If last_accepted_at is within 2 hours, BLOCK.
    IF manager_profile.last_accepted_at IS NOT NULL 
       AND manager_profile.last_accepted_at > (now() - cooldown_interval) THEN
       
       remaining_time := (manager_profile.last_accepted_at + cooldown_interval) - now();
       
       RETURN jsonb_build_object(
           'success', false, 
           'message', 'Você já aceitou um projeto recentemente. Aguarde até ' || to_char(now() + remaining_time, 'HH24:MI') || ' para aceitar outro.'
       );
    END IF;

    -- Lock offer row
    SELECT * INTO offer_record FROM public.project_offers 
    WHERE id = offer_id 
    FOR UPDATE;

    -- Standard Validation
    IF offer_record.status != 'offered' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Offer is not valid');
    END IF;

    IF offer_record.expires_at < now() THEN
        UPDATE public.project_offers SET status = 'expired' WHERE id = offer_id;
        RETURN jsonb_build_object('success', false, 'message', 'Offer expired');
    END IF;

    IF offer_record.manager_id != manager_id_from_auth THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- EXECUTE ACCEPTANCE
    UPDATE public.project_offers 
    SET status = 'accepted' 
    WHERE id = offer_id;

    UPDATE public.projects
    SET status = 'accepted', 
        assigned_manager_id = manager_id_from_auth,
        updated_at = now()
    WHERE id = offer_record.project_id;

    -- B) UPDATE STATS & COOLDOWN MARKER
    UPDATE public.profiles
    SET active_jobs_count = active_jobs_count + 1,
        last_assigned_at = now(),
        last_accepted_at = now() -- Set the cooldown timer start
    WHERE id = manager_id_from_auth;

    -- Log
    INSERT INTO public.audit_logs (event_type, user_id, metadata)
    VALUES ('offer_accepted', manager_id_from_auth, jsonb_build_object('offer_id', offer_id));

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 4. FIX EXISTING OFFERS (Make them last 24h from NOW)
-- ==============================================================================
-- Running this will update any currently 'offered' item to expire 24h from now.
UPDATE public.project_offers
SET expires_at = now() + interval '24 hours'
WHERE status = 'offered' AND expires_at < (now() + interval '23 hours');
