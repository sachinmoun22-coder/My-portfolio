import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Public from './pages/Public'

export default function App(){
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setUser(data.session?.user??null);setLoading(false)});const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>sub.subscription.unsubscribe()},[])
  if(loading) return <div className="p-8 text-white">Loading...</div>
  const isAllowed = !!user
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Public/>}/>
        <Route path="/admin/login" element={isAllowed?<Navigate to="/admin"/>:<Login/>}/>
        <Route path="/admin/*" element={isAllowed?<Dashboard user={user}/>:<Navigate to="/admin/login"/>}/>
      </Routes>
    </BrowserRouter>
  )
}