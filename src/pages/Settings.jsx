import { useState } from 'react'
import './Settings.css'

const TAXONOMY_CONFIG = [
  { label: 'Taxonomy Version',       value: 'UNSPSC v24.1201' },
  { label: 'Total Categories',       value: '57,832' },
  { label: 'Last Updated',           value: '2024-08-01' },
  { label: 'Custom Schema Overlays', value: '0 active' },
]

const TOGGLES = [
  { id: 't1', label: 'Auto-flag fields below confidence threshold', sub: 'Default threshold: 0.80', default: true },
  { id: 't2', label: 'Enable datasheet OCR extraction',             sub: 'Uses vision model — higher cost', default: true },
  { id: 't3', label: 'Auto-resolve single-source conflicts',        sub: 'Resolve when only 1 source available', default: false },
  { id: 't4', label: 'Send to review queue on missing required fields', sub: 'Required fields per UNSPSC schema', default: true },
  { id: 't5', label: 'Enable batch retry on error',                 sub: 'Retry failed SKUs up to 2×', default: false },
]

const NAV_ITEMS = ['Taxonomy', 'Processing Rules', 'Export']

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

function TaxonomySection() {
  return (
    <div className="settings-section open">
      <div className="settings-section-header" style={{ cursor: 'default' }}>
        <span className="settings-section-title">// Taxonomy &amp; Schema Config</span>
      </div>
      <div className="settings-section-body" style={{ maxHeight: '1000px' }}>
        <div className="settings-section-inner">
          {TAXONOMY_CONFIG.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--divider)' }}>
              <span className="text-label">{c.label}</span>
              <span className="text-value">{c.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn">Update Taxonomy</button>
            <button className="btn btn-ghost">Upload Custom Schema</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingRulesSection({ confThreshold, setConfThreshold }) {
  return (
    <div className="settings-section open">
      <div className="settings-section-header" style={{ cursor: 'default' }}>
        <span className="settings-section-title">// Processing Rules</span>
      </div>
      <div className="settings-section-body" style={{ maxHeight: '2000px' }}>
        <div className="settings-section-inner">
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
        </div>
      </div>
    </div>
  )
}

function ExportSection() {
  return (
    <div className="settings-section open">
      <div className="settings-section-header" style={{ cursor: 'default' }}>
        <span className="settings-section-title">// Export Configuration</span>
      </div>
      <div className="settings-section-body" style={{ maxHeight: '1000px' }}>
        <div className="settings-section-inner">
          <div className="text-label" style={{ marginBottom: 4 }}>Default export format</div>
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
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const [activeNav, setActiveNav] = useState('Taxonomy')
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
              id={`settings-nav-${item.toLowerCase().replace(/\s+/g, '-')}`}
              className={`settings-nav-item${activeNav === item ? ' active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content — only active section is rendered */}
        <div className="settings-content">
          {activeNav === 'Taxonomy' && <TaxonomySection />}
          {activeNav === 'Processing Rules' && (
            <ProcessingRulesSection
              confThreshold={confThreshold}
              setConfThreshold={setConfThreshold}
            />
          )}
          {activeNav === 'Export' && <ExportSection />}
        </div>
      </div>
    </div>
  )
}
