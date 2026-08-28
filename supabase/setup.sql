-- ============================================================================
-- Lokansh Wealth — Supabase setup
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query →
-- paste everything below → Run.
-- ============================================================================

-- 1) Loan applications table -------------------------------------------------
create table if not exists public.loan_applications (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  loan_type      text not null,
  name_as_pan    text not null,
  age            int  not null,
  email          text not null,
  phone          text not null,
  pan            text not null,
  aadhaar        text not null,
  employment     text not null,
  monthly_income numeric,
  loan_amount    numeric not null,
  pan_url        text,
  aadhaar_url    text
);

alter table public.loan_applications enable row level security;

-- Allow the public website (anon key) to submit applications.
drop policy if exists "anyone can submit a loan application" on public.loan_applications;
create policy "anyone can submit a loan application"
  on public.loan_applications
  for insert
  to anon
  with check (true);

-- NOTE: reading applications is intentionally NOT granted to anon.
-- View submissions in the Supabase Table Editor, or build an admin login later.

-- 2) Storage bucket for uploaded PAN / Aadhaar documents ---------------------
insert into storage.buckets (id, name, public)
values ('loan-documents', 'loan-documents', true)
on conflict (id) do nothing;

-- Allow the public website to upload document images.
drop policy if exists "anyone can upload loan documents" on storage.objects;
create policy "anyone can upload loan documents"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'loan-documents');

-- Allow reading the uploaded documents back (public URLs).
drop policy if exists "anyone can read loan documents" on storage.objects;
create policy "anyone can read loan documents"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'loan-documents');
