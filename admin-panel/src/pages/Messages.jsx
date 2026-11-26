import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
export default function Messages(){
  const [rows,setRows]=useState([])
  const load=async()=>{const {data}=await supabase.from('messages').select('*').order('created_at',{ascending:false});setRows(data||[])}
  useEffect(()=>{load()},[])
  const toggle=async(r)=>{await supabase.from('messages').update({is_read:!r.is_read}).eq('id',r.id);load()}
  const del=async(id)=>{if(!confirm('Delete?'))return;await supabase.from('messages').delete().eq('id',id);load()}
  return (
    <div>
      {rows.length===0 && <p className="text-gray-500">No messages</p>}
      {rows.map(r=>(
        <div key={r.id} className={`p-4 rounded-xl mb-3 border ${r.is_read?'border-gray-800 bg-gray-900':'border-cyan-500/40 bg-gray-900'}`}>
          <div className="flex justify-between items-start gap-2">
            <div><div className="font-semibold">{r.name} <span className="text-gray-500 text-sm">{r.email}</span></div><div className="text-gray-300 mt-1 whitespace-pre-wrap">{r.message}</div><div className="text-gray-500 text-xs mt-1">{new Date(r.created_at).toLocaleString()}</div></div>
            <div className="flex gap-2 shrink-0">
              <button onClick={()=>toggle(r)} className="px-2 py-1 bg-gray-800 rounded text-sm">{r.is_read?'Mark unread':'Mark read'}</button>
              <a href={`mailto:${r.email}?subject=Re: Portfolio enquiry&body=${encodeURIComponent(r.message)}`} className="px-2 py-1 bg-blue-600 rounded text-sm">Reply</a>
              <button onClick={()=>del(r.id)} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}