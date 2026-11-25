# AGENTS.md

## Project Overview
Static portfolio (sachin-portfolio/) + React admin panel (admin-panel/) with Firebase.

## Structure
- `sachin-portfolio/` - static HTML portfolio (index.html), served via python http.server
- `admin/` - legacy Supabase admin panel (single HTML)
- `admin-panel/` - React (Vite) + Tailwind + Firebase admin + public portfolio
- `.env` in admin-panel holds Firebase keys (see .env.example)

## Commands
- Static: `cd sachin-portfolio && python3 -m http.server 8000`
- Admin dev: `cd admin-panel && npm run dev`
- Admin build: `cd admin-panel && npm run build`

## Conventions
- No comments unless asked
- Keep changes minimal
- Firebase collections: projects, messages, site/about; storage: projects/, resume/
EOF