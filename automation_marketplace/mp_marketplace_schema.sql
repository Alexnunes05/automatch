-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Tabela de Experts vinculados ao Mercado Pago (OAuth)
create table experts_mp (
  id uuid primary key default uuid_generate_v4(),
  expert_id uuid references auth.users(id) not null unique,
  mp_user_id text, -- ID do vendedor no Mercado Pago
  mp_access_token text not null, -- Token de acesso (criptografar se possível em produção)
  mp_refresh_token text not null,
  mp_token_expires_at timestamptz not null,
  payout_method text default 'mp_account', -- Por enquanto apenas conta MP
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS para experts_mp
alter table experts_mp enable row level security;

-- O expert só pode ver seus próprios dados
create policy "Experts can view own MP data"
  on experts_mp for select
  using (auth.uid() = expert_id);

-- O backend (service_role) tem acesso total (bypasses RLS),
-- mas se precisarmos de insert via front (não recomendado para tokens), bloqueamos:
create policy "Experts cannot insert/update MP tokens directly"
  on experts_mp for insert
  with check (false); -- Apenas via backend


-- 2. Tabela de Pedidos (Marketplace Orders)
create table marketplace_orders (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references templates(id) not null,
  buyer_name text not null,
  buyer_email text not null,
  buyer_whatsapp text,
  amount_total numeric not null, -- Valor total pago pelo cliente
  platform_fee_percent numeric default 5, -- Taxa da plataforma (%)
  platform_fee_amount numeric not null, -- Valor da taxa
  seller_net_amount numeric not null, -- Valor líquido para o expert (95%)
  mp_preference_id text, -- ID da preferência de pagamento
  mp_payment_id text, -- ID do pagamento confirmado
  status text default 'created', -- created, pending, approved, cancelled, refunded
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS para marketplace_orders
alter table marketplace_orders enable row level security;

-- Experts vêem vendas de seus templates
create policy "Experts see orders for their templates"
  on marketplace_orders for select
  using (
    exists (
      select 1 from templates
      where templates.id = marketplace_orders.template_id
      and templates.expert_id = auth.uid()
    )
  );

-- Backend (anon/public) pode inserir pedidos ao iniciar checkout (via edge function ou backend)
-- Para simplificar, permitimos insert público se for 'created', backend valida depois
create policy "Public can create orders"
  on marketplace_orders for insert
  with check (status = 'created');


-- 3. Tabela de Saldos (Balances - Ledger Interno)
create table balances (
  expert_id uuid primary key references auth.users(id),
  available_amount numeric default 0, -- Saldo disponível para saque
  pending_amount numeric default 0, -- Saldo a liberar (se houver float)
  updated_at timestamptz default now()
);

-- RLS para balances
alter table balances enable row level security;

create policy "Experts view own balance"
  on balances for select
  using (auth.uid() = expert_id);


-- 4. Tabela de Saques (Payouts)
create table payouts (
  id uuid primary key default uuid_generate_v4(),
  expert_id uuid references auth.users(id) not null,
  amount_requested numeric not null, -- Valor solicitado
  fee_fixed numeric default 5, -- Taxa fixa de saque (R$ 5)
  amount_sent numeric not null, -- Valor efetivamente enviado (requested - fee)
  status text default 'requested', -- requested, processing, paid, failed
  mp_transfer_id text, -- ID da transferência no MP (se houver)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS para payouts
alter table payouts enable row level security;

create policy "Experts view own payouts"
  on payouts for select
  using (auth.uid() = expert_id);

create policy "Experts can request payouts"
  on payouts for insert
  with check (auth.uid() = expert_id and status = 'requested');


-- FUNCTIONS e TRIGGERS (Opcional, mas útil para integridade)

-- Função para criar balance ao criar usuário expert (pode ser chamada via trigger em profiles ou experts_mp)
create or replace function create_balance_for_new_expert()
returns trigger as $$
begin
  insert into balances (expert_id, available_amount, pending_amount)
  values (new.expert_id, 0, 0)
  on conflict (expert_id) do nothing;
  return new;
end;
$$ language plpgsql;

create trigger on_expert_mp_created
  after insert on experts_mp
  for each row execute procedure create_balance_for_new_expert();
