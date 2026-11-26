import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
import Messages from './Messages'
import Projects from './Projects'
import Services from './Services'
export default function Dashboard({user}){
  const [tab,setTab]=useState('dashboard')
  const [counts,setCounts]=useState({messages:0,unread:0,projects:0,services:0})
  const [latest,setLatest]=useState([])
  const nav=useNavigate()
  const load=async()=>{const [m,p,s]=await Promise.all([supabase.from('messages').select('*',{count:'exact'}),supabase.from('projects').select('*',{count:'exact'}),supabase.from('services').select('*',{count:'exact'})]);const unread=(m.data||[]).filter(x=>!x.is_read).length;setCounts({messages:m.count||0,unread,projects:p.count||0,services:s.count||0});const {data}=await supabase.from('messages').select('*').order('created_at',{ascending:false}).limit(5);setLatest(data||[])}
  useEffect(()=>{load()},[tab])
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-cyan-400">Admin Dashboard</h1>
        <div className="flex items-center gap-4"><span className="text-sm text-gray-400">{user.email}</span>
        <button onClick={async()=>{await supabase.auth.signOut();nav('/admin/login')}} className="bg-red-600 px-3 py-1 rounded">Logout</button></div>
      </header>
      <nav className="flex gap-2 p-4 border-b border-gray-800 flex-wrap">
        {['dashboard','projects','services','messages'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded ${tab===t?'bg-blue-600':'bg-gray-800'}`}>{t}</button>
        ))}
      </nav>
      <main className="p-4">
        {tab==='dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[['Messages',counts.messages],['Unread',counts.unread],['Projects',counts.projects],['Services',counts.services]].map(([k,v])=>(
                <div key={k} className="bg-gray-900 p-4 rounded-xl border border-gray-800"><div className="text-gray-400 text-sm">{k}</div><div className="text-2xl font-bold text-cyan-400">{v}</div></div>
              ))}
            </div>
            <h2 className="text-lg mb-2">Latest messages</h2>
            {latest.length===0 && <p className="text-gray-500">No messages</p>}
            {latest.map(m=>(<div key={m.id} className="bg-gray-900 p-3 rounded mb-2 border border-gray-800"><div className="font-semibold">{m.name}</div><div className="text-gray-400 text-sm">{m.message}</div></div>))}
          </div>
        )}
        {tab==='projects' && <Projects/>}
        {tab==='services' && <Services/>}
        {tab==='messages' && <Messages/>}
      </main>
    </div>
  )
}