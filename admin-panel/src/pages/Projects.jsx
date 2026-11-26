import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
export default function Projects(){
  const [rows,setRows]=useState([]),[form,setForm]=useState({title:'',description:'',link:'',category:'',featured:false,sort_order:0,image_url:'',visible:true}),[edit,setEdit]=useState(null),[file,setFile]=useState(null)
  const load=async()=>{const {data}=await supabase.from('projects').select('*').order('sort_order');setRows(data||[])}
  useEffect(()=>{load()},[])
  const upload=async()=>{if(!file)return form.image_url;const path=`projects/${Date.now()}-${file.name}`;const {error}=await supabase.storage.from('portfolio').upload(path,file);if(error)throw error;const {data}=supabase.storage.from('portfolio').getPublicUrl(path);return data.publicUrl}
  const save=async(e)=>{e.preventDefault();try{const image_url=await upload();const payload={...form,image_url};if(edit)await supabase.from('projects').update(payload).eq('id',edit);else await supabase.from('projects').insert(payload);setForm({title:'',description:'',link:'',category:'',featured:false,sort_order:0,image_url:'',visible:true});setFile(null);setEdit(null);load()}catch(err){alert(err.message)}}
  const del=async(id)=>{if(!confirm('Delete?'))return;await supabase.from('projects').delete().eq('id',id);load()}
  return (
    <div>
      <form onSubmit={save} className="bg-gray-900 p-4 rounded-xl mb-4 border border-gray-800 grid gap-2">
        <input placeholder="Title" className="p-2 bg-gray-800 rounded" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <textarea placeholder="Description" className="p-2 bg-gray-800 rounded" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input placeholder="Link" className="p-2 bg-gray-800 rounded" value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/>
        <input placeholder="Category" className="p-2 bg-gray-800 rounded" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
        <input type="number" placeholder="Sort" className="p-2 bg-gray-800 rounded" value={form.sort_order} onChange={e=>setForm({...form,sort_order:+e.target.value})}/>
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="p-2 bg-gray-800 rounded"/>
        <label className="flex gap-2 items-center"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label>
        <label className="flex gap-2 items-center"><input type="checkbox" checked={form.visible} onChange={e=>setForm({...form,visible:e.target.checked})}/> Visible</label>
        <button className="bg-blue-600 rounded p-2">{edit?'Update':'Add'}</button>
      </form>
      {rows.map(r=>(
        <div key={r.id} className="bg-gray-900 p-3 rounded mb-2 border border-gray-800 flex justify-between gap-2">
          <div className="flex gap-3"><img src={r.image_url} alt="" className="w-16 h-16 object-cover rounded"/>{/* eslint-disable */}<div><b>{r.title}</b><p className="text-gray-400 text-sm">{r.description}</p></div></div>
          <div className="flex gap-2"><button onClick={()=>{setEdit(r.id);setForm(r)}} className="px-2 py-1 bg-gray-800 rounded text-sm">Edit</button><button onClick={()=>del(r.id)} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button></div>
        </div>
      ))}
    </div>
  )
}