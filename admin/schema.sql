-- Run this in Supabase SQL Editor
-- Enable Realtime (optional)
-- Create tables

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  link text,
  image text,
  category text,
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists site_content (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table services enable row level security;
alter table site_content enable row level security;
alter table messages enable row level security;

-- Public read
create policy "Public read projects" on projects for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read site_content" on site_content for select using (true);
create policy "Public insert messages" on messages for insert with check (true);

-- Authenticated admin full access
create policy "Admin all projects" on projects for all using (auth.uid() is not null);
create policy "Admin all services" on services for all using (auth.uid() is not null);
create policy "Admin all site_content" on site_content for all using (auth.uid() is not null);
create policy "Admin all messages" on messages for all using (auth.uid() is not null);
create policy "Admin all profiles" on profiles for all using (auth.uid() is not null);

-- Seed default content
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

insert into projects (title, description, link, category, featured, sort_order) values
  ('Mountain Rush','Off-road mountain racing game with daily missions.','https://mountain-rush.ai.studio/','Game',true,1),
  ('School Website','Website for S.B.S Sr. Sec. School with admission info and language switch.','https://school-website-dun-three.vercel.app/','Website',false,2)
on conflict do nothing;

insert into services (title, description, icon, sort_order) values
  ('SEO & Content','Keyword research, on-page SEO and AI-assisted blogs that rank on Google.','🔍',1),
  ('Social Media','Instagram, LinkedIn and YouTube strategy with reels and posts.','📱',2),
  ('Paid Ads','Google and Meta campaigns tuned for low cost per lead and high ROAS.','💰',3),
  ('AI Automation','Email flows, chatbots and workflows that nurture leads on autopilot.','🤖',4)
on conflict do nothing;
