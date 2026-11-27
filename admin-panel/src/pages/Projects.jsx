import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Icon, Modal, Confirm, ErrorBanner, EmptyState, Spinner, Field, inputClass } from '../components/ui'

const blank = { title: '', description: '', tech_stack: '', link: '', status: 'Published', image_url: '', sort_order: 0 }

export default function Projects({ notify, onChange }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(blank)
  const [edit, setEdit] = useState(null)
  const [file, setFile] = useState(null)
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('sort_order')
      if (error) throw error
      setRows((data || []).map(r => ({ ...r, status: r.visible === false ? 'Draft' : 'Published' })))
      setError('')
    } catch (err) {
      console.error('Projects load failed:', err)
      setError(err.message || 'Could not load projects.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const openAdd = () => { setForm(blank); setEdit(null); setFile(null); setOpen(true) }
  const openEdit = row => {
    setForm({ title: row.title || '', description: row.description || '', tech_stack: row.tech_stack || '', link: row.link || '', status: row.status, image_url: row.image_url || '', sort_order: row.sort_order || 0 })
    setEdit(row.id)
    setFile(null)
    setOpen(true)
  }

  const upload = async () => {
    if (!file) return form.image_url
    const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `projects/${Date.now()}-${name}`
    const { error } = await supabase.storage.from('portfolio').upload(path, file, { contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from('portfolio').getPublicUrl(path)
    return data.publicUrl
  }

  const save = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      if (!form.title.trim()) throw new Error('Title is required')
      const image_url = await upload()
      const payload = {
        title: form.title.trim(),
        description: form.description,
        tech_stack: form.tech_stack,
        link: form.link,
        visible: form.status === 'Published',
        image_url,
        sort_order: Number(form.sort_order) || 0
      }
      const result = edit
        ? await supabase.from('projects').update(payload).eq('id', edit)
        : await supabase.from('projects').insert(payload)
      if (result.error) throw result.error
      setOpen(false)
      notify(edit ? 'Project updated' : 'Project added')
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Project save failed:', err)
      notify(err.message || 'Could not save project', 'error')
      setError(err.message || 'Could not save project')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const id = confirmId
    setConfirmId(null)
    setBusy(true)
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      notify('Project deleted')
      setError('')
      await load()
      onChange?.()
    } catch (err) {
      console.error('Project delete failed:', err)
      notify(err.message || 'Could not delete project', 'error')
      setError(err.message || 'Could not delete project')
    } finally {
      setBusy(false)
    }
  }

  const query = search.trim().toLowerCase()
  const visible = query ? rows.filter(r => [r.title, r.description, r.tech_stack].some(v => (v || '').toLowerCase().includes(query))) : rows

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Projects</h2><p className="mt-1 text-sm text-slate-400">{rows.length} projects · published ones appear on your site</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"><Icon name="plus" className="w-4 h-4"/>Add project</button>
      </div>
      <ErrorBanner message={error}/>
      <div className="relative mb-5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon name="search" className="w-4 h-4"/></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className={`${inputClass} pl-10`}/>
      </div>
      {loading ? <Spinner label="Loading projects..."/> : rows.length === 0 ? <EmptyState text="No projects yet. Add your first one."/> : visible.length === 0 ? <EmptyState text="No matching projects."/> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map(r => (
            <article key={r.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#101a30] p-4">
              <div className="flex gap-4">
                {r.image_url ? <img src={r.image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover"/> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500"><Icon name="image" className="w-6 h-6"/></div>}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{r.title}</h3><span className={`rounded-full px-2 py-0.5 text-[11px] ${r.status === 'Published' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-500/20 text-slate-400'}`}>{r.status}</span></div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{r.description || 'No description'}</p>
                </div>
              </div>
              {r.tech_stack && <div className="flex flex-wrap gap-1.5">{String(r.tech_stack).split(',').map((tag, i) => <span key={i} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-300">{tag.trim()}</span>)}</div>}
              <div className="mt-auto flex flex-wrap items-center gap-2">
                {r.link && <a href={r.link} target="_blank" rel="noopener" className="mr-auto text-xs text-cyan-300 hover:text-cyan-200">Open live ↗</a>}
                <button onClick={() => openEdit(r)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"><Icon name="edit" className="w-3.5 h-3.5"/>Edit</button>
                <button onClick={() => setConfirmId(r.id)} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/10"><Icon name="trash" className="w-3.5 h-3.5"/>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {open && <Modal title={edit ? 'Edit project' : 'Add project'} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Title"><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project title" className={inputClass} required/></Field>
          <Field label="Description"><textarea value={form.description} onChange={e => set('description', e.target.value)} rows="3" placeholder="What did you build?" className={inputClass}/></Field>
          <Field label="Tech stack"><input value={form.tech_stack} onChange={e => set('tech_stack', e.target.value)} placeholder="React, Firebase, Node.js" className={inputClass}/></Field>
          <Field label="Live URL"><input value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://..." className={inputClass}/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status"><select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}><option>Published</option><option>Draft</option></select></Field>
            <Field label="Sort order"><input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={inputClass}/></Field>
          </div>
          <Field label="Image"><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className={inputClass}/></Field>
          {form.image_url && !file && <img src={form.image_url} alt="Current project" className="h-24 rounded-xl object-cover"/>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={busy} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{busy ? 'Saving...' : edit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>}
      {confirmId && <Confirm text="Delete this project permanently?" onCancel={() => setConfirmId(null)} onConfirm={remove} busy={busy}/>}
    </div>
  )
}
