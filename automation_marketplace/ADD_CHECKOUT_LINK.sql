-- ADD_CHECKOUT_LINK.sql
-- Adiciona coluna para link externo de checkout na tabela templates

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'checkout_link') THEN
        ALTER TABLE templates ADD COLUMN checkout_link text;
    END IF;
END $$;
