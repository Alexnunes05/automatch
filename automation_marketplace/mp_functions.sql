-- Função para incrementar saldo do expert (chamada pelo backend após pagamento)
create or replace function increment_balance(expert_uuid uuid, amount numeric)
returns void as $$
begin
  update balances
  set available_amount = available_amount + amount,
      updated_at = now()
  where expert_id = expert_uuid;
end;
$$ language plpgsql security definer;

-- Função para verificar saldo antes de saque (opcional, pode ser view)
create or replace function can_withdraw(expert_uuid uuid, requested_amount numeric, fee numeric)
returns boolean as $$
declare
  current_balance numeric;
begin
  select available_amount into current_balance from balances where expert_id = expert_uuid;
  if current_balance >= (requested_amount + fee) then
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql;

-- Função para processar saque (deduzir saldo)
create or replace function process_withdrawal(expert_uuid uuid, requested_amount numeric, fee numeric)
returns void as $$
begin
  -- Verifica saldo novamente para garantir
  if (select can_withdraw(expert_uuid, requested_amount, fee)) then
    update balances
    set available_amount = available_amount - (requested_amount + fee),
        updated_at = now()
    where expert_id = expert_uuid;
    
    -- Registra o payout como 'processing' (se já não estiver registrado)
    -- O backend faz o insert na tabela payouts primeiro, depois chama essa função
  else
    raise exception 'Saldo insuficiente';
  end if;
end;
$$ language plpgsql security definer;
