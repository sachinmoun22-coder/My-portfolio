import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
export default function Public(){
  const [projects,setProjects]=useState([])
  const [info,setInfo]=useState({about:'',skills:[]})
  useEffect(()=>{const u=onSnapshot(collection(db,'projects'),s=>setProjects(s.docs.map(d=>({id:d.id,...d.data()}))));return ()=>u()},[])
  useEffect(()=>{getDoc(doc(db,'site','about')).then(s=>{if(s.exists())setInfo(s.data())}).catch(()=>{})},[])
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Portfolio</h1>
      <p className="text-gray-300 mb-6">{info.about}</p>
      <div className="flex flex-wrap gap-2 mb-6">{(info.skills||[]).map((s,i)=><span key={i} className="bg-gray-800 px-3 py-1 rounded">{s}</span>)}</div>
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {projects.map(p=>(
          <div key={p.id} className="bg-gray-800 p-4 rounded">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="rounded mb-2"/>}
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-300">{p.description}</p>
            <div className="flex gap-2 mt-2">
              {p.live && <a href={p.live} className="text-blue-400 text-sm" target="_blank" rel="noreferrer">Live</a>}
              {p.github && <a href={p.github} className="text-blue-400 text-sm" target="_blank" rel="noreferrer">GitHub</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
