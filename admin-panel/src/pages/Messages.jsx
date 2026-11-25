import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
export default function Messages(){
  const [items,setItems]=useState([])
  useEffect(()=>onSnapshot(collection(db,'messages'),s=>setItems(s.docs.map(d=>({id:d.id,...d.data()})))),[])
  return (
    <div className="space-y-2">
      {items.map(m=>(
        <div key={m.id} className="bg-gray-800 p-4 rounded flex justify-between">
          <div><b>{m.name}</b> <span className="text-gray-400 text-sm">{m.email}</span><p className="text-sm">{m.message}</p></div>
          <button onClick={()=>deleteDoc(doc(db,'messages',m.id))} className="bg-red-600 px-2 py-1 rounded text-sm h-fit">Delete</button>
        </div>
      ))}
    </div>
  )
}
