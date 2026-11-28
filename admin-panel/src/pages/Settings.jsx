import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { ErrorBanner, Field, Icon, inputClass, Spinner } from '../components/ui'

const keys = ['hero_name', 'hero_title', 'contact_email', 'contact_phone', 'footer_text']

export default function Settings({ user, notify }) {
  const [email, setEmail] = useState(user.email || '')
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data, error } = await supabase.from('site_content').select('key,value')
      if (error) throw error
      setContent(Object.fromEntries((data || []).map(row => [row.key, row.value || ''])))
      setError('')
    } catch (err) {
      console.error('Settings load failed:', err)
      setError(err.message || 'Could not load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (key, value) => setContent(current => ({ ...current, [key]: value }))

  const saveEmail = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      if (!email.trim()) throw new Error('Email is required')
      const { error } = await supabase.auth.updateUser({ email: email.trim() })
      if (error) throw error
      notify('Confirmation sent to your new email')
      setError('')
    } catch (err) {
      console.error('Email update failed:', err)
      notify(err.message || 'Could not update email', 'error')
      setError(err.message || 'Could not update email')
    } finally {
      setBusy(false)
    }
  }

  const saveContent = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = keys.map(key => ({ key, value: content[key] || '' }))
      const { error } = await supabase.from('site_content').upsert(payload)
      if (error) throw error
      notify('Profile saved')
      setError('')
    } catch (err) {
      console.error('Profile save failed:', err)
      notify(err.message || 'Could not save profile', 'error')
      setError(err.message || 'Could not save profile')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header"><div className="page-heading"><p className="eyebrow">Site</p><h2>Settings</h2><p>Manage your admin account and the content shown on your site.</p></div></div>
      <ErrorBanner message={error}/>
      {loading ? <Spinner label="Loading settings..."/> : (
        <div className="settings-grid">
          <form onSubmit={saveEmail} className="card settings-card">
            <div className="settings-heading"><span className="settings-icon"><Icon name="settings" className="icon-20"/></span><div><h3>Admin account</h3><p>Login email</p></div></div>
            <Field label="Admin email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass}/></Field>
            <p className="settings-note">Supabase sends a confirmation link when you change your email. Update <code>VITE_ADMIN_EMAIL</code> in .env too.</p>
            <div><button disabled={busy} className="button primary"><Icon name="check" className="icon-16"/>Update email</button></div>
          </form>
          <form onSubmit={saveContent} className="card settings-card">
            <div className="settings-heading"><span className="settings-icon"><Icon name="projects" className="icon-20"/></span><div><h3>Public profile</h3><p>Shown on your portfolio site</p></div></div>
            <Field label="Name"><input value={content.hero_name || ''} onChange={e => set('hero_name', e.target.value)} className={inputClass}/></Field>
            <Field label="Tagline"><input value={content.hero_title || ''} onChange={e => set('hero_title', e.target.value)} className={inputClass}/></Field>
            <Field label="Contact email"><input value={content.contact_email || ''} onChange={e => set('contact_email', e.target.value)} className={inputClass}/></Field>
            <Field label="Contact phone"><input value={content.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} className={inputClass}/></Field>
            <Field label="Footer text"><input value={content.footer_text || ''} onChange={e => set('footer_text', e.target.value)} className={inputClass}/></Field>
            <div><button disabled={busy} className="button primary"><Icon name="check" className="icon-16"/>Save profile</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
