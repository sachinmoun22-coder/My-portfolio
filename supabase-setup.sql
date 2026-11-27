-- Run this in Supabase SQL Editor
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  link text,
  image_url text,
  tech_stack text,
  category text,
  featured boolean default false,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  price text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null check (length(message) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists site_content (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  role text default 'admin',
  created_at timestamptz not null default now()
);
alter table projects add column if not exists image_url text;
alter table projects add column if not exists tech_stack text;
alter table projects add column if not exists category text;
alter table projects add column if not exists featured boolean default false;
alter table projects add column if not exists visible boolean not null default true;
alter table projects add column if not exists sort_order int not null default 0;
alter table services add column if not exists icon text;
alter table services add column if not exists price text;
alter table services add column if not exists sort_order int not null default 0;
alter table messages add column if not exists is_read boolean not null default false;
alter table site_content add column if not exists updated_at timestamptz not null default now();

alter table projects enable row level security;
alter table services enable row level security;
alter table messages enable row level security;
alter table site_content enable row level security;
alter table profiles enable row level security;

drop policy if exists "Public read projects" on projects;
drop policy if exists "public read visible projects" on projects;
drop policy if exists "Public read services" on services;
drop policy if exists "public read services" on services;
drop policy if exists "Public read site_content" on site_content;
drop policy if exists "public read site_content" on site_content;
drop policy if exists "Public insert messages" on messages;
drop policy if exists "public insert messages" on messages;
drop policy if exists "Admin all projects" on projects;
drop policy if exists "auth full projects" on projects;
drop policy if exists "Admin all services" on services;
drop policy if exists "auth full services" on services;
drop policy if exists "Admin all site_content" on site_content;
drop policy if exists "auth full site_content" on site_content;
drop policy if exists "Admin all messages" on messages;
drop policy if exists "auth full messages" on messages;
drop policy if exists "Admin all profiles" on profiles;
drop policy if exists "auth full profiles" on profiles;
create policy "public read visible projects" on projects for select using (visible = true);
create policy "public read services" on services for select using (true);
create policy "public read site_content" on site_content for select using (true);
create policy "public insert messages" on messages for insert with check (length(message) between 1 and 5000);
create policy "auth full projects" on projects for all to authenticated using (true) with check (true);
create policy "auth full services" on services for all to authenticated using (true) with check (true);
create policy "auth full site_content" on site_content for all to authenticated using (true) with check (true);
create policy "auth full messages" on messages for all to authenticated using (true) with check (true);
create policy "auth full profiles" on profiles for all to authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.projects, public.services, public.site_content to anon, authenticated;
grant insert on public.messages to anon, authenticated;
grant select, insert, update, delete on public.projects, public.services, public.messages, public.site_content, public.profiles to authenticated;

insert into storage.buckets (id,name,public) values ('portfolio','portfolio',true) on conflict (id) do nothing;
drop policy if exists "public read portfolio" on storage.objects;
create policy "public read portfolio" on storage.objects for select using (bucket_id='portfolio');
drop policy if exists "auth write portfolio" on storage.objects;
create policy "auth write portfolio" on storage.objects for all to authenticated using (bucket_id='portfolio') with check (bucket_id='portfolio');

insert into site_content (key, value) values
  ('hero_name','Sachin'),
  ('hero_title','Digital Marketing with AI'),
  ('hero_sub','I grow brands with SEO, ads and content, and I use AI tools to do it faster and smarter.'),
  ('about_title','About Me'),
  ('about_body','Digital marketer specializing in AI-powered marketing systems.'),
  ('contact_email','sachinmoun5310@gmail.com'),
  ('contact_phone','+91 89509 85074'),
  ('footer_text','© 2026 Sachin · Digital Marketing with AI')
on conflict (key) do nothing;

insert into projects (title, description, link, tech_stack, category, featured, visible, sort_order) values
  ('Mountain Rush','Off-road mountain racing game with daily missions.','https://mountain-rush.ai.studio/','Three.js, AI','Game',true,true,1),
  ('School Website','Website for S.B.S Sr. Sec. School with admission info and language switch.','https://school-website-dun-three.vercel.app/','HTML, CSS, JavaScript','Website',false,true,2)
on conflict do nothing;

insert into services (title, description, icon, sort_order) values
  ('SEO & Content','Keyword research, on-page SEO and AI-assisted blogs that rank on Google.','🔍',1),
  ('Social Media','Instagram, LinkedIn and YouTube strategy with reels and posts.','📱',2),
  ('Paid Ads','Google and Meta campaigns tuned for low cost per lead and high ROAS.','💰',3),
  ('AI Automation','Email flows, chatbots and workflows that nurture leads on autopilot.','🤖',4)
on conflict do nothing;
