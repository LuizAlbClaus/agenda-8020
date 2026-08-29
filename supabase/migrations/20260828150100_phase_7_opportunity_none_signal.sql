-- Preserve the UI's explicit “no signal” answer without making any action eligible.
insert into public.opportunity_signal_catalog(code,description)
values ('none','No opportunity signal is currently available')
on conflict(code) do nothing;
