-- CONFIGURAÇÃO DO PG_CRON (AGENDADOR DE TAREFAS)
-- Execute este script no SQL Editor do Supabase para ativar a fila inteligente automática.

-- 1. Habilitar a extensão pg_cron
-- Nota: Em alguns projetos Supabase, isso já vem habilitado ou precisa ser ativado no Dashboard em Database > Extensions.
create extension if not exists pg_cron;

-- 2. Garantir permissões (opcional, mas recomendado)
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- 3. Agendar o Job
-- Nome: 'process-smart-queue'
-- Frequência: '* * * * *' (A cada minuto)
-- Comando: Chama a função que criamos anteriormente
select cron.schedule(
    'process-smart-queue',
    '* * * * *',
    'select public.rpc_process_queue_updates()'
);

-- 4. Verificar se foi agendado
select * from cron.job;

-- COMANDOS ÚTEIS PARA GERENCIAMENTO:
-- Para remover o agendamento:
-- select cron.unschedule('process-smart-queue');

-- Para ver logs de execução (se configurado):
-- select * from cron.job_run_details order by start_time desc limit 10;
