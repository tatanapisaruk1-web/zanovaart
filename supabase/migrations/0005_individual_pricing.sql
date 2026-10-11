-- ЗАНОВО — цены для индивидуального формата по количеству гостей
--
-- У мастер-класса теперь два вида цены: базовая (групповой формат,
-- workshops.base_price — не меняется) и отдельная сетка цен для
-- индивидуального формата, где цена зависит от количества гостей
-- (например, 1 гость — 80 BYN, 2 гостя — 120 BYN и т.д.). При создании
-- слота с типом "индивидуальный" и выбранным количеством мест цена
-- подставляется из этой таблицы автоматически.

create table workshop_individual_prices (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  guests_count int not null check (guests_count > 0),
  price numeric(10,2) not null,
  unique (workshop_id, guests_count)
);

alter table workshop_individual_prices enable row level security;

create policy "staff full access" on public.workshop_individual_prices
  for all to authenticated using (true) with check (true);
