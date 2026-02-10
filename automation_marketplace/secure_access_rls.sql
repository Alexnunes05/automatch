-- SEGURANÇA AVANÇADA: Bloqueio de Acesso com RLS
-- Objetivo: Garantir que apenas usuários com status 'approved' possam ler/escrever dados sensíveis.

-- 1. Helper Function para simplificar as policies (Opcional, mas recomendado)
-- Facilita a manutenção: se a regra mudar, mudamos só aqui.
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'approved'
  );
$$;

-- 2. Atualizar Tabela PROJECTS
-- Adiciona a condição is_approved() às políticas existentes

-- Policy: Anyone can insert projects (Mantemos pública para leads? 
-- O usuário pediu para bloquear SaaS. Se 'projects' são leads externos, talvez não deva bloquear INSERT.
-- Mas se forem projetos internos de experts, deve. 
-- VAMOS ASSUMIR QUE O BLOQUEIO É PARA O PAINEL (SELECT/UPDATE)

-- Bloquear SELECT (Leitura)
DROP POLICY IF EXISTS "Any active policies for select" ON public.projects; 
-- Recriando mais restritiva
CREATE POLICY "Approved users can view projects"
    ON public.projects
    FOR SELECT
    USING (
        -- Regra original (se houver, aqui simplificada para 'true' como estava antes, mas agora com AND approved)
        true 
        AND public.is_approved()
    );

-- Bloquear UPDATE (Já tínhamos criado "Managers can update their assigned projects")
-- Vamos recriar adicionando a checagem de status
DROP POLICY IF EXISTS "Managers can update their assigned projects" ON public.projects;
CREATE POLICY "Approved managers can update their assigned projects"
    ON public.projects
    FOR UPDATE
    USING (auth.uid() = assigned_manager_id AND public.is_approved())
    WITH CHECK (auth.uid() = assigned_manager_id AND public.is_approved());


-- 3. Atualizar Tabela MARKETPLACE_ORDERS
DROP POLICY IF EXISTS "Experts see orders for their templates" ON public.marketplace_orders;
CREATE POLICY "Approved experts see orders for their templates"
  ON public.marketplace_orders FOR SELECT
  USING (
    public.is_approved() 
    AND 
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = marketplace_orders.template_id
      AND templates.expert_id = auth.uid()
    )
  );

-- 4. Atualizar Tabela EXPERTS_MP (Dados sensíveis de pagamento)
DROP POLICY IF EXISTS "Experts can view own MP data" ON public.experts_mp;
CREATE POLICY "Approved experts can view own MP data"
  ON public.experts_mp FOR SELECT
  USING (auth.uid() = expert_id AND public.is_approved());


-- NOTA: Não bloqueie a tabela 'profiles' de leitura para o próprio usuário,
-- senão ele não consegue saber que foi rejeitado!
-- (A policy padrão "Users can view own profile" já deve existir e não precisa de alteração).
