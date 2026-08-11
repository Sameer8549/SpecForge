import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import './Layout.css'

const NAV_ITEMS = [
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
        <div className="nav-logo">
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
      <rect x="1" y="2" width="12" height="2.5"/><rect x="1" y="5.75" width="12" height="2.5"/><rect x="1" y="9.5" width="8" height="2.5"/>
    </svg>
  )
}
function IconBatch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="12" height="3"/><rect x="1" y="5.5" width="12" height="3"/><rect x="1" y="10" width="12" height="3"/>
    </svg>
  )
}
function IconLib() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 2h12v10H1z"/><line x1="1" y1="5" x2="13" y2="5"/><line x1="1" y1="8" x2="13" y2="8"/>
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"/>
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
