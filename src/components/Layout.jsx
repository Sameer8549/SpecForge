import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import './Layout.css'

const NAV_ITEMS = [
  {
    section: 'Platform',
    items: [
      { path: '/',        label: '// Overview',    icon: <IconHome /> },
    ]
  },
  {
    section: 'Operations',
    items: [
      { path: '/input',   label: '// New Record',  icon: <IconPlus /> },
      { path: '/queue',   label: '// Review Queue', icon: <IconQueue /> },
      { path: '/batch',   label: '// Batch Mode',   icon: <IconBatch /> },
    ]
  },
  {
    section: 'Data',
    items: [
      { path: '/history', label: '// Library',      icon: <IconLib /> },
      { path: '/audit',   label: '// Evaluation',   icon: <IconAudit /> },
    ]
  },
  {
    section: 'System',
    items: [
      { path: '/settings', label: '// Settings',    icon: <IconSettings /> },
    ]
  }
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  if (isLanding) return <Outlet />

  return (
    <div className="layout">
      {/* Mobile toggle */}
      <button className="nav-toggle" onClick={() => setOpen(true)} aria-label="Open navigation">
        <IconMenu />
      </button>

      {/* Overlay */}
      <div
        className={`nav-overlay ${open ? 'nav-open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`nav ${open ? 'nav-open' : ''}`}>
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-mark">SpecForge</div>
          <div className="nav-logo-sub">Product Intelligence</div>
        </div>

        {NAV_ITEMS.map(section => (
          <div className="nav-section" key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="nav-spacer" />

        <div className="nav-footer">
          <div className="nav-status">
            <div className="nav-status-dot" />
            Systems Nominal
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

/* ── Inline SVG Icons (phosphor-style, ultra-thin) ─────── */
function IconHome() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1.5 6L7 1.5L12.5 6V12.5H8.5V8.5H5.5V12.5H1.5V6Z"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/>
    </svg>
  )
}
function IconQueue() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="10" height="10" rx="0"/><line x1="4" y1="5" x2="10" y2="5"/><line x1="4" y1="7.5" x2="10" y2="7.5"/><line x1="4" y1="10" x2="8" y2="10"/>
    </svg>
  )
}
function IconBatch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="4" height="4"/><rect x="8" y="2" width="4" height="4"/><rect x="2" y="8" width="4" height="4"/><rect x="8" y="8" width="4" height="4"/>
    </svg>
  )
}
function IconLib() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2.5H5.5V12H2V2.5Z"/><path d="M5.5 2.5H9V12H5.5V2.5Z"/><path d="M9 2.5H12V12H9V2.5Z"/>
    </svg>
  )
}
function IconAudit() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="10" height="10" rx="0"/>
      <polyline points="4.5,7 6.5,9 9.5,5"/>
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="2.5"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.75 2.75l1.06 1.06M10.19 10.19l1.06 1.06M2.75 11.25l1.06-1.06M10.19 3.81l1.06-1.06"/>
    </svg>
  )
}
function IconMenu() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
    </svg>
  )
}
