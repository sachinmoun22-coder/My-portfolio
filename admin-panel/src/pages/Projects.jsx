import { useEffect, useState } from 'react'
import { db, storage } from '../firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
export default function Projects(){
  const [items,setItems]=useState([])
  const [form,setForm]=useState({title:'',description:'',live:'',github:'',tags:''})
  const [file,setFile]=useState(null)
  const [editing,setEditing]=useState(null)
  useEffect(()=>onSnapshot(collection(db,'projects'),s=>setItems(s.docs.map(d=>({id:d.id,...d.data()})))),[])
  const save=async(e)=>{
    e.preventDefault()
    let imageUrl=form.imageUrl||''
    if(file){const r=ref(storage,`projects/${Date.now()}_${file.name}`);await uploadBytes(r,file);imageUrl=await getDownloadURL(r)}
    const data={...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),imageUrl}
    if(editing){await updateDoc(doc(db,'projects',editing),data);setEditing(null)}
    else await addDoc(collection(db,'projects'),{...data,createdAt:Date.now()})
    setForm({title:'',description:'',live:'',github:'',tags:'',imageUrl:''});setFile(null)
  }
  return (
    <div className="space-y-4">
      <form onSubmit={save} className="bg-gray-800 p-4 rounded space-y-2">
        <input className="w-full p-2 rounded bg-gray-700" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
        <textarea className="w-full p-2 rounded bg-gray-700" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input className="w-full p-2 rounded bg-gray-700" placeholder="Live link" value={form.live} onChange={e=>setForm({...form,live:e.target.value})}/>
        <input className="w-full p-2 rounded bg-gray-700" placeholder="GitHub link" value={form.github} onChange={e=>setForm({...form,github:e.target.value})}/>
        <input className="w-full p-2 rounded bg-gray-700" placeholder="Tech tags (comma)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/>
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="text-sm"/>
        <button className="bg-blue-600 px-4 py-2 rounded">{editing?'Update':'Add'} Project</button>
      </form>
      <div className="grid gap-3">
        {items.map(p=>(
          <div key={p.id} className="bg-gray-800 p-4 rounded flex justify-between">
            <div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="text-sm text-gray-300">{p.description}</p>
              <p className="text-xs text-gray-500">{(p.tags||[]).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>{setEditing(p.id);setForm({title:p.title,description:p.description,live:p.live,github:p.github,tags:(p.tags||[]).join(','),imageUrl:p.imageUrl})}} className="bg-yellow-600 px-2 py-1 rounded text-sm">Edit</button>
              <button onClick={()=>deleteDoc(doc(db,'projects',p.id))} className="bg-red-600 px-2 py-1 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
