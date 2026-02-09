-- Adicionar colunas de assinatura na tabela profiles
alter table public.profiles
add column subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'past_due', 'canceled')),
add column subscription_id text, -- ID da assinatura no Stripe (ou n8n tracking)
add column subscription_plan text default 'free'; -- 'expert_pro' etc.

-- Política de Segurança (RLS) atualizada
-- O próprio usuário continua podendo ver seu perfil (já existe policy)
-- O admin pode ver tudo (já existe ou é service_role)

-- Comentário para o usuário:
-- Após rodar isso, seus usuários terão o campo 'subscription_status'.
-- O fluxo será:
-- 1. Usuário paga no Stripe
-- 2. Stripe avisa n8n
-- 3. n8n atualiza subscription_status para 'active' no Supabase
