import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'
export default function Login(){
  const [email,setEmail]=useState(''),[pass,setPass]=useState(''),[err,setErr]=useState('')
  const nav=useNavigate()
  const submit=async(e)=>{e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email,password:pass});if(error)setErr(error.message);else nav('/admin')}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <form onSubmit={submit} className="bg-gray-900 p-8 rounded-xl w-96 space-y-4 border border-gray-800">
        <h1 className="text-2xl font-bold text-cyan-400">Admin Login</h1>
        <input className="w-full p-2 rounded bg-gray-800 border border-gray-700" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="w-full p-2 rounded bg-gray-800 border border-gray-700" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)}/>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="w-full bg-blue-600 hover:bg-blue-500 p-2 rounded">Login</button>
      </form>
    </div>
  )
}