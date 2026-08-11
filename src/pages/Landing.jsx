import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

const HEADLINE_FULL = 'Structure from Signal'

const BOOT_LINES = [
  { type: 'prompt',  text: '$ specforge-engine --init', delay: 200 },
  { type: 'output',  text: 'Loading taxonomy database...', delay: 600 },
  { type: 'output',  text: 'UNSPSC v24.1201 — 57,832 categories', delay: 900 },
  { type: 'success', text: '✓ Taxonomy loaded', delay: 1100 },
  { type: 'output',  text: 'Initializing model router...', delay: 1300 },
  { type: 'output',  text: 'Primary: GPT-4o  Fallback: Claude-3.5', delay: 1500 },
  { type: 'success', text: '✓ Model router active', delay: 1700 },
  { type: 'spacer',  text: '', delay: 1900 },
  { type: 'prompt',  text: '$ process-work-order WO-20240811-001', delay: 2000 },
  { type: 'output',  text: 'MPN: LM741CN  Brand: Texas Instruments', delay: 2300 },
  { type: 'output',  text: 'Datasheet: TI-LM741.pdf (2.1 MB)', delay: 2500 },
  { type: 'spacer',  text: '', delay: 2700 },
  { type: 'heading', text: '[ CLASSIFY ] Resolving category path...', delay: 2800 },
  { type: 'output',  text: '  Electronics › ICs › Op-Amps › General', delay: 3100 },
  { type: 'success', text: '✓ Category: 32131600 — Confidence: 0.97', delay: 3400 },
  { type: 'spacer',  text: '', delay: 3600 },
  { type: 'heading', text: '[ EXTRACT ] Pulling 14 expected fields...', delay: 3700 },
  { type: 'output',  text: '  Supply voltage, Input offset, Bandwidth...', delay: 4000 },
  { type: 'output',  text: '  Extracted: 11/14  Missing: 3  Conflict: 1', delay: 4300 },
  { type: 'spacer',  text: '', delay: 4500 },
  { type: 'heading', text: '[ VERIFY ] Cross-referencing sources...', delay: 4600 },
  { type: 'warn',    text: '⚠ Supply Voltage: SRC-A=±18V  SRC-B=±22V', delay: 5000 },
  { type: 'spacer',  text: '', delay: 5200 },
  { type: 'heading', text: '[ ADJUDICATE ] Resolving conflict...', delay: 5300 },
  { type: 'output',  text: '  Datasheet primary source wins: ±18V', delay: 5700 },
  { type: 'success', text: '✓ Resolution recorded with reasoning', delay: 6000 },
  { type: 'spacer',  text: '', delay: 6200 },
  { type: 'heading', text: '[ AUDIT ] Generating record...', delay: 6300 },
  { type: 'success', text: '✓ Record WO-001 complete — 11/14 fields', delay: 6700 },
  { type: 'output',  text: '  3 fields flagged for human review', delay: 7000 },
  { type: 'success', text: '✓ Added to review queue', delay: 7300 },
]

const FEATURES = [
  {
    num: '01',
    title: 'Classify',
    desc: 'Resolve any MPN to its UNSPSC category path, building an expected-attribute checklist before extraction begins.'
  },
  {
    num: '02',
    title: 'Extract',
    desc: 'Pull structured attributes from datasheets, distributor feeds, and manufacturer pages simultaneously.'
  },
  {
    num: '03',
    title: 'Verify',
    desc: 'Cross-reference every field across sources. Flag conflicts the moment two sources disagree.'
  },
  {
    num: '04',
    title: 'Adjudicate',
    desc: 'Resolve disagreements with documented reasoning. Every decision is traceable to its source.'
  },
  {
    num: '05',
    title: 'Audit',
    desc: 'Produce per-field confidence scores, known-missing markers, and human-reviewable provenance.'
  }
]

const PIPELINE_STAGES = [
  { num: '01', name: 'Classify', desc: 'UNSPSC category + attribute schema' },
  { num: '02', name: 'Extract',  desc: 'Multi-source field extraction' },
  { num: '03', name: 'Verify',   desc: 'Cross-source validation' },
  { num: '04', name: 'Adjudicate', desc: 'Conflict resolution + reasoning' },
  { num: '05', name: 'Audit',    desc: 'Confidence scoring + provenance' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [headline, setHeadline] = useState('')
  const [headlineDone, setHeadlineDone] = useState(false)
  const [visibleLines, setVisibleLines] = useState([])
  const termRef = useRef(null)
  const timeoutsRef = useRef([])

  // Typewriter headline
  useEffect(() => {
    let i = 0
    const tick = () => {
      if (i <= HEADLINE_FULL.length) {
        setHeadline(HEADLINE_FULL.slice(0, i))
        i++
        const t = setTimeout(tick, i === 1 ? 500 : 55)
        timeoutsRef.current.push(t)
      } else {
        setHeadlineDone(true)
      }
    }
    const t = setTimeout(tick, 400)
    timeoutsRef.current.push(t)
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  // Terminal boot sequence
  useEffect(() => {
    BOOT_LINES.forEach((line, idx) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, idx])
        if (termRef.current) {
          termRef.current.scrollTop = termRef.current.scrollHeight
        }
      }, line.delay)
      timeoutsRef.current.push(t)
    })
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  return (
    <div className="landing">
      {/* Top bar */}
      <header className="land-topbar">
        <div className="land-topbar-logo">SpecForge</div>
        <nav className="land-topbar-nav">
          <span className="land-topbar-link" onClick={() => navigate('/input')}>New Record</span>
          <span className="land-topbar-link" onClick={() => navigate('/batch')}>Batch</span>
          <span className="land-topbar-link" onClick={() => navigate('/history')}>Library</span>
          <span className="land-topbar-link" onClick={() => navigate('/settings')}>Settings</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="land-hero">
        {/* Left */}
        <div className="land-hero-left">
          <div>
            <p className="land-hero-eyebrow">[ Product Intelligence Platform ]</p>
            <h1 className="land-hero-headline text-heading">
              {headline}
              {!headlineDone && <span className="typewriter-cursor" />}
            </h1>
            <p className="land-hero-sub">
              SpecForge turns incomplete product inputs — MPNs, brand names, short descriptions, datasheets — into structured, validated, explainable product records for industrial commerce.
            </p>
            <div className="land-hero-cta-row">
              <button className="btn btn-primary" onClick={() => navigate('/input')}>
                New Work Order
              </button>
              <button className="btn" onClick={() => navigate('/batch')}>
                Batch Upload
              </button>
            </div>
          </div>

          <div className="land-hero-meta">
            <div className="land-hero-meta-grid">
              <div className="land-hero-meta-cell">
                <span className="land-hero-meta-value">97%</span>
                <span className="land-hero-meta-label">Field accuracy</span>
              </div>
              <div className="land-hero-meta-cell">
                <span className="land-hero-meta-value">5</span>
                <span className="land-hero-meta-label">Pipeline stages</span>
              </div>
              <div className="land-hero-meta-cell">
                <span className="land-hero-meta-value">&lt;8s</span>
                <span className="land-hero-meta-label">Per record</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — terminal */}
        <div className="land-hero-right">
          <div className="land-terminal-header">
            <div className="land-terminal-dot" />
            <span className="land-terminal-title">specforge-engine v1.0.0 — Live</span>
          </div>
          <div className="land-terminal-body" ref={termRef}>
            {BOOT_LINES.map((line, idx) =>
              visibleLines.includes(idx) ? (
                <div key={idx} className={`land-term-line ${line.type === 'error-t' ? 'error-t' : line.type}`}>
                  {line.text}
                </div>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="land-features">
        {FEATURES.map(f => (
          <div className="land-feature-cell" key={f.num}>
            <span className="land-feature-number">[ {f.num} ]</span>
            <div className="land-feature-title">{f.title}</div>
            <div className="land-feature-desc">{f.desc}</div>
          </div>
        ))}
      </section>

      {/* Pipeline diagram */}
      <section className="land-pipeline">
        <div className="land-pipeline-label">// Pipeline Architecture</div>
        <div className="land-pipeline-stages">
          {PIPELINE_STAGES.map(s => (
            <div className="land-pipeline-stage" key={s.num}>
              <span className="land-pipeline-stage-num">{s.num}</span>
              <div className="land-pipeline-stage-name">[ {s.name} ]</div>
              <div className="land-pipeline-stage-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <span className="land-footer-copy">
          SpecForge — REV 1.0 — Product Intelligence Platform
        </span>
        <div className="land-footer-links">
          <span className="land-footer-link" onClick={() => navigate('/settings')}>API Keys</span>
          <span className="land-footer-link" onClick={() => navigate('/history')}>Library</span>
          <span className="land-footer-link" onClick={() => navigate('/input')}>New Record</span>
        </div>
      </footer>
    </div>
  )
}
