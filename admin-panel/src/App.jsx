import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase, ADMIN_EMAIL } from './supabase'
import Login from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App(){
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true)
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setUser(data.session?.user??null);setLoading(false)});const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>sub.subscription.unsubscribe()},[])
  if(loading) return <div className="route-loading">Loading...</div>
  const isAllowed = !!user && (!ADMIN_EMAIL || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  const admin = element => isAllowed ? element : <Navigate to="/admin/login" replace/>
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading">Loading admin panel...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to={isAllowed?'/admin':'/admin/login'} replace/>}/>
          <Route path="/admin/login" element={isAllowed?<Navigate to="/admin" replace/>:<Login/>}/>
          <Route path="/admin" element={admin(<Dashboard user={user}/>)}/>
          <Route path="/admin/projects" element={admin(<Dashboard user={user}/>)}/>
          <Route path="/admin/services" element={admin(<Dashboard user={user}/>)}/>
          <Route path="/admin/messages" element={admin(<Dashboard user={user}/>)}/>
          <Route path="/admin/settings" element={admin(<Dashboard user={user}/>)}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
