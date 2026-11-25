import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
export default function SkillsAbout(){
  const [about,setAbout]=useState(''),[skills,setSkills]=useState('')
  useEffect(()=>{getDoc(doc(db,'site','about')).then(s=>{if(s.exists()){setAbout(s.data().about||'');setSkills((s.data().skills||[]).join(', '))}}).catch(()=>{})},[])
  const save=async(e)=>{e.preventDefault();await setDoc(doc(db,'site','about'),{about,skills:skills.split(',').map(s=>s.trim()).filter(Boolean)}) ;alert('Saved')}
  return (
    <form onSubmit={save} className="bg-gray-800 p-4 rounded space-y-2 max-w-xl">
      <textarea className="w-full p-2 rounded bg-gray-700" rows="5" placeholder="About" value={about} onChange={e=>setAbout(e.target.value)}/>
      <input className="w-full p-2 rounded bg-gray-700" placeholder="Skills (comma)" value={skills} onChange={e=>setSkills(e.target.value)}/>
      <button className="bg-blue-600 px-4 py-2 rounded">Save</button>
    </form>
  )
}
