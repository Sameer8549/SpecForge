import { useState } from 'react'
import './Settings.css'

const API_KEYS = [
  { name: 'OpenAI', env: 'OPENAI_API_KEY',    masked: 'sk-...9xAb', status: 'ok' },
  { name: 'Anthropic', env: 'ANTHROPIC_API_KEY', masked: 'sk-ant-...mZ7k', status: 'ok' },
  { name: 'Google',   env: 'GOOGLE_API_KEY',   masked: '—',       status: 'missing' },
]

const MODEL_ROUTES = [
  { role: 'Primary',    model: 'gpt-4o',           desc: 'Classify + Extract + Adjudicate' },
  { role: 'Fallback',   model: 'claude-3-5-sonnet', desc: 'All stages if primary fails' },
  { role: 'Audit',      model: 'gpt-4o-mini',       desc: 'Confidence scoring only' },
]

const TAXONOMY_CONFIG = [
  { label: 'Taxonomy Version',      value: 'UNSPSC v24.1201' },
  { label: 'Total Categories',      value: '57,832' },
  { label: 'Last Updated',          value: '2024-08-01' },
  { label: 'Custom Schema Overlays', value: '0 active' },
]

const TOGGLES = [
  { id: 't1', label: 'Auto-flag fields below confidence threshold', sub: 'Default threshold: 0.80', default: true },
  { id: 't2', label: 'Enable datasheet OCR extraction',             sub: 'Uses vision model — higher cost', default: true },
  { id: 't3', label: 'Auto-resolve single-source conflicts',        sub: 'Resolve when only 1 source available', default: false },
  { id: 't4', label: 'Send to review queue on missing required fields', sub: 'Required fields per UNSPSC schema', default: true },
  { id: 't5', label: 'Enable batch retry on error',                 sub: 'Retry failed SKUs up to 2×', default: false },
]

const NAV_ITEMS = ['API Keys', 'Model Routing', 'Taxonomy', 'Processing Rules', 'Export']

function SettingsSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`settings-section${open ? ' open' : ''}`}>
      <div className="settings-section-header" onClick={() => setOpen(o => !o)}>
        <span className="settings-section-title">// {title}</span>
        <span className="settings-section-chevron">▾</span>
      </div>
      <div className="settings-section-body">
        <div className="settings-section-inner">{children}</div>
      </div>
    </div>
  )
}

function Toggle({ id, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <label className="toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => setChecked(e.target.checked)}
      />
      <span className="toggle-slider" />
    </label>
  )
}

export default function Settings() {
  const [activeNav, setActiveNav] = useState('API Keys')
  const [confThreshold, setConfThreshold] = useState('0.80')
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// System</span>
          <h1 className="page-header-title">Settings</h1>
        </div>
        <div className="page-header-right">
          {saved && <span className="badge badge-verified">✓ Saved</span>}
          <button className="btn btn-primary" onClick={save}>Save Changes</button>
        </div>
      </div>

      <div className="settings-layout">
        {/* Nav rail */}
        <div className="settings-nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item}
              className={`settings-nav-item${activeNav === item ? ' active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* API Keys */}
          <SettingsSection title="API Key Management" defaultOpen>
            <div className="text-label" style={{ marginBottom: 4 }}>
              Keys are read from environment variables. Set in your .env file or deployment config.
            </div>
            {API_KEYS.map(k => (
              <div key={k.name} className="api-key-row">
                <div className="api-key-name">{k.name}</div>
                <div className="api-key-value">{k.masked}</div>
                <div className={`api-key-status${k.status === 'ok' ? ' ok' : ' missing'}`}>
                  {k.status === 'ok' ? '✓ Active' : '✗ Not set'}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn">Verify All Keys</button>
              <button className="btn btn-ghost">View .env Template</button>
            </div>
          </SettingsSection>

          {/* Model routing */}
          <SettingsSection title="Model Routing">
            {MODEL_ROUTES.map((m, i) => (
              <div key={i} className="model-route-row">
                <div className="model-role">{m.role}</div>
                <div>
                  <div className="model-route-name">{m.model}</div>
                  <div className="text-label" style={{ marginTop: 2 }}>{m.desc}</div>
                </div>
                <select className="field-select" style={{ fontSize: '0.6875rem', padding: '6px 8px' }}>
                  <option>gpt-4o</option>
                  <option>claude-3-5-sonnet</option>
                  <option>gpt-4o-mini</option>
                  <option>gemini-1.5-pro</option>
                </select>
              </div>
            ))}
          </SettingsSection>

          {/* Taxonomy */}
          <SettingsSection title="Taxonomy & Schema Config">
            {TAXONOMY_CONFIG.map((c, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:12, padding:'8px 0', borderBottom:'1px solid var(--divider)' }}>
                <span className="text-label">{c.label}</span>
                <span className="text-value">{c.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn">Update Taxonomy</button>
              <button className="btn btn-ghost">Upload Custom Schema</button>
            </div>
          </SettingsSection>

          {/* Processing rules */}
          <SettingsSection title="Processing Rules">
            <div className="field" style={{ maxWidth: 280 }}>
              <label className="field-label" htmlFor="conf-thresh">Confidence Threshold</label>
              <input
                id="conf-thresh"
                className="field-input"
                value={confThreshold}
                onChange={e => setConfThreshold(e.target.value)}
                placeholder="0.00 – 1.00"
              />
              <span className="field-hint">Fields below this threshold are flagged for human review.</span>
            </div>
            {TOGGLES.map(t => (
              <div key={t.id} className="toggle-row">
                <div>
                  <div className="toggle-label">{t.label}</div>
                  <div className="toggle-label-sub">{t.sub}</div>
                </div>
                <Toggle id={t.id} defaultChecked={t.default} />
              </div>
            ))}
          </SettingsSection>

          {/* Export */}
          <SettingsSection title="Export Configuration">
            <div className="text-label" style={{ marginBottom: 12 }}>Default export format</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['JSON', 'CSV', 'XLSX', 'XML'].map(fmt => (
                <button key={fmt} className={`btn${fmt === 'JSON' ? ' btn-primary' : ''}`}>{fmt}</button>
              ))}
            </div>
            <div className="field" style={{ maxWidth: 400, marginTop: 8 }}>
              <label className="field-label" htmlFor="export-webhook">Webhook URL (optional)</label>
              <input
                id="export-webhook"
                className="field-input"
                placeholder="https://your-system.com/api/webhook"
              />
              <span className="field-hint">POST completed records to this endpoint automatically.</span>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}
