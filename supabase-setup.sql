-- idempotent setup
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null check (length(message) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table projects add column if not exists image_url text;
alter table projects add column if not exists visible boolean not null default true;
alter table projects enable row level security;
alter table if exists services enable row level security;
alter table if exists messages enable row level security;
-- policies
drop policy if exists "public read visible projects" on projects;
create policy "public read visible projects" on projects for select using (visible = true);
drop policy if exists "public read services" on services;
create policy "public read services" on services for select using (true);
drop policy if exists "public insert messages" on messages;
create policy "public insert messages" on messages for insert with check (length(message) between 1 and 5000);
drop policy if exists "auth full projects" on projects;
create policy "auth full projects" on projects for all to authenticated using (true) with check (true);
drop policy if exists "auth full services" on services;
create policy "auth full services" on services for all to authenticated using (true) with check (true);
drop policy if exists "auth full messages" on messages;
create policy "auth full messages" on messages for all to authenticated using (true) with check (true);
-- storage bucket
insert into storage.buckets (id,name,public) values ('portfolio','portfolio',true) on conflict (id) do nothing;
drop policy if exists "public read portfolio" on storage.objects;
create policy "public read portfolio" on storage.objects for select using (bucket_id='portfolio');
drop policy if exists "auth write portfolio" on storage.objects;
create policy "auth write portfolio" on storage.objects for all to authenticated using (bucket_id='portfolio') with check (bucket_id='portfolio');