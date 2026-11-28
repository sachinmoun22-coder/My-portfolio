import { useState } from 'react'
import { supabase, ADMIN_EMAIL } from '../supabase'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Icon } from '../components/ui'

export default function Login(){
  const [email,setEmail]=useState(''),[pass,setPass]=useState(''),[err,setErr]=useState('')
  const nav=useNavigate()
  const submit=async(e)=>{
    e.preventDefault()
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass})
    if(error){setErr(error.message);return}
    if(ADMIN_EMAIL && data.user?.email?.toLowerCase()!==ADMIN_EMAIL.toLowerCase()){
      await supabase.auth.signOut()
      setErr('This email is not allowed')
      return
    }
    nav('/admin')
  }
  return (
    <div className="auth-page">
      <form onSubmit={submit} className="auth-card">
        <div className="auth-logo"><Icon name="shield" className="icon-24"/></div>
        <p className="auth-eyebrow">Admin panel</p>
        <h1 className="auth-title">Sachin Moun</h1>
        <p className="auth-subtitle">Sign in to manage your portfolio content.</p>
        <div className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <div className="auth-input-wrap"><Icon name="mail" className="icon-18"/><input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          </label>
          <label className="auth-field">
            <span>Password</span>
            <div className="auth-input-wrap"><Icon name="lock" className="icon-18"/><input className="auth-input" type="password" placeholder="Enter your password" value={pass} onChange={e=>setPass(e.target.value)}/></div>
          </label>
          {err && <p className="auth-error"><AlertCircle className="icon-18"/>{err}</p>}
          <button className="auth-button" type="submit"><Icon name="login" className="icon-18"/>Login</button>
        </div>
      </form>
    </div>
  )
}
