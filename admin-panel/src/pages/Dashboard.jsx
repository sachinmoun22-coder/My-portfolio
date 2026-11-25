import { useState } from 'react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Projects from './Projects'
import SkillsAbout from './SkillsAbout'
import Messages from './Messages'
import Resume from './Resume'
export default function Dashboard({user}){
  const [tab,setTab]=useState('projects')
  const nav=useNavigate()
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4"><span className="text-sm text-gray-400">{user.email}</span>
        <button onClick={async()=>{await signOut(auth);nav('/admin/login')}} className="bg-red-600 px-3 py-1 rounded">Logout</button></div>
      </header>
      <nav className="flex gap-2 p-4 border-b border-gray-700">
        {['projects','skills','messages','resume'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded ${tab===t?'bg-blue-600':'bg-gray-700'}`}>{t}</button>
        ))}
      </nav>
      <main className="p-4">
        {tab==='projects' && <Projects/>}
        {tab==='skills' && <SkillsAbout/>}
        {tab==='messages' && <Messages/>}
        {tab==='resume' && <Resume/>}
      </main>
    </div>
  )
}
