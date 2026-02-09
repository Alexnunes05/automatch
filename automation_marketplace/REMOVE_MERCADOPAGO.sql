-- REMOVE_MERCADOPAGO.sql
-- Script to remove all Mercado Pago related tables and functions from Supabase

-- 1. Drop Tables (Order matters due to foreign keys)
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS marketplace_orders;
DROP TABLE IF EXISTS experts_mp;
DROP TABLE IF EXISTS balances;

-- 2. Drop Functions
DROP FUNCTION IF EXISTS increment_balance(uuid, numeric);
DROP FUNCTION IF EXISTS can_withdraw(uuid, numeric, numeric);
DROP FUNCTION IF EXISTS process_withdrawal(uuid, numeric, numeric);
DROP FUNCTION IF EXISTS create_balance_for_new_expert();

-- 3. Drop Triggers (usually dropped with the table, but good to be sure if associated with other tables)
-- The trigger 'on_expert_mp_created' was on 'experts_mp', so it's gone with the table.

-- 4. Clean up any other potential leftovers
-- (None identified from mp_marketplace_schema.sql)

SELECT 'Mercado Pago integration removed successfully' as result;
