import { useEffect } from 'react'

export function Icon({ name, className = 'w-5 h-5' }) {
  const common = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'dashboard') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  if (name === 'projects') return <svg {...common}><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/></svg>
  if (name === 'services') return <svg {...common}><path d="M12 3l2.4 5.1 5.6.8-4 4 .9 5.6-4.9-2.7-4.9 2.7.9-5.6-4-4 5.6-.8z"/></svg>
  if (name === 'messages') return <svg {...common}><path d="M4 5h16v11H8l-4 4z"/></svg>
  if (name === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21v4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  if (name === 'logout') return <svg {...common}><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5"/><path d="M15 8l4 4-4 4M19 12H9"/></svg>
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
  if (name === 'edit') return <svg {...common}><path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 6l4 4"/></svg>
  if (name === 'trash') return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
  if (name === 'check') return <svg {...common}><path d="M5 12l5 5L20 7"/></svg>
  if (name === 'close') return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>
  if (name === 'menu') return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  if (name === 'mail') return <svg {...common}><path d="M3 5h18v14H3z"/><path d="M3 6l9 7 9-7"/></svg>
  if (name === 'unread') return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>
  if (name === 'image') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-6 6"/></svg>
  return null
}

export function Toasts({ items }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-[min(92vw,22rem)] flex-col gap-2">
      {items.map(t => (
        <div key={t.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${t.type === 'error' ? 'border-rose-500/40 bg-rose-950/95 text-rose-100' : 'border-cyan-400/30 bg-slate-900/95 text-slate-100'}`}>
          <span className={t.type === 'error' ? 'text-rose-400' : 'text-cyan-300'}><Icon name={t.type === 'error' ? 'close' : 'check'} className="w-4 h-4"/></span>
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-[#111a30] p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><Icon name="close" className="w-4 h-4"/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ text, onCancel, onConfirm, busy }) {
  return (
    <Modal title="Confirm delete" onClose={onCancel}>
      <p className="text-sm leading-relaxed text-slate-300">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">{busy ? 'Deleting...' : 'Delete'}</button>
      </div>
    </Modal>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/60 px-4 py-3 text-sm text-rose-100">{message}</div>
}

export function EmptyState({ text }) {
  return <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center text-sm text-slate-400">{text}</div>
}

export function Spinner({ label = 'Loading...' }) {
  return <div className="flex items-center gap-3 py-10 text-sm text-slate-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"/>{label}</div>
}

export function Field({ label, children }) {
  return <label className="block text-sm text-slate-300"><span className="mb-1.5 block font-medium">{label}</span>{children}</label>
}

export const inputClass = 'w-full rounded-lg border border-white/10 bg-[#0b1224] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20'
