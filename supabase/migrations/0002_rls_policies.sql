-- ЗАНОВО — политики доступа (RLS)
--
-- При создании таблиц мы включили Row Level Security, но не добавили ни
-- одной политики — из-за этого даже авторизованные сотрудники не могли
-- ничего читать и писать. Это внутренний однотенантный инструмент: все
-- авторизованные пользователи (owner/receptionist из таблицы staff) —
-- доверенные сотрудники студии, поэтому даём им полный доступ ко всем
-- таблицам. Анонимный (публичный) доступ остаётся запрещён — что и даёт
-- защиту: без входа в систему к данным не достучаться.

do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'drop policy if exists "staff full access" on public.%I;',
      t
    );
    execute format(
      'create policy "staff full access" on public.%I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
