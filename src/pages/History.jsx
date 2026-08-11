import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './History.css'
import { SkelTableRow, ErrorInline, EmptyState } from '../components/States'

const RECORDS = [
  { mpn: 'LM741CN',   brand: 'Texas Instruments',   category: 'Op-Amps',       fields: 11, conf: 0.91, date: '2024-08-11', status: 'complete', wo: 'WO-20240811-001' },
  { mpn: 'BC547B',    brand: 'Fairchild',            category: 'Transistors',   fields: 9,  conf: 0.84, date: '2024-08-10', status: 'review',   wo: 'WO-20240810-042' },
  { mpn: '1N4007',    brand: 'ON Semiconductor',     category: 'Diodes',        fields: 8,  conf: 0.78, date: '2024-08-10', status: 'review',   wo: 'WO-20240810-039' },
  { mpn: 'LM358N',    brand: 'Texas Instruments',    category: 'Op-Amps',       fields: 12, conf: 0.97, date: '2024-08-09', status: 'complete', wo: 'WO-20240809-031' },
  { mpn: 'NE555P',    brand: 'Texas Instruments',    category: 'Timers',        fields: 10, conf: 0.88, date: '2024-08-09', status: 'complete', wo: 'WO-20240809-028' },
  { mpn: 'IRF540N',   brand: 'Int. Rectifier',       category: 'MOSFETs',       fields: 11, conf: 0.93, date: '2024-08-08', status: 'complete', wo: 'WO-20240808-019' },
  { mpn: 'LM317T',    brand: 'Texas Instruments',    category: 'Regulators',    fields: 10, conf: 0.95, date: '2024-08-07', status: 'complete', wo: 'WO-20240807-012' },
  { mpn: 'MAX232CPE', brand: 'Maxim Integrated',     category: 'Interface ICs', fields: 9,  conf: 0.82, date: '2024-08-06', status: 'complete', wo: 'WO-20240806-008' },
]

const CATEGORIES = ['All', 'Op-Amps', 'Transistors', 'Diodes', 'Timers', 'MOSFETs', 'Regulators', 'Interface ICs']
const BRANDS     = ['All', 'Texas Instruments', 'Fairchild', 'ON Semiconductor', 'Int. Rectifier', 'Maxim Integrated']

export default function History() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [brandFilter, setBrandFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Simulate initial data load
  useState(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  })

  const filtered = RECORDS
    .filter(r => {
      if (catFilter !== 'All' && r.category !== catFilter) return false
      if (brandFilter !== 'All' && r.brand !== brandFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return r.mpn.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'conf') return b.conf - a.conf
      if (sortBy === 'mpn')  return a.mpn.localeCompare(b.mpn)
      return 0
    })

  // Loading skeleton
  if (loading) {
    return (
      <div className="history-page">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-header-label">// Data Library</span>
            <h1 className="page-header-title">Record History</h1>
          </div>
        </div>
        <div className="history-layout">
          <div className="history-filters">
            <div className="history-filter-section">
              <div className="history-filter-title">// Search</div>
              <span className="skel skel-line" style={{width:'100%',height:32}} />
            </div>
            <div className="history-filter-section">
              <div className="history-filter-title">// Category</div>
              {Array.from({length:5}).map((_,i) => <span key={i} className="skel skel-line skel-line-sm" style={{width:'70%',display:'block',marginBottom:8}} />)}
            </div>
          </div>
          <div className="history-main">
            <div className="history-list-header"><span className="skel skel-line skel-line-sm" style={{width:200}} /></div>
            {Array.from({length:6}).map((_,i) => <SkelTableRow key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className="history-page">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-header-label">// Data Library</span>
            <h1 className="page-header-title">Record History</h1>
          </div>
        </div>
        <div style={{padding:32}}>
          <ErrorInline
            code="ERR_LIBRARY"
            message="Failed to load record library. Check your network connection and API key configuration."
            onRetry={() => { setFetchError(null); setLoading(true); }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="history-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Data Library</span>
          <h1 className="page-header-title">Record History</h1>
        </div>
        <div className="page-header-right">
          <span className="text-label">{filtered.length} / {RECORDS.length} records</span>
          <button className="btn btn-ghost">Export All</button>
          <button className="btn btn-primary" onClick={() => navigate('/input')}>
            + New Record
          </button>
        </div>
      </div>

      <div className="history-layout">
        {/* Filter rail */}
        <div className="history-filters">
          <div className="history-filter-section">
            <div className="history-filter-title">// Search</div>
            <input
              className="history-search"
              placeholder="MPN or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="history-filter-section">
            <div className="history-filter-title">// Category</div>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`history-filter-chip${catFilter === c ? ' active' : ''}`}
                onClick={() => setCatFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="history-filter-section">
            <div className="history-filter-title">// Brand</div>
            {BRANDS.map(b => (
              <button
                key={b}
                className={`history-filter-chip${brandFilter === b ? ' active' : ''}`}
                onClick={() => setBrandFilter(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Main list */}
        <div className="history-main">
          <div className="history-list-header">
            <span className="text-label">// Sort by:</span>
            {[['date', 'Date'], ['conf', 'Confidence'], ['mpn', 'MPN']].map(([k, label]) => (
              <button
                key={k}
                className={`history-sort-btn${sortBy === k ? ' active' : ''}`}
                onClick={() => setSortBy(k)}
              >
                {label} {sortBy === k ? '▾' : ''}
              </button>
            ))}
          </div>

          {/* Column headers */}
          <div className="history-record-row" style={{ cursor: 'default', opacity: 0.5 }}>
            <div className="hcol-mpn" style={{ fontFamily:'var(--font-mono)', fontSize:'0.5625rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)' }}>MPN</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.5625rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)' }}>Brand</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.5625rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)' }}>Category</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.5625rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)' }}>Fields</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.5625rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)' }}>Conf.</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.5625rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-dim)' }}>Actions</div>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-art">{'[ ? ]'}</div>
              <div className="empty-state-title">No Records Found</div>
              <div className="empty-state-desc">Try adjusting your search or filters.</div>
              <button className="btn" onClick={() => { setSearch(''); setCatFilter('All'); setBrandFilter('All') }}>
                Clear Filters
              </button>
            </div>
          )}

          {filtered.map((r, i) => (
            <div
              key={i}
              className="history-record-row"
              onClick={() => navigate(`/record/${r.wo}`)}
            >
              <div className="hcol-mpn">{r.mpn}</div>
              <div>{r.brand}</div>
              <div>{r.category}</div>
              <div>{r.fields}</div>
              <div style={{ color: r.conf >= 0.9 ? 'var(--green)' : r.conf >= 0.75 ? 'var(--amber)' : 'var(--red)' }}>
                {Math.round(r.conf * 100)}%
              </div>
              <div>
                <span className={`badge${r.status === 'complete' ? ' badge-verified' : r.status === 'review' ? ' badge-warning' : ' badge-neutral'}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
