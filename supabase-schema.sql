-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Transactions
create table if not exists public.transactions (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  date         text not null,
  description  text not null,
  amount       numeric(12, 2) not null,
  type         text not null check (type in ('expense', 'income')),
  category     text not null,
  currency     text not null,
  note         text,
  created_at   text not null
);
create index if not exists transactions_user_id on public.transactions(user_id);
alter table public.transactions enable row level security;
create policy "own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bills
create table if not exists public.bills (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  amount         numeric(12, 2) not null,
  currency       text not null,
  frequency      text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  next_due_date  text not null,
  category       text not null,
  note           text
);
create index if not exists bills_user_id on public.bills(user_id);
alter table public.bills enable row level security;
create policy "own bills" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals
create table if not exists public.goals (
  id              text primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  target_amount   numeric(12, 2) not null,
  current_amount  numeric(12, 2) not null,
  currency        text not null,
  target_date     text not null,
  created_at      text not null
);
create index if not exists goals_user_id on public.goals(user_id);
alter table public.goals enable row level security;
create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User settings
create table if not exists public.user_settings (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  base_currency   text not null default 'USD',
  theme           text not null default 'system',
  monthly_budget  numeric(12, 2) not null default 2000
);
alter table public.user_settings enable row level security;
create policy "own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
