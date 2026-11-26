import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
if(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY){
  document.getElementById('root').innerHTML='<div style="color:#fff;padding:2rem">Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env</div>'
} else {
  createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
}