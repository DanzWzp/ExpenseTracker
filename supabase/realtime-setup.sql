-- ════════════════════════════════════════════════════════════════════════
--  SETUP SUPABASE: Row Level Security (RLS) + Realtime
--  Jalankan di: Supabase Dashboard → SQL Editor (setelah `prisma migrate`).
--
--  Catatan penting:
--  • Prisma terhubung memakai role `postgres` (BYPASSRLS), jadi operasi server
--    (semua endpoint API) TIDAK terpengaruh RLS — tetap berjalan normal.
--  • Policy di bawah mengatur akses dari sisi CLIENT (anon/authenticated key),
--    yang kita pakai HANYA untuk Supabase Realtime. Tanpa policy SELECT,
--    Realtime tidak akan mengirim perubahan baris ke browser.
--  • Nama kolom camelCase ("userId") WAJIB diberi tanda kutip ganda.
-- ════════════════════════════════════════════════════════════════════════

-- 1) Aktifkan RLS pada semua tabel
alter table public.users               enable row level security;
alter table public.expenses            enable row level security;
alter table public.recurring_expenses  enable row level security;
alter table public.budgets             enable row level security;
alter table public.goals               enable row level security;

-- 2) Policy: setiap user hanya boleh mengakses datanya sendiri
--    (auth.uid() = UID Supabase Auth = kolom id/userId di tabel kita)

-- users
drop policy if exists "users_own" on public.users;
create policy "users_own" on public.users
  for all using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

-- expenses
drop policy if exists "expenses_own" on public.expenses;
create policy "expenses_own" on public.expenses
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- recurring_expenses
drop policy if exists "recurring_own" on public.recurring_expenses;
create policy "recurring_own" on public.recurring_expenses
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- budgets
drop policy if exists "budgets_own" on public.budgets;
create policy "budgets_own" on public.budgets
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- goals
drop policy if exists "goals_own" on public.goals;
create policy "goals_own" on public.goals
  for all using (auth.uid()::text = "userId")
  with check (auth.uid()::text = "userId");

-- 3) Aktifkan Realtime untuk tabel expenses
--    (agar perubahan ter-broadcast ke client yang subscribe)
alter publication supabase_realtime add table public.expenses;

-- Selesai. Refresh aplikasi; tabel Pengeluaran kini sinkron otomatis.
