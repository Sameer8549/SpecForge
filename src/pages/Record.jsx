import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Record.css'
import { SkelFieldRow, ErrorPage, EmptyState, EntailmentLabel } from '../components/States'

const RECORD = {
  mpn: 'LM741CN/NOPB',
  brand: 'Texas Instruments',
  brandRaw: '-- No Unilog Brand --',
  brandResolved: true,
  brandConfidence: 0.96,
  brandUnicatId: '#48291',
  brandNote: 'Resolved from Manufacturer field — original was placeholder',
  manufacturer: 'Texas Instruments',
  manufacturerRaw: 'Texas Instruments Inc.',
  uom: 'EA',
  uomRaw: 'each',
  category: 'Electronics › ICs › Op-Amps — General Purpose',
  categoryCode: '32131601',
  meanConfidence: 0.91,
  fields: {
    'Electrical': [
      {
        name: 'Supply Voltage', value: '±18V', conf: 0.97, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '±18V', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Supply Voltage: ±18V (Recommended Operating Conditions)"', verificationReasoning: 'Primary manufacturer datasheet states ±18V as recommended supply; directly supports extracted value.' },
          { src: 'SRC-B', val: '±22V', url: 'octopart.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Max Supply Voltage: ±22V"', verificationReasoning: 'Distributor lists absolute maximum rating, not recommended supply — rejected as misattributed spec type.' },
          { src: 'SRC-D', val: '±18V', url: 'mouser.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Supply Voltage: ±18V"', verificationReasoning: 'Corroborates manufacturer value; treated as secondary confirmation.' },
        ],
      },
      {
        name: 'Input Offset Voltage', value: '6mV', conf: 0.94, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '6mV', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Input Offset Voltage (Vos): 6mV typ, 15mV max"', verificationReasoning: 'Typical value from current TI datasheet (rev. 2023) matches extracted value exactly.' },
          { src: 'SRC-D', val: '6mV', url: 'mouser.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Input Offset Voltage: 6mV"', verificationReasoning: 'Distributor spec matches manufacturer; corroborating source.' },
        ],
      },
      {
        name: 'Gain Bandwidth Product', value: '1MHz', conf: 0.99, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '1MHz', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Unity-Gain Bandwidth: 1MHz typ"', verificationReasoning: 'All four sources unanimously confirm 1MHz; highest-confidence field in this record.' },
          { src: 'SRC-B', val: '1MHz', url: 'octopart.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"GBW Product: 1 MHz"', verificationReasoning: 'Consistent with manufacturer datasheet.' },
          { src: 'SRC-C', val: '1MHz', url: 'datasheetarchive.com', srcType: 'Other', excerpt: '"Gain-Bandwidth Product: 1MHz"', verificationReasoning: 'Archived datasheet agrees; treated as corroborating secondary.' },
          { src: 'SRC-D', val: '1MHz', url: 'mouser.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Unity Gain BW: 1MHz"', verificationReasoning: 'Consistent with all other sources.' },
        ],
      },
      {
        name: 'Slew Rate', value: '0.5V/μs', conf: 0.93, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '0.5V/μs', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Slew Rate: 0.5V/μs typ (Unity Gain)"', verificationReasoning: 'Single-source from manufacturer datasheet; no conflicting values found across extraction.' },
        ],
      },
      {
        name: 'Input Bias Current', value: '80nA', conf: 0.88, req: true, entailment: 'partial',
        sources: [
          { src: 'SRC-A', val: '80nA', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Input Bias Current (Ib): 80nA typ"', verificationReasoning: 'Value sourced from manufacturer; only 2 of 4 sources provided this field — partial cross-reference coverage.' },
          { src: 'SRC-D', val: '80nA', url: 'mouser.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"IB Input Bias Current: 80nA typ"', verificationReasoning: 'Agrees with manufacturer; flagged due to incomplete source coverage across the extraction set.' },
        ],
      },
      {
        name: 'Open Loop Gain', value: '200V/mV', conf: 0.91, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '200V/mV', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Large Signal Voltage Gain: 200V/mV typ"', verificationReasoning: 'Manufacturer datasheet is the authoritative source; value directly supports extraction.' },
        ],
      },
      {
        name: 'Supply Current', value: '1.7mA', conf: 0.86, req: false, entailment: 'partial',
        sources: [
          { src: 'SRC-A', val: '1.7mA', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Supply Current (Icc): 1.7mA typ"', verificationReasoning: 'Value confirmed by 2 sources; partially supported due to limited cross-reference beyond manufacturer.' },
          { src: 'SRC-D', val: '1.7mA', url: 'mouser.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"ICC Supply Current: 1.7mA"', verificationReasoning: 'Agrees with manufacturer; confidence capped by overall source count for this field.' },
        ],
      },
      { name: 'Output Current',   value: null, conf: 0, req: false, missing: true, entailment: null, sources: [] },
      { name: 'Input Impedance',  value: null, conf: 0, req: false, missing: true, entailment: null, sources: [] },
    ],
    'Environmental': [
      {
        name: 'Operating Temperature', value: '0°C to 70°C', conf: 0.96, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '0°C to 70°C', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Operating Free-Air Temperature (TA): 0°C to 70°C (LM741CN)"', verificationReasoning: 'Commercial-grade part temperature range confirmed by manufacturer and distributor.' },
          { src: 'SRC-B', val: '0°C to 70°C', url: 'octopart.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Operating Temp: 0 to 70°C"', verificationReasoning: 'Consistent with manufacturer value.' },
        ],
      },
      {
        name: 'Storage Temperature', value: '-65°C to 150°C', conf: 0.89, req: false, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '-65°C to 150°C', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Storage Temperature Range (Tstg): −65°C to 150°C"', verificationReasoning: 'Single-source from manufacturer datasheet; industry-standard value for this package type.' },
        ],
      },
    ],
    'Physical': [
      {
        name: 'Package Type', value: 'DIP-8', conf: 0.99, req: true, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: 'DIP-8', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"Package: PDIP (D) | 8 pins"', verificationReasoning: '3 of 4 sources confirm DIP-8; manufacturer datasheet is authoritative.' },
          { src: 'SRC-B', val: 'DIP-8', url: 'octopart.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Package: DIP-8"', verificationReasoning: 'Corroborates manufacturer.' },
          { src: 'SRC-D', val: 'DIP-8', url: 'mouser.com/LM741CN', srcType: 'Authorized Distributor', excerpt: '"Package / Case: 8-DIP (0.300\", 7.62mm)"', verificationReasoning: 'Corroborates manufacturer.' },
        ],
      },
      {
        name: 'Pin Count', value: '8', conf: 0.99, req: false, entailment: 'supported',
        sources: [
          { src: 'SRC-A', val: '8', url: 'ti.com/product/LM741', srcType: 'Manufacturer Datasheet', excerpt: '"8-Lead PDIP (D)"', verificationReasoning: 'Directly stated in package description; consistent with DIP-8 designation.' },
        ],
      },
      { name: 'Channel Count',  value: null, conf: 0, req: false, missing: true, entailment: null, sources: [], lov: true },
    ],
  }
}

function ConfBar({ conf }) {
  const cls = conf >= 0.9 ? 'high' : conf >= 0.7 ? 'medium' : 'low'
  return (
    <div className="conf-bar">
      <div className={`conf-bar-fill ${cls}`} style={{ width: `${conf * 100}%` }} />
    </div>
  )
}

function LovStatus({ field }) {
  if (field.missing) return null
  if (field.lovFlagged) {
    return <span className="lov-status lov-flagged">[ LOV ⚠ ]</span>
  }
  if (field.lov) {
    return <span className="lov-status lov-match">[ VOC ✓ ]</span>
  }
  return null
}

function RecordField({ field, revealed }) {
  const [open, setOpen] = useState(false)
  const isMissing = field.missing
  const isEmpty = field.value === null && !field.missing

  return (
    <>
      <div className={`record-field-row${isMissing ? ' missing-known' : ''}`}>
        <div className="record-field-name">
          {field.name}
          {field.req && <span className="field-req-dot" title="Required" />}
        </div>
        <div className={`record-field-value${revealed ? ' revealing' : ''}${isMissing ? ' missing-known' : ''}${isEmpty ? ' empty-field' : ''}`}>
          {isMissing ? (
            <>
              <span className="record-missing-tag">Known Missing</span>
              Not found in any source
            </>
          ) : field.value ? (
            field.value
          ) : (
            '—'
          )}
          {field.sources && field.sources.length > 0 && (
            <button className="record-expand-btn" onClick={() => setOpen(o => !o)}>
              {open ? '▲ Sources' : '▼ Sources'} ({field.sources.length})
            </button>
          )}
        </div>
        <div className="record-field-conf">
          {field.conf > 0 && (
            <>
              <EntailmentLabel entailment={field.entailment} />
              <div className="record-field-conf-pct">{Math.round(field.conf * 100)}%</div>
              <ConfBar conf={field.conf} />
            </>
          )}
          <LovStatus field={field} />
        </div>
      </div>
      {field.sources && field.sources.length > 0 && (
        <div className={`record-provenance ${open ? 'open' : ''}`}>
          <div className="record-provenance-inner">
            <div className="record-provenance-header">
              <span>Source</span>
              <span>Type</span>
              <span>Excerpt</span>
              <span>Verification Reasoning</span>
            </div>
            {field.sources.map((s, i) => (
              <div key={i} className="record-provenance-row">
                <span className="record-provenance-src">[{s.src}]</span>
                <span className="record-provenance-srctype">{s.srcType}</span>
                <span className="record-provenance-excerpt">{s.excerpt}</span>
                <span className="record-provenance-reasoning">{s.verificationReasoning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function Record() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (id === 'error-demo') {
        setError({ code: 'ERR_FETCH', message: 'Failed to load product record. The work order ID may be invalid or the record has not been processed yet.' })
        setLoading(false)
        return
      }
      setLoading(false)
    }, 1200)
    const t2 = setTimeout(() => setRevealed(true), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [id])

  const allFields = Object.values(RECORD.fields).flat()
  const populated = allFields.filter(f => f.value !== null && !f.missing).length
  const missing   = allFields.filter(f => f.missing).length
  const flagged   = allFields.filter(f => f.conf > 0 && f.conf < 0.8).length

  if (loading) {
    return (
      <div className="record-page">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-header-label">// Product Record — {id}</span>
            <h1 className="page-header-title"><span className="skel skel-line skel-line-xl" style={{width:160, display:'inline-block'}} /></h1>
          </div>
        </div>
        <div className="record-layout">
          <div className="record-main">
            <div className="record-identity">
              <div>
                <div className="record-mpn"><span className="skel skel-line skel-line-xl" style={{width:200, display:'inline-block'}} /></div>
                <div style={{marginTop:8}}><span className="skel skel-line skel-line-sm" style={{width:160, display:'inline-block'}} /></div>
                <div style={{marginTop:6}}><span className="skel skel-line skel-line-sm" style={{width:280, display:'inline-block'}} /></div>
              </div>
            </div>
            <div className="record-section">
              <div className="record-section-title">// Loading fields...</div>
              {Array.from({length:8}).map((_,i) => <SkelFieldRow key={i} />)}
            </div>
          </div>
          <div className="record-sidebar">
            <div className="record-sidebar-section">
              <div className="record-sidebar-title">// Record Summary</div>
              <div style={{display:'flex',flexDirection:'column',gap:12,paddingTop:8}}>
                {Array.from({length:4}).map((_,i) => (
                  <span key={i} className="skel skel-line" style={{width:'80%'}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="record-page">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-header-label">// Product Record — {id}</span>
            <h1 className="page-header-title">Load Failed</h1>
          </div>
        </div>
        <ErrorPage
          code={error.code}
          title="Record Not Found"
          message={error.message}
          detail={`Work Order: ${id}\nTimestamp: ${new Date().toISOString()}`}
          onRetry={() => { setError(null); setLoading(true); }}
          onBack={() => navigate('/history')}
        />
      </div>
    )
  }

  return (
    <div className="record-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Product Record — {id}</span>
          <h1 className="page-header-title">{RECORD.mpn}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn" onClick={() => navigate(`/adjudication/${id}`)}>
            View Conflicts
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/queue')}>
            Review Queue ›
          </button>
        </div>
      </div>

      <div className="record-layout">
        {/* Main record */}
        <div className="record-main">
          <div className="record-identity">
            <div>
              <div className="record-mpn">{RECORD.mpn}</div>
              {/* Brand match status block */}
              <div className="record-brand-block">
                <div className="record-brand-row">
                  <span className="record-brand-label">Brand</span>
                  <span className="record-brand-val">{RECORD.brand}</span>
                  <span className="record-brand-id">{RECORD.brandUnicatId}</span>
                  {RECORD.brandResolved && (
                    <span className="record-brand-match">
                      [ ✓ Unicat Match — {Math.round(RECORD.brandConfidence * 100)}% ]
                    </span>
                  )}
                </div>
                <div className="record-brand-row dim">
                  <span className="record-brand-label">Raw</span>
                  <span className="record-brand-raw">{RECORD.brandRaw}</span>
                  <span className="placeholder-tag">placeholder</span>
                </div>
                <div className="record-brand-row dim">
                  <span className="record-brand-label">UOM</span>
                  <span className="record-brand-val">{RECORD.uom}</span>
                  <span className="record-brand-note">normalized from "{RECORD.uomRaw}"</span>
                </div>
              </div>
              <div className="record-category-path">
                {RECORD.category} — <span style={{ color: 'var(--red)' }}>{RECORD.categoryCode}</span>
              </div>
            </div>
            <div className="record-badges">
              <span className="badge badge-verified">✓ Verified</span>
              <span className="badge badge-neutral">WO: {id}</span>
              <span className="badge badge-neutral">CONF: {Math.round(RECORD.meanConfidence * 100)}%</span>
            </div>
          </div>

          {/* Field column headers */}
          <div className="record-field-headers">
            <div>Field</div>
            <div>Value</div>
            <div>Entailment / Conf.</div>
          </div>

          {/* Field sections */}
          {Object.entries(RECORD.fields).map(([section, fields]) => (
            <div key={section} className="record-section">
              <div className="record-section-title">// {section}</div>
              {fields.map((field, i) => (
                <RecordField key={i} field={field} revealed={revealed} />
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="record-sidebar">
          {/* Confidence summary */}
          <div className="record-sidebar-section">
            <div className="record-sidebar-title">// Record Summary</div>
            <div className="record-conf-summary">
              <div className="record-conf-cell">
                <div className="record-conf-num">{populated}</div>
                <div className="record-conf-lbl">Populated</div>
              </div>
              <div className="record-conf-cell">
                <div className="record-conf-num" style={{ color: 'var(--red)' }}>{missing}</div>
                <div className="record-conf-lbl">Known Missing</div>
              </div>
              <div className="record-conf-cell">
                <div className="record-conf-num" style={{ color: 'var(--amber)' }}>{flagged}</div>
                <div className="record-conf-lbl">Low Conf.</div>
              </div>
              <div className="record-conf-cell">
                <div className="record-conf-num">{Math.round(RECORD.meanConfidence * 100)}%</div>
                <div className="record-conf-lbl">Mean Conf.</div>
              </div>
            </div>
          </div>

          {/* Expected attrs checklist with entailment */}
          <div className="record-sidebar-section">
            <div className="record-sidebar-title">// Expected Attributes</div>
            {allFields.map((f, i) => (
              <div key={i} className="record-checklist-item">
                <span className={`record-check-icon${f.missing ? ' miss' : f.conf < 0.8 && f.conf > 0 ? ' low' : ' ok'}`}>
                  {f.missing ? '✗' : f.conf < 0.8 && f.conf > 0 ? '!' : '✓'}
                </span>
                <span className={`record-check-name${f.missing ? ' missing' : ''}`}>{f.name}</span>
                {f.entailment && (
                  <EntailmentLabel entailment={f.entailment} />
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="record-sidebar-section">
            <div className="record-sidebar-title">// Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/format/${id}`)}
              >
                Format & Validate
              </button>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/queue')}>
                Send to Review
              </button>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/adjudication/${id}`)}
              >
                View Conflicts
              </button>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(`/brand/${id}`)}
              >
                Brand Resolution
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
