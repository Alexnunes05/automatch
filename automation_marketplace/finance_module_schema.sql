-- Create financial_clients table
CREATE TABLE IF NOT EXISTS financial_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id uuid NOT NULL REFERENCES auth.users(id), -- Assuming auth.users is the correct reference for gestor_id based on typical Supabase patterns and user prompt
  nome_cliente text NOT NULL,
  tipo_contrato text NOT NULL CHECK (tipo_contrato IN ('one_time', 'recurring')),
  valor numeric NOT NULL CHECK (valor > 0),
  data_inicio date NOT NULL,
  data_renovacao date, -- Can be null for one_time
  status text NOT NULL CHECK (status IN ('active', 'pending', 'canceled')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create financial_expenses table
CREATE TABLE IF NOT EXISTS financial_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gestor_id uuid NOT NULL REFERENCES auth.users(id),
  nome_custo text NOT NULL,
  categoria text NOT NULL CHECK (categoria IN ('api', 'server', 'tools', 'freelancer', 'other')),
  tipo_custo text NOT NULL CHECK (tipo_custo IN ('fixed', 'variable')),
  valor numeric NOT NULL CHECK (valor > 0),
  data date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE financial_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_expenses ENABLE ROW LEVEL SECURITY;

-- Policies for financial_clients
CREATE POLICY "Gestores can view their own clients"
  ON financial_clients
  FOR SELECT
  USING (auth.uid() = gestor_id);

CREATE POLICY "Gestores can insert their own clients"
  ON financial_clients
  FOR INSERT
  WITH CHECK (auth.uid() = gestor_id);

CREATE POLICY "Gestores can update their own clients"
  ON financial_clients
  FOR UPDATE
  USING (auth.uid() = gestor_id);

CREATE POLICY "Gestores can delete their own clients"
  ON financial_clients
  FOR DELETE
  USING (auth.uid() = gestor_id);

-- Policies for financial_expenses
CREATE POLICY "Gestores can view their own expenses"
  ON financial_expenses
  FOR SELECT
  USING (auth.uid() = gestor_id);

CREATE POLICY "Gestores can insert their own expenses"
  ON financial_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = gestor_id);

CREATE POLICY "Gestores can update their own expenses"
  ON financial_expenses
  FOR UPDATE
  USING (auth.uid() = gestor_id);

CREATE POLICY "Gestores can delete their own expenses"
  ON financial_expenses
  FOR DELETE
  USING (auth.uid() = gestor_id);
