-- Defesa explícita: eventos recebidos só podem ser gravados pela função
-- SECURITY DEFINER chamada com service_role; clientes nunca leem ou gravam.
drop policy if exists belevy_appointment_events_deny_clients on public.belevy_appointment_events;
create policy belevy_appointment_events_deny_clients
  on public.belevy_appointment_events
  for all to anon, authenticated
  using (false)
  with check (false);
