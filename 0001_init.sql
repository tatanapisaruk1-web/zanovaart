-- ЗАНОВО — админ-панель
-- Черновая схема БД по плану (см. проектный документ plan-admin-panel.md).
-- Таблицы сгруппированы по этапам разработки; создаются все сразу,
-- чтобы связи (foreign key) были на месте с самого начала, но
-- наполняются данными постепенно, по мере прохождения этапов.

create extension if not exists "pgcrypto";

-- =========================================================
-- Этап 0 — сотрудники и вход
-- =========================================================

create table staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,               -- ссылка на пользователя Supabase Auth
  full_name text not null,
  role text not null default 'owner' check (role in ('owner', 'receptionist')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Этап 1 — мастер-классы, слоты, брони (MVP-ядро)
-- =========================================================

-- Шаблон мастер-класса. Рецепт материалов и цена живут здесь,
-- а не на слоте — это ключевое решение для мультитиповых слотов.
create table workshops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  duration_minutes int not null,
  base_price numeric(10,2) not null,
  prepayment_amount numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table instructors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  default_rate numeric(10,2) not null default 50.00, -- ставка за МК по умолчанию
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Слот — контейнер времени и места. Может быть одиночным
-- (одно предложение) или мультитиповым (несколько предложений).
create table slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  status text not null default 'open' check (status in ('open', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

create table slot_instructors (
  slot_id uuid not null references slots(id) on delete cascade,
  instructor_id uuid not null references instructors(id) on delete restrict,
  primary key (slot_id, instructor_id)
);

-- Предложение внутри слота = конкретный вид МК, проводимый в это время.
-- У одиночного слота — одна строка, у мультитипового — несколько,
-- каждая со своей вместимостью и ценой.
create table slot_offerings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  workshop_id uuid not null references workshops(id) on delete restrict,
  capacity int not null,
  price numeric(10,2) not null,           -- обычно = workshops.base_price, можно переопределить
  prepayment_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Бронь ссылается на конкретное предложение (вид МК), а не на слот целиком.
create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_offering_id uuid not null references slot_offerings(id) on delete restrict,
  client_name text,
  client_phone text not null,
  client_instagram text,
  participants_count int not null default 1,
  note_for_instructor text,
  status text not null default 'not_confirmed'
    check (status in ('not_confirmed', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_by uuid references staff(id),
  created_at timestamptz not null default now()
);

-- Оплата по каждому участнику отдельно (как в старой панели).
create table booking_participants (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  participant_name text,
  price_share numeric(10,2) not null,
  prepayment_amount numeric(10,2) not null default 0,
  paid_amount numeric(10,2) not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid'))
);

-- =========================================================
-- Этап 2 — склад
-- =========================================================

create table warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,               -- шт., мл, кг, м ...
  category text,
  min_threshold numeric(10,3) default 0,
  created_at timestamptz not null default now()
);

-- Рецепт: сколько материала уходит на 1 участника этого МК.
create table workshop_materials (
  workshop_id uuid not null references workshops(id) on delete cascade,
  material_id uuid not null references materials(id) on delete restrict,
  qty_per_participant numeric(10,3) not null,
  primary key (workshop_id, material_id)
);

create table stock (
  warehouse_id uuid not null references warehouses(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  quantity numeric(12,3) not null default 0,
  avg_price numeric(10,2),
  primary key (warehouse_id, material_id)
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table supplies (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id),
  warehouse_id uuid not null references warehouses(id),
  date timestamptz not null default now(),
  status text not null default 'in_transit' check (status in ('in_transit', 'arrived', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  comment text,
  created_by uuid references staff(id)
);

create table supply_items (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid not null references supplies(id) on delete cascade,
  material_id uuid not null references materials(id),
  packaging_qty numeric(10,3) not null default 1,
  unit_count numeric(10,3) not null,
  unit_price numeric(10,2) not null
);

-- Списания: авто при завершении слота (по каждому виду МК отдельно)
-- + ручные, с указанием причины.
create table writeoffs (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references warehouses(id),
  slot_id uuid references slots(id),      -- заполнено, если списание автоматическое
  reason text not null,
  date timestamptz not null default now(),
  created_by uuid references staff(id)
);

create table writeoff_items (
  id uuid primary key default gen_random_uuid(),
  writeoff_id uuid not null references writeoffs(id) on delete cascade,
  material_id uuid not null references materials(id),
  quantity numeric(10,3) not null,
  slot_offering_id uuid references slot_offerings(id) -- какой вид МК внутри слота это списание закрывает
);

create table stock_transfers (
  id uuid primary key default gen_random_uuid(),
  from_warehouse_id uuid not null references warehouses(id),
  to_warehouse_id uuid not null references warehouses(id),
  date timestamptz not null default now(),
  status text not null default 'done'
);

create table stock_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references stock_transfers(id) on delete cascade,
  material_id uuid not null references materials(id),
  quantity numeric(10,3) not null
);

create table inventories (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references warehouses(id),
  date timestamptz not null default now(),
  status text not null default 'draft' check (status in ('draft', 'applied'))
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references inventories(id) on delete cascade,
  material_id uuid not null references materials(id),
  planned_qty numeric(10,3) not null,
  actual_qty numeric(10,3)
);

-- =========================================================
-- Этап 3 — сертификаты, финансы, ведущие
-- =========================================================

create table certificates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  face_value numeric(10,2) not null,
  balance numeric(10,2) not null,
  payment_method text,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  recipient_name text,
  recipient_phone text,
  cert_type text not null default 'money' check (cert_type in ('money', 'workshop')),
  workshop_id uuid references workshops(id),
  valid_until date,
  status text not null default 'active' check (status in ('active', 'used', 'cancelled')),
  note text,
  created_by uuid references staff(id),
  created_at timestamptz not null default now()
);

create table certificate_usages (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references certificates(id) on delete cascade,
  booking_id uuid references bookings(id),
  amount_used numeric(10,2) not null,
  used_at timestamptz not null default now()
);

-- Счета: по умолчанию наличка и р/с, но список расширяемый —
-- в Настройках можно будет добавить новые (например, под ExpressPay).
create table accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'other' check (kind in ('cash', 'bank', 'other')),
  is_active boolean not null default true
);

-- Единая лента всех поступлений и списаний денег.
create table transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id),
  direction text not null check (direction in ('income', 'expense')),
  category text not null check (category in (
    'prepayment', 'postpayment', 'certificate_payment',
    'instructor_payout', 'supply_purchase', 'other_expense'
  )),
  amount numeric(10,2) not null,
  booking_id uuid references bookings(id),
  instructor_payout_id uuid,        -- см. instructor_payouts ниже
  supply_id uuid references supplies(id),
  comment text,
  created_by uuid references staff(id),
  created_at timestamptz not null default now()
);

-- Сумма к выплате ведущему за конкретный проведённый МК.
-- По умолчанию = instructors.default_rate, можно скорректировать вручную.
create table instructor_payouts (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id),
  slot_id uuid references slots(id),
  amount numeric(10,2) not null,
  note text,
  created_at timestamptz not null default now()
);

alter table transactions
  add constraint transactions_instructor_payout_fk
  foreign key (instructor_payout_id) references instructor_payouts(id);

-- =========================================================
-- Примечание
-- =========================================================
-- Отдельного реестра "Клиенты" в старой панели не было — контакты
-- клиента хранятся прямо в брони (bookings.client_*). Если понадобится
-- история по клиенту как отдельная сущность — добавим таблицу clients
-- отдельной миграцией, это не ломает существующие данные.
