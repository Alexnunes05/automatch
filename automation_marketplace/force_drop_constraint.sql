-- FIX: Remover a restrição de status para permitir 'contacted'
-- Se houver status antigos/inválidos no banco, eles impediriam a criação da nova regra.
-- Por isso, vamos apenas REMOVER a regra por enquanto.

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Opcional: Se quiser garantir que 'contacted' seja aceito sem erros futuros,
-- podemos recriar a regra usando NOT VALID (ignora dados passados), mas
-- apenas remover já resolve seu problema imediato.
