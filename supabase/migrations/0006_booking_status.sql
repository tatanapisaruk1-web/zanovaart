-- ЗАНОВО — статусы брони: ожидает подтверждения / подтверждено / отменено
--
-- Упрощаем набор статусов брони до трёх: "ожидает подтверждения" (пока не
-- внесена предоплата — это статус по умолчанию при создании брони),
-- "подтверждено" и "отменено". "Завершено" и "не пришёл" вернём позже,
-- вместе с завершением слота и списанием со склада (Этап 2).

update bookings set status = 'confirmed' where status = 'completed';
update bookings set status = 'cancelled' where status = 'no_show';

alter table bookings drop constraint if exists bookings_status_check;
alter table bookings
  add constraint bookings_status_check
  check (status in ('not_confirmed', 'confirmed', 'cancelled'));
