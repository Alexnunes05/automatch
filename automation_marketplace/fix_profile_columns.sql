-- FIX: Garantir que a tabela profiles tenha as colunas usadas no trigger
-- O erro 500 no cadastro provavelmente ocorre porque alguma dessas colunas não existia.

-- 1. Adicionar colunas essenciais se não existirem
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Garantir que o RLS permita a inserção (trigger usa security definer, mas é bom garantir)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Se o trigger já foi criado, não precisa recriar, mas o script abaixo garante
-- que a função handler esteja atualizada e correta.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    active,
    role
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    true,   -- Active = true
    'user'  -- Role padrão
  )
  ON CONFLICT (id) DO UPDATE
  SET	
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    active = EXCLUDED.active; -- Atualiza se já existir (segurança para re-signup)

  RETURN new;
END;
$$ LANGUAGE plpgsql;
