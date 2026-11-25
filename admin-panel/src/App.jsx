import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth, ADMIN_EMAIL } from './firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Public from './pages/Public'

export default function App(){
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)}),[])
  if(loading) return <div className="p-8 text-white">Loading...</div>
  const isAllowed = user && user.email===ADMIN_EMAIL
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
