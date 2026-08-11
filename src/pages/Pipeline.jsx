import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Pipeline.css'

const STAGES = [
  {
    id: 'classify',
    name: 'Classify',
    desc: 'Resolve product category path and build expected-attributes checklist',
    duration: 1800,
  },
  {
    id: 'extract',
    name: 'Extract',
    desc: 'Pull structured attributes from all available sources simultaneously',
    duration: 2400,
  },
  {
    id: 'verify',
    name: 'Verify',
    desc: 'Cross-reference every field across sources, flag conflicts',
    duration: 1600,
  },
  {
    id: 'adjudicate',
    name: 'Adjudicate',
    desc: 'Resolve disagreements with documented reasoning per field',
    duration: 1200,
  },
  {
    id: 'audit',
    name: 'Audit',
    desc: 'Generate per-field confidence scores, provenance, and missing-field markers',
    duration: 1000,
  },
]

const CLASSIFY_PATH = [
  { label: 'Electronics', code: '32000000', final: false },
  { label: 'Electronic Components', code: '32100000', final: false },
  { label: 'Integrated Circuits', code: '32131600', final: false },
  { label: 'Operational Amplifiers — General Purpose', code: '32131601', final: true },
]

const EXPECTED_ATTRS = [
  { name: 'Supply Voltage',        req: true },
  { name: 'Input Offset Voltage',  req: true },
  { name: 'Gain Bandwidth Product',req: true },
  { name: 'Slew Rate',             req: true },
  { name: 'Input Bias Current',    req: true },
  { name: 'Output Current',        req: false },
  { name: 'Operating Temperature', req: true },
  { name: 'Package Type',          req: true },
  { name: 'Pin Count',             req: false },
  { name: 'Supply Current',        req: false },
  { name: 'Common Mode Range',     req: false },
  { name: 'Open Loop Gain',        req: true },
  { name: 'Channel Count',         req: false },
  { name: 'Input Impedance',       req: false },
]

const LOG_LINES_BY_STAGE = {
  classify: [
    { type: '', text: '$ classify --mpn=LM741CN --brand="Texas Instruments"' },
    { type: '', text: 'Querying taxonomy database...' },
    { type: 'log-success', text: '✓ Category match confidence: 0.97' },
    { type: 'log-heading', text: '[ Category Path Resolved ]' },
    { type: '', text: '  Electronics > Electronic Components > ICs > Op-Amps' },
    { type: 'log-success', text: '✓ 14 expected attributes loaded for category 32131601' },
    { type: '', text: '  Required: 7   Optional: 7' },
    { type: 'log-success', text: '✓ Classify complete — 1.8s' },
  ],
  extract: [
    { type: 'log-heading', text: '[ Extract ] Pulling from 4 sources...' },
    { type: '', text: '  SRC-A: ti.com/product/LM741' },
    { type: '', text: '  SRC-B: octopart.com/LM741CN' },
    { type: '', text: '  SRC-C: datasheetarchive.com' },
    { type: '', text: '  SRC-D: mouser.com' },
    { type: 'log-success', text: '✓ SRC-A: 11/14 fields extracted' },
    { type: 'log-success', text: '✓ SRC-B: 9/14 fields extracted' },
    { type: 'log-warn', text: '⚠ SRC-C: 6/14 fields — low coverage' },
    { type: 'log-success', text: '✓ SRC-D: 10/14 fields extracted' },
    { type: 'log-success', text: '✓ Extract complete — 2.4s' },
  ],
  verify: [
    { type: 'log-heading', text: '[ Verify ] Cross-referencing all sources...' },
    { type: 'log-success', text: '✓ Supply Voltage: ±18V — 3/4 sources agree' },
    { type: 'log-warn', text: '⚠ CONFLICT — Supply Voltage: SRC-B reports ±22V' },
    { type: 'log-success', text: '✓ Input Offset Voltage: 6mV — all sources agree' },
    { type: 'log-success', text: '✓ GBW Product: 1MHz — 4/4 sources agree' },
    { type: 'log-success', text: '✓ Package: DIP-8 — 4/4 sources agree' },
    { type: 'log-success', text: '✓ Verify complete — 1 conflict flagged' },
  ],
  adjudicate: [
    { type: 'log-heading', text: '[ Adjudicate ] Resolving 1 conflict...' },
    { type: '', text: '  Field: Supply Voltage' },
    { type: '', text: '  SRC-A (ti.com): ±18V  — manufacturer primary' },
    { type: '', text: '  SRC-B (octopart): ±22V — distributor listing' },
    { type: '', text: '  Rule: Manufacturer primary source takes precedence' },
    { type: 'log-success', text: '✓ Resolved: ±18V  Confidence: 0.94' },
    { type: 'log-success', text: '✓ Adjudication reasoning stored' },
    { type: 'log-success', text: '✓ Adjudicate complete — 1.2s' },
  ],
  audit: [
    { type: 'log-heading', text: '[ Audit ] Generating final record...' },
    { type: 'log-success', text: '✓ 11 fields populated' },
    { type: 'log-warn', text: '⚠ 3 fields missing: Output Current, Input Impedance, Channel Count' },
    { type: '', text: '  Known-missing markers applied' },
    { type: '', text: '  Mean confidence: 0.91' },
    { type: 'log-success', text: '✓ Record WO-20240811-001 written' },
    { type: 'log-success', text: '✓ Added to review queue for human approval' },
    { type: 'log-success', text: '✓ Audit complete — 1.0s' },
  ],
}

function StageStatus({ status }) {
  if (status === 'pending') return <span className="pipeline-stage-status stage-status-pending">[ Pending ]</span>
  if (status === 'running') return <span className="pipeline-stage-status stage-status-running">[ Running ]</span>
  if (status === 'done')    return <span className="pipeline-stage-status stage-status-done">[ Done ]</span>
  if (status === 'error')   return <span className="pipeline-stage-status stage-status-error">[ Error ]</span>
  return null
}

export default function Pipeline() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [stageStatuses, setStageStatuses] = useState(
    STAGES.reduce((acc, s) => ({ ...acc, [s.id]: 'pending' }), {})
  )
  const [activeStage, setActiveStage] = useState('classify')
  const [selectedStage, setSelectedStage] = useState('classify')
  const [elapsed, setElapsed] = useState({})
  const [visibleLogs, setVisibleLogs] = useState({ classify: [], extract: [], verify: [], adjudicate: [], audit: [] })
  const [done, setDone] = useState(false)

  const logRef = useRef(null)
  const timeoutsRef = useRef([])

  useEffect(() => {
    let cumulativeDelay = 0

    STAGES.forEach((stage, stageIdx) => {
      const startDelay = cumulativeDelay

      // Start stage
      const t1 = setTimeout(() => {
        setStageStatuses(prev => ({ ...prev, [stage.id]: 'running' }))
        setActiveStage(stage.id)
        setSelectedStage(stage.id)

        // Stream log lines
        const lines = LOG_LINES_BY_STAGE[stage.id] || []
        lines.forEach((line, i) => {
          const lt = setTimeout(() => {
            setVisibleLogs(prev => ({
              ...prev,
              [stage.id]: [...prev[stage.id], i]
            }))
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
          }, (i + 1) * (stage.duration / lines.length))
          timeoutsRef.current.push(lt)
        })
      }, startDelay)

      // End stage
      const t2 = setTimeout(() => {
        setStageStatuses(prev => ({ ...prev, [stage.id]: 'done' }))
        setElapsed(prev => ({ ...prev, [stage.id]: stage.duration }))
        if (stageIdx === STAGES.length - 1) {
          setDone(true)
        }
      }, startDelay + stage.duration)

      timeoutsRef.current.push(t1, t2)
      cumulativeDelay += stage.duration
    })

    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  const currentStageData = STAGES.find(s => s.id === selectedStage)
  const status = stageStatuses[selectedStage]
  const totalTime = Object.values(elapsed).reduce((a, b) => a + b, 0)

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Pipeline — Processing</span>
          <h1 className="page-header-title">[ {id} ]</h1>
        </div>
        <div className="page-header-right">
          {done && (
            <button className="btn btn-primary" onClick={() => navigate(`/record/${id}`)}>
              View Record ›
            </button>
          )}
        </div>
      </div>

      <div className="pipeline-layout">
        {/* Stage rail */}
        <div className="pipeline-rail">
          <div className="pipeline-rail-header">
            <div className="pipeline-rail-title">// Work Order</div>
            <div className="pipeline-wo-id">{id}</div>
            <div className="pipeline-wo-meta">
              MPN: LM741CN  ·  Texas Instruments
            </div>
          </div>

          <div className="pipeline-stages">
            {STAGES.map((stage, i) => {
              const s = stageStatuses[stage.id]
              return (
                <div
                  key={stage.id}
                  className={`pipeline-stage-item${s === 'active' || activeStage === stage.id && s === 'running' ? ' active' : ''}${s === 'done' ? ' done' : ''}${s === 'pending' ? ' pending' : ''}`}
                  onClick={() => s !== 'pending' && setSelectedStage(stage.id)}
                >
                  <div className="pipeline-stage-num">[ {String(i+1).padStart(2,'0')} ]</div>
                  <div className="pipeline-stage-name">{stage.name}</div>
                  <div className="pipeline-stage-status-row">
                    <StageStatus status={s} />
                    {elapsed[stage.id] && (
                      <span className="pipeline-stage-elapsed">{elapsed[stage.id]}ms</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {done && (
            <div style={{ padding: '20px', borderTop: '1px solid var(--divider)' }}>
              <div className="text-label" style={{ marginBottom: 8 }}>Total elapsed</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {totalTime}ms
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="pipeline-detail">
          <div className="pipeline-detail-header">
            <div>
              <div className="pipeline-detail-name">[ {currentStageData?.name} ]</div>
              <div className="pipeline-detail-desc">{currentStageData?.desc}</div>
            </div>
            <StageStatus status={status} />
          </div>

          <div className="pipeline-detail-body">
            {/* Classify stage: show category path + checklist */}
            {selectedStage === 'classify' && (
              <>
                <div>
                  <div className="text-label" style={{ marginBottom: 12 }}>// Category Path</div>
                  <div className="classify-path">
                    {CLASSIFY_PATH.map((node, i) => (
                      <div key={i} className={`classify-path-node${node.final ? ' final' : ''}`}>
                        {i > 0 && <span className="classify-path-arrow">›</span>}
                        {node.label}
                        <span className="classify-path-code">{node.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-label" style={{ marginBottom: 12 }}>
                    // Expected Attributes Checklist — {EXPECTED_ATTRS.length} fields
                  </div>
                  <div className="classify-checklist">
                    {EXPECTED_ATTRS.map((a, i) => (
                      <div key={i} className={`classify-attr${a.req ? ' required' : ' optional'}`}>
                        <span className={`classify-attr-req${a.req ? ' req' : ''}`}>
                          {a.req ? 'REQ' : 'OPT'}
                        </span>
                        {a.name}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Extract / Verify / Adjudicate / Audit: show confidence grid */}
            {selectedStage !== 'classify' && (
              <div className="pipeline-conf-grid">
                <div className="pipeline-conf-cell">
                  <div className="pipeline-conf-value">11</div>
                  <div className="pipeline-conf-label">Fields Extracted</div>
                </div>
                <div className="pipeline-conf-cell">
                  <div className="pipeline-conf-value" style={{ color: 'var(--amber)' }}>3</div>
                  <div className="pipeline-conf-label">Fields Missing</div>
                </div>
                <div className="pipeline-conf-cell">
                  <div className="pipeline-conf-value">0.91</div>
                  <div className="pipeline-conf-label">Mean Confidence</div>
                </div>
              </div>
            )}

            {/* Log stream */}
            <div className="pipeline-log">
              <div className="pipeline-log-header">
                <span className="pipeline-log-title">// Stage Log</span>
              </div>
              <div className="pipeline-log-body" ref={logRef}>
                {(LOG_LINES_BY_STAGE[selectedStage] || []).map((line, i) =>
                  visibleLogs[selectedStage]?.includes(i) ? (
                    <div key={i} className={`pipeline-log-line ${line.type}`}>
                      {line.text}
                    </div>
                  ) : null
                )}
                {status === 'running' && (
                  <div className="pipeline-log-line">
                    <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
