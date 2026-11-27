# Admin Panel

React (Vite) + Tailwind + Supabase admin and public portfolio preview.

## Setup
1. Copy `.env.example` to `.env` and fill Supabase URL, anon key and `VITE_ADMIN_EMAIL`.
2. Run `supabase-setup.sql` in the Supabase SQL Editor (tables, RLS policies, grants, storage bucket).
3. `npm install`
4. `npm run dev`

## Supabase
Email/Password Auth. Tables: `projects`, `services`, `messages`, `site_content`, `profiles`. Storage bucket: `portfolio`.
