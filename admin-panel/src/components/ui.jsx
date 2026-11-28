import { useEffect } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MailOpen,
  Menu,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  X
} from 'lucide-react'

const icons = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  services: Sparkles,
  messages: MessageSquare,
  settings: SettingsIcon,
  logout: LogOut,
  plus: Plus,
  search: Search,
  edit: Pencil,
  trash: Trash2,
  check: Check,
  close: X,
  menu: Menu,
  mail: Mail,
  unread: MailOpen,
  image: ImageIcon,
  shield: ShieldCheck,
  lock: Lock,
  login: LogIn
}

export function Icon({ name, className = 'icon-20' }) {
  const Component = icons[name] || Circle
  return <Component className={className} aria-hidden="true" />
}

export function Toasts({ items }) {
  return (
    <div className="toast-stack">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : 'success'}`}>
          {t.type === 'error' ? <X className="icon-18"/> : <CheckCircle2 className="icon-18"/>}
          <span>{t.message}</span>
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
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-overlay-backdrop" onClick={onClose}/>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="icon-button"><X className="icon-18"/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ text, onCancel, onConfirm, busy }) {
  return (
    <Modal title="Confirm delete" onClose={onCancel}>
      <p className="settings-note">{text}</p>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button secondary">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="button danger">{busy ? 'Deleting...' : 'Delete'}</button>
      </div>
    </Modal>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return <div className="error-banner"><AlertCircle className="icon-18"/><span>{message}</span></div>
}

export function EmptyState({ text }) {
  return <div className="empty-state"><Inbox className="icon-24"/><span>{text}</span></div>
}

export function Spinner({ label = 'Loading...' }) {
  return <div className="spinner"><Loader2 className="icon-18"/><span>{label}</span></div>
}

export function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

export const inputClass = 'form-control'
