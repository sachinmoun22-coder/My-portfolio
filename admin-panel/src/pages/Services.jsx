import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
export default function Services(){
  const [rows,setRows]=useState([]),[form,setForm]=useState({title:'',description:'',icon:'',sort_order:0}),[edit,setEdit]=useState(null)
  const load=async()=>{const {data}=await supabase.from('services').select('*').order('sort_order');setRows(data||[])}
  useEffect(()=>{load()},[])
  const save=async(e)=>{e.preventDefault();if(edit)await supabase.from('services').update(form).eq('id',edit);else await supabase.from('services').insert(form);setForm({title:'',description:'',icon:'',sort_order:0});setEdit(null);load()}
  const del=async(id)=>{if(!confirm('Delete?'))return;await supabase.from('services').delete().eq('id',id);load()}
  return (
    <div>
      <form onSubmit={save} className="bg-gray-900 p-4 rounded-xl mb-4 border border-gray-800 grid gap-2 md:grid-cols-4">
        <input placeholder="Title" className="p-2 bg-gray-800 rounded" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <input placeholder="Icon" className="p-2 bg-gray-800 rounded" value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})}/>
        <input placeholder="Sort" type="number" className="p-2 bg-gray-800 rounded" value={form.sort_order} onChange={e=>setForm({...form,sort_order:+e.target.value})}/>
        <button className="bg-blue-600 rounded">{edit?'Update':'Add'}</button>
        <textarea placeholder="Description" className="p-2 bg-gray-800 rounded md:col-span-4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      </form>
      {rows.map(r=>(
        <div key={r.id} className="bg-gray-900 p-3 rounded mb-2 border border-gray-800 flex justify-between">
          <div><b>{r.icon} {r.title}</b><p className="text-gray-400 text-sm">{r.description}</p></div>
          <div className="flex gap-2"><button onClick={()=>{setEdit(r.id);setForm(r)}} className="px-2 py-1 bg-gray-800 rounded text-sm">Edit</button><button onClick={()=>del(r.id)} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button></div>
        </div>
      ))}
    </div>
  )
}