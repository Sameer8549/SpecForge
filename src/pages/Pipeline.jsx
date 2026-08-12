import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './Pipeline.css'
import { EntailmentLabel } from '../components/States'

/* ── 10 PIPELINE STAGES ───────────────────────────────────── */
const STAGES = [
  { id: 'clean',       name: 'Clean',                num: '01', desc: 'Strip placeholder values, normalize whitespace, flag known-bad patterns', duration: 900 },
  { id: 'resolve',     name: 'Resolve Brand',         num: '02', desc: 'Fuzzy-match raw manufacturer/brand string to canonical Unicat approved form', duration: 1400 },
  { id: 'classify',    name: 'Classify',              num: '03', desc: 'Resolve UNSPSC classpath and load expected attributes + applicable LOVs', duration: 1600 },
  { id: 'extract',     name: 'Extract',               num: '04', desc: 'Pull structured attributes from all available sources simultaneously', duration: 2200 },
  { id: 'normalize',   name: 'Normalize & Constrain', num: '05', desc: 'Force every extracted value into its LOV/UOM approved form', duration: 1200 },
  { id: 'verify',      name: 'Verify',                num: '06', desc: 'Source grounding and entailment check per field across sources', duration: 1400 },
  { id: 'adjudicate',  name: 'Adjudicate',            num: '07', desc: 'Resolve conflicts with documented reasoning, source priority applied', duration: 1100 },
  { id: 'description', name: 'Build Description',     num: '08', desc: 'Generate Mobile, Invoice, Short, Long, Retail, Marketing and Features variants by formula', duration: 1000 },
  { id: 'audit',       name: 'Audit',                 num: '09', desc: 'Coverage, confidence, entailment, readiness, review flag generation', duration: 900 },
  { id: 'mapoutput',   name: 'Map Output',            num: '10', desc: 'Write values to exact Delivery Format column structure', duration: 700 },
]

/* ── STAGE DETAIL DATA ────────────────────────────────────── */

const CLEAN_FLAGS = [
  { field: 'Brand',    raw: '-- No Unilog Brand --', action: 'flagged-blank', note: 'Placeholder detected → treated as missing' },
  { field: 'UOM',      raw: 'each',                  action: 'queued',        note: 'Will be normalized in Stage 05' },
  { field: 'MPN',      raw: 'LM741CN/NOPB ',         action: 'trimmed',       note: 'Trailing whitespace stripped' },
  { field: 'Mfr',      raw: 'Texas Instruments Inc.', action: 'queued',       note: 'Will be fuzzy-matched in Stage 02' },
]

const RESOLVE_RESULT = {
  input: 'Texas Instruments Inc.',
  candidates: [
    { canonical: 'Texas Instruments', score: 0.96, unicatId: '#48291', selected: true },
    { canonical: 'Texas Instruments (India)', score: 0.71, unicatId: '#48292', selected: false },
    { canonical: 'TI (Texas Instruments)', score: 0.68, unicatId: '#48293', selected: false },
  ],
  brandFallback: 'Resolved from Manufacturer field — original brand was placeholder',
}

const CLASSIFY_PATH = [
  { label: 'Electronics',                          code: '32000000', final: false },
  { label: 'Electronic Components',                code: '32100000', final: false },
  { label: 'Integrated Circuits',                  code: '32131600', final: false },
  { label: 'Op-Amps — General Purpose',            code: '32131601', final: true },
]

const EXPECTED_ATTRS = [
  { name: 'Supply Voltage',         req: true,  lovCount: 0 },
  { name: 'Input Offset Voltage',   req: true,  lovCount: 0 },
  { name: 'Gain Bandwidth Product', req: true,  lovCount: 0 },
  { name: 'Slew Rate',              req: true,  lovCount: 0 },
  { name: 'Input Bias Current',     req: true,  lovCount: 0 },
  { name: 'Package Type',           req: true,  lovCount: 12, lov: ['DIP-8','SOIC-8','TO-99','SOP-8','MSOP-8','VSSOP-8','SOT-23-5','SC-70-5','PDIP-8','CDIP-8','LCC','CERDIP-8'] },
  { name: 'Operating Temperature',  req: true,  lovCount: 0 },
  { name: 'Open Loop Gain',         req: true,  lovCount: 0 },
  { name: 'Output Current',         req: false, lovCount: 0 },
  { name: 'Supply Current',         req: false, lovCount: 0 },
  { name: 'Pin Count',              req: false, lovCount: 0 },
  { name: 'Common Mode Range',      req: false, lovCount: 0 },
  { name: 'Channel Count',          req: false, lovCount: 0 },
  { name: 'Input Impedance',        req: false, lovCount: 0 },
]

const NORMALIZE_ROWS = [
  { field: 'UOM',          raw: 'each',      normalized: 'EA',     rule: 'LOV match: "each" → EA (approved)', status: 'mapped' },
  { field: 'UOM',          raw: 'Each',      normalized: 'EA',     rule: 'Case variant resolved',              status: 'mapped' },
  { field: 'UOM',          raw: 'EACH',      normalized: 'EA',     rule: 'Case variant resolved',              status: 'mapped' },
  { field: 'Package Type', raw: 'DIP8',      normalized: 'DIP-8',  rule: 'LOV match: "DIP8" → DIP-8',         status: 'mapped' },
  { field: 'Package Type', raw: 'dip-8',     normalized: 'DIP-8',  rule: 'Case + format normalized',           status: 'mapped' },
  { field: 'Supply Voltage',raw: '±18v',     normalized: '±18V',   rule: 'Unit case normalized to uppercase V', status: 'mapped' },
  { field: 'Slew Rate',    raw: '0.5V/us',   normalized: '0.5V/μs',rule: 'μs substituted for "us"',            status: 'mapped' },
  { field: 'Channel Count',raw: 'single',    normalized: null,      rule: '"single" not in approved LOV — flagged for review', status: 'flagged' },
]

const VERIFY_FIELDS = [
  { field: 'Supply Voltage',   value: '±18V',   entailment: 'supported', conf: 0.97, conflict: false },
  { field: 'GBW Product',      value: '1MHz',   entailment: 'supported', conf: 0.99, conflict: false },
  { field: 'Package Type',     value: 'DIP-8',  entailment: 'supported', conf: 0.99, conflict: false },
  { field: 'Input Offset Voltage', value: '6mV',entailment: 'supported', conf: 0.94, conflict: false },
  { field: 'Slew Rate',        value: '0.5V/μs',entailment: 'supported', conf: 0.93, conflict: false },
  { field: 'Input Bias Current',value: '80nA',  entailment: 'partial',   conf: 0.88, conflict: false },
  { field: 'Supply Current',   value: '1.7mA',  entailment: 'partial',   conf: 0.86, conflict: false },
  { field: 'Supply Voltage',   value: '±22V',   entailment: 'not_supported', conf: 0.0, conflict: true, conflictNote: 'SRC-B reports ±22V — absolute maximum rating, not recommended supply' },
]

const DESC_VARIANTS = [
  { name: 'Mobile',    maxChars: 80,  value: 'Op-Amp, 1MHz, ±18V, DIP-8 — Texas Instruments LM741CN' },
  { name: 'Invoice',   maxChars: 100, value: 'Operational Amplifier, Single, 1MHz GBW, ±18V Supply, 0.5V/μs Slew Rate, DIP-8' },
  { name: 'Short',     maxChars: 150, value: 'Texas Instruments LM741CN Single General-Purpose Op-Amp, 1MHz Gain Bandwidth, ±18V Supply Voltage, 0.5V/μs Slew Rate, 8-Pin DIP Package' },
  { name: 'Long',      maxChars: 500, value: 'The Texas Instruments LM741CN is a general-purpose single operational amplifier featuring a 1MHz gain bandwidth product, 0.5V/μs slew rate, and ±18V recommended supply voltage. Supplied in an 8-pin DIP (PDIP) package with an operating temperature range of 0°C to 70°C, making it suitable for the commercial temperature grade. Input offset voltage is 6mV typical. Open-loop gain is 200V/mV typical.' },
  { name: 'Retail',    maxChars: 300, value: 'Texas Instruments LM741CN General-Purpose Operational Amplifier — Classic single op-amp suitable for audio, signal conditioning, and general analog applications. 1MHz bandwidth, ±18V supply, DIP-8 through-hole package. 6mV typical input offset, 0.5V/μs slew rate.' },
  { name: 'Marketing', maxChars: 400, value: 'Trusted for decades in analog design, the LM741CN from Texas Instruments delivers reliable performance in a DIP-8 through-hole package. Ideal for prototyping, audio circuits, and signal conditioning. 1MHz GBW, ±18V supply, industry-standard pinout.' },
]

const MAP_OUTPUT_COLUMNS = [
  { col: 'UNSPSCCode',        value: '32131601' },
  { col: 'ManufacturerName',  value: 'Texas Instruments' },
  { col: 'BrandName',         value: 'Texas Instruments' },
  { col: 'UniCatBrandId',     value: '#48291' },
  { col: 'MPN',               value: 'LM741CN/NOPB' },
  { col: 'UOM',               value: 'EA' },
  { col: 'ClasspathName',     value: 'Op-Amps — General Purpose' },
  { col: 'MobileDesc',        value: 'Op-Amp, 1MHz, ±18V, DIP-8 — Texas Instruments LM741CN' },
  { col: 'InvoiceDesc',       value: 'Operational Amplifier, Single, 1MHz GBW, ±18V Supply, 0.5V/μs' },
  { col: 'ShortDesc',         value: 'Texas Instruments LM741CN Single General-Purpose Op-Amp…' },
  { col: 'Attr_SupplyVoltage',value: '±18V' },
  { col: 'Attr_GBW',          value: '1MHz' },
  { col: 'Attr_PackageType',  value: 'DIP-8' },
  { col: 'Attr_SlewRate',     value: '0.5V/μs' },
]

const AUDIT_READINESS = { state: 'needs_review', resolvedCount: 9, totalCount: 14 }
const READINESS_META = {
  ready:        { label: '[ ✓ READY ]',        cls: 'readiness-ready',      desc: 'All required fields resolved above threshold with Supported entailment.' },
  needs_review: { label: '[ ~ NEEDS REVIEW ]',  cls: 'readiness-review',    desc: 'One or more fields below threshold or with Partially Supported / Ambiguous entailment.' },
  incomplete:   { label: '[ ✗ INCOMPLETE ]',    cls: 'readiness-incomplete', desc: 'Required fields are missing. Record cannot be published without human resolution.' },
}

/* ── LOG LINES PER STAGE ─────────────────────────────────── */
const LOG_LINES = {
  clean: [
    { type: '',            text: '$ clean --input="LM741CN/NOPB ,Texas Instruments Inc.,-- No Unilog Brand --,each"' },
    { type: 'log-warn',    text: '⚠ Brand: "-- No Unilog Brand --" → placeholder detected, flagged blank' },
    { type: 'log-success', text: '✓ MPN trimmed: "LM741CN/NOPB " → "LM741CN/NOPB"' },
    { type: '',            text: '  UOM "each" queued for Stage 05 normalization' },
    { type: 'log-success', text: '✓ Clean complete — 0.9s' },
  ],
  resolve: [
    { type: 'log-heading', text: '[ Resolve Brand ] Fuzzy-matching to Unicat list...' },
    { type: '',            text: '  Input: "Texas Instruments Inc."' },
    { type: '',            text: '  Candidate #1: "Texas Instruments" — score: 0.96 [ P-SELECT ]' },
    { type: '',            text: '  Candidate #2: "Texas Instruments (India)" — score: 0.71' },
    { type: '',            text: '  Candidate #3: "TI (Texas Instruments)" — score: 0.68' },
    { type: 'log-success', text: '✓ Canonical: "Texas Instruments" (Unicat #48291)' },
    { type: 'log-success', text: '✓ Brand resolved from Manufacturer (original brand was placeholder)' },
    { type: 'log-success', text: '✓ Resolve complete — 1.4s' },
  ],
  classify: [
    { type: '',            text: '$ classify --mpn=LM741CN --canonical-brand="Texas Instruments"' },
    { type: '',            text: '  Querying UNSPSC taxonomy v24.1201...' },
    { type: 'log-success', text: '✓ Category match confidence: 0.97' },
    { type: 'log-heading', text: '[ Category Path Resolved ]' },
    { type: '',            text: '  Electronics › ICs › Op-Amps › General Purpose' },
    { type: 'log-success', text: '✓ 32131601 — 14 expected attributes loaded' },
    { type: '',            text: '  Required: 8   Optional: 6   LOV fields: 1 (Package Type, 12 values)' },
    { type: 'log-success', text: '✓ Classify complete — 1.6s' },
  ],
  extract: [
    { type: 'log-heading', text: '[ Extract ] Pulling from 4 sources...' },
    { type: '',            text: '  SRC-A: ti.com/product/LM741 (Manufacturer Datasheet)' },
    { type: '',            text: '  SRC-B: octopart.com/LM741CN (Authorized Distributor)' },
    { type: '',            text: '  SRC-C: datasheetarchive.com (Other)' },
    { type: '',            text: '  SRC-D: mouser.com (Authorized Distributor)' },
    { type: 'log-success', text: '✓ SRC-A: 11/14 fields extracted' },
    { type: 'log-success', text: '✓ SRC-B: 9/14 extracted (Supply Voltage: ±22V — raw value retained)' },
    { type: 'log-warn',    text: '⚠ SRC-C: 6/14 fields — low coverage, archived datasheet' },
    { type: 'log-success', text: '✓ SRC-D: 10/14 fields extracted' },
    { type: 'log-success', text: '✓ Extract complete — 2.2s' },
  ],
  normalize: [
    { type: 'log-heading', text: '[ Normalize & Constrain ] Applying LOV/UOM rules...' },
    { type: '',            text: '  UOM: "each" → "EA"  (LOV: approved forms = EA, BX, PK, RL, ST)' },
    { type: '',            text: '  Package: "DIP8" → "DIP-8"  (LOV: 12 approved package forms)' },
    { type: '',            text: '  Supply Voltage: "±18v" → "±18V"  (unit case normalized)' },
    { type: '',            text: '  Slew Rate: "0.5V/us" → "0.5V/μs"  (symbol substituted)' },
    { type: 'log-warn',    text: '⚠ Channel Count: "single" not in approved LOV — flagged for review' },
    { type: 'log-success', text: '✓ 7 values normalized to controlled vocabulary' },
    { type: 'log-success', text: '✓ Normalize complete — 1.2s' },
  ],
  verify: [
    { type: 'log-heading', text: '[ Verify ] Cross-referencing source entailment...' },
    { type: 'log-success', text: '✓ Supply Voltage: ±18V — 3/4 sources agree [ SUPPORTED ]' },
    { type: 'log-warn',    text: '⚠ CONFLICT — SRC-B reports ±22V (absolute max, not recommended supply)' },
    { type: 'log-success', text: '✓ GBW Product: 1MHz — 4/4 sources agree [ SUPPORTED ]' },
    { type: 'log-success', text: '✓ Package Type: DIP-8 — 4/4 sources agree [ SUPPORTED ]' },
    { type: 'log-success', text: '✓ Input Bias Current: 80nA — 2/4 sources [ PARTIAL ]' },
    { type: 'log-success', text: '✓ Verify complete — 1 conflict flagged' },
  ],
  adjudicate: [
    { type: 'log-heading', text: '[ Adjudicate ] Resolving 1 conflict...' },
    { type: '',            text: '  Field: Supply Voltage' },
    { type: '',            text: '  SRC-A (ti.com): ±18V — Manufacturer Datasheet [ P1 ]' },
    { type: '',            text: '  SRC-B (octopart): ±22V — Authorized Distributor [ P3 ]' },
    { type: '',            text: '  Rule: P1 takes precedence over P3' },
    { type: '',            text: '  Rejection: SRC-B reports absolute max rating, not recommended supply' },
    { type: 'log-success', text: '✓ Resolved: ±18V  Conf: 0.94  [ SUPPORTED ]' },
    { type: 'log-success', text: '✓ Reasoning logged to adjudication record' },
    { type: 'log-success', text: '✓ Adjudicate complete — 1.1s' },
  ],
  description: [
    { type: 'log-heading', text: '[ Build Description ] Generating variants by formula...' },
    { type: 'log-success', text: '✓ Mobile (80 chars): "Op-Amp, 1MHz, ±18V, DIP-8 — Texas Instruments LM741CN"' },
    { type: 'log-success', text: '✓ Invoice (100 chars): within limit' },
    { type: 'log-success', text: '✓ Short (150 chars): within limit' },
    { type: 'log-success', text: '✓ Long (500 chars): within limit' },
    { type: 'log-success', text: '✓ Retail (300 chars): within limit' },
    { type: 'log-success', text: '✓ Marketing (400 chars): within limit' },
    { type: 'log-success', text: '✓ Features 1–20: N/A for this category' },
    { type: 'log-success', text: '✓ Build Description complete — 1.0s' },
  ],
  audit: [
    { type: 'log-heading', text: '[ Audit ] Coverage + confidence + readiness...' },
    { type: 'log-success', text: '✓ 11 fields populated' },
    { type: 'log-warn',    text: '⚠ 3 fields missing: Output Current, Input Impedance, Channel Count' },
    { type: 'log-warn',    text: '⚠ 2 fields below threshold: Input Bias Current (0.88), Supply Current (0.86)' },
    { type: 'log-warn',    text: '⚠ 1 field flagged for LOV mismatch: Channel Count ("single" not in LOV)' },
    { type: '',            text: '  Mean confidence: 0.91' },
    { type: 'log-warn',    text: '⚠ Readiness: NEEDS REVIEW — 9/14 fields fully resolved' },
    { type: 'log-success', text: '✓ 3 fields routed to review queue' },
    { type: 'log-success', text: '✓ Audit complete — 0.9s' },
  ],
  mapoutput: [
    { type: 'log-heading', text: '[ Map Output ] Writing to Delivery Format columns...' },
    { type: 'log-success', text: '✓ UNSPSCCode: 32131601' },
    { type: 'log-success', text: '✓ ManufacturerName: Texas Instruments' },
    { type: 'log-success', text: '✓ BrandName: Texas Instruments (resolved from placeholder)' },
    { type: 'log-success', text: '✓ UniCatBrandId: #48291' },
    { type: 'log-success', text: '✓ UOM: EA (normalized from "each")' },
    { type: 'log-success', text: '✓ MobileDesc, InvoiceDesc, ShortDesc, LongDesc, RetailDesc written' },
    { type: 'log-success', text: '✓ 11 attribute columns populated' },
    { type: 'log-warn',    text: '⚠ 3 attribute columns empty (known-missing)' },
    { type: 'log-success', text: '✓ Record WO-20240811-001 written' },
    { type: 'log-success', text: '✓ Map Output complete — 0.7s' },
  ],
}

/* ── STATUS CHIP ─────────────────────────────────────────── */
function StageStatus({ status }) {
  if (status === 'pending') return <span className="pipeline-stage-status stage-status-pending">[ Pending ]</span>
  if (status === 'running') return <span className="pipeline-stage-status stage-status-running">[ Running ]</span>
  if (status === 'done')    return <span className="pipeline-stage-status stage-status-done">[ Done ]</span>
  if (status === 'error')   return <span className="pipeline-stage-status stage-status-error">[ Error ]</span>
  return null
}

/* ── DETAIL PANELS PER STAGE ─────────────────────────────── */
function CleanPanel() {
  return (
    <div>
      <div className="text-label" style={{ marginBottom: 12 }}>// Field Cleaning Report</div>
      <div className="pipeline-clean-table">
        <div className="pipeline-clean-header">
          <span>Field</span><span>Raw Value</span><span>Action</span><span>Note</span>
        </div>
        {CLEAN_FLAGS.map((r, i) => (
          <div key={i} className="pipeline-clean-row">
            <span className="clean-field">{r.field}</span>
            <span className={`clean-raw${r.action === 'flagged-blank' ? ' placeholder' : ''}`}>{r.raw}</span>
            <span className={`clean-action clean-${r.action}`}>[{r.action}]</span>
            <span className="clean-note">{r.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResolvePanel() {
  const { input, candidates, brandFallback } = RESOLVE_RESULT
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="text-label" style={{ marginBottom: 8 }}>// Input String</div>
        <div className="pipeline-resolve-input">{input}</div>
      </div>
      <div>
        <div className="text-label" style={{ marginBottom: 10 }}>// Candidates Ranked by Score</div>
        <div className="pipeline-resolve-candidates">
          {candidates.map((c, i) => (
            <div key={i} className={`pipeline-resolve-candidate${c.selected ? ' selected' : ''}`}>
              <div className="resolve-candidate-score">{(c.score * 100).toFixed(0)}%</div>
              <div className="resolve-candidate-name">{c.canonical}</div>
              <div className="resolve-candidate-id">{c.unicatId}</div>
              {c.selected && <span className="resolve-candidate-verdict">← selected</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="pipeline-resolve-note">
        <span className="placeholder-tag">note</span>
        {brandFallback}
      </div>
    </div>
  )
}

function ClassifyPanel() {
  return (
    <>
      <div>
        <div className="text-label" style={{ marginBottom: 12 }}>// UNSPSC Category Path</div>
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
          // Expected Attributes — {EXPECTED_ATTRS.length} fields
        </div>
        <div className="classify-checklist">
          {EXPECTED_ATTRS.map((a, i) => (
            <div key={i} className={`classify-attr${a.req ? ' required' : ' optional'}`}>
              <span className={`classify-attr-req${a.req ? ' req' : ''}`}>{a.req ? 'REQ' : 'OPT'}</span>
              {a.name}
              {a.lovCount > 0 && (
                <span className="classify-attr-lov" title={a.lov?.join(', ')}>LOV:{a.lovCount}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function NormalizePanel() {
  return (
    <div>
      <div className="text-label" style={{ marginBottom: 12 }}>// LOV / UOM Normalization — {NORMALIZE_ROWS.length} values processed</div>
      <div className="pipeline-norm-table">
        <div className="pipeline-norm-header">
          <span>Field</span><span>Raw</span><span>Normalized</span><span>Rule</span>
        </div>
        {NORMALIZE_ROWS.map((r, i) => (
          <div key={i} className={`pipeline-norm-row${r.status === 'flagged' ? ' flagged' : ''}`}>
            <span className="norm-field">{r.field}</span>
            <span className="norm-raw">{r.raw}</span>
            <span className="norm-out">{r.normalized ?? <em style={{ color: 'var(--red)', fontStyle: 'normal' }}>—flagged—</em>}</span>
            <span className="norm-rule">{r.rule}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VerifyPanel() {
  const conflicts = VERIFY_FIELDS.filter(f => f.conflict)
  const clean     = VERIFY_FIELDS.filter(f => !f.conflict)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {conflicts.length > 0 && (
        <div>
          <div className="text-label" style={{ marginBottom: 10, color: 'var(--amber)' }}>⚠ Conflicts Detected ({conflicts.length})</div>
          {conflicts.map((f, i) => (
            <div key={i} className="verify-conflict-row">
              <span className="verify-field">{f.field}</span>
              <span className="verify-val-conflict">{f.value}</span>
              <EntailmentLabel entailment={f.entailment} />
              <span className="verify-note">{f.conflictNote}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <div className="text-label" style={{ marginBottom: 10 }}>// Fields Verified</div>
        <div className="pipeline-verify-table">
          {clean.map((f, i) => (
            <div key={i} className="verify-row">
              <span className="verify-field">{f.field}</span>
              <span className="verify-val">{f.value}</span>
              <EntailmentLabel entailment={f.entailment} />
              <span className="verify-conf">{Math.round(f.conf * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DescriptionPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="text-label" style={{ marginBottom: 4 }}>// Description Variants — formula-generated</div>
      {DESC_VARIANTS.map((v, i) => {
        const len = v.value.length
        const pct = Math.min(100, Math.round((len / v.maxChars) * 100))
        const over = len > v.maxChars
        return (
          <div key={i} className="desc-variant-row">
            <div className="desc-variant-meta">
              <span className="desc-variant-name">{v.name}</span>
              <span className={`desc-variant-count${over ? ' over' : ''}`}>{len}/{v.maxChars}</span>
            </div>
            <div className="desc-variant-text">{v.value}</div>
            <div className="desc-char-track">
              <div className={`desc-char-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MapOutputPanel() {
  return (
    <div>
      <div className="text-label" style={{ marginBottom: 12 }}>// Delivery Format — {MAP_OUTPUT_COLUMNS.length} columns written</div>
      <div className="pipeline-map-table">
        {MAP_OUTPUT_COLUMNS.map((col, i) => (
          <div key={i} className="map-col-row">
            <span className="map-col-name">{col.col}</span>
            <span className="map-col-val">{col.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditPanel() {
  const meta = READINESS_META[AUDIT_READINESS.state]
  return (
    <div className="audit-readiness-block">
      <div className={`audit-readiness-state ${meta.cls}`}>{meta.label}</div>
      <div className="audit-readiness-desc">{meta.desc}</div>
      <div className="audit-readiness-coverage">
        <span className="audit-coverage-num">{AUDIT_READINESS.resolvedCount}</span>
        <span className="audit-coverage-sep">/</span>
        <span className="audit-coverage-total">{AUDIT_READINESS.totalCount}</span>
        <span className="audit-coverage-label">expected attributes resolved</span>
      </div>
      <div className="audit-readiness-rule">
        A field counts as resolved only if confidence ≥ 0.80 and entailment is Supported.
      </div>
    </div>
  )
}

function GenericPanel({ stage }) {
  const confData = {
    extract:    [{ label: 'Fields Extracted', value: '11', color: null }, { label: 'Known Missing', value: '3', color: 'var(--amber)' }, { label: 'Mean Confidence', value: '0.91', color: null }],
    verify:     [{ label: 'Fields Verified', value: '11', color: null }, { label: 'Conflicts', value: '1', color: 'var(--amber)' }, { label: 'Mean Confidence', value: '0.91', color: null }],
    adjudicate: [{ label: 'Resolved', value: '1', color: null }, { label: 'Open', value: '0', color: null }, { label: 'Confidence', value: '0.94', color: null }],
  }
  const cells = confData[stage]
  if (!cells) return null
  return (
    <div className="pipeline-conf-grid">
      {cells.map((c, i) => (
        <div key={i} className="pipeline-conf-cell">
          <div className="pipeline-conf-value" style={c.color ? { color: c.color } : {}}>{c.value}</div>
          <div className="pipeline-conf-label">{c.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ── MAIN COMPONENT ──────────────────────────────────────── */
export default function Pipeline() {
  const { id } = useParams()
  const navigate = useNavigate()

  const initStatuses = STAGES.reduce((acc, s) => ({ ...acc, [s.id]: 'pending' }), {})
  const initLogs     = STAGES.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {})

  const [stageStatuses, setStageStatuses] = useState(initStatuses)
  const [activeStage,   setActiveStage]   = useState(STAGES[0].id)
  const [selectedStage, setSelectedStage] = useState(STAGES[0].id)
  const [elapsed,       setElapsed]       = useState({})
  const [visibleLogs,   setVisibleLogs]   = useState(initLogs)
  const [done,          setDone]          = useState(false)

  const logRef = useRef(null)
  const toRef  = useRef([])

  useEffect(() => {
    let cum = 0
    STAGES.forEach((stage, idx) => {
      const start = cum
      const t1 = setTimeout(() => {
        setStageStatuses(p => ({ ...p, [stage.id]: 'running' }))
        setActiveStage(stage.id)
        setSelectedStage(stage.id)
        const lines = LOG_LINES[stage.id] || []
        const perLine = Math.floor(stage.duration / Math.max(lines.length, 1))
        lines.forEach((_, i) => {
          const lt = setTimeout(() => {
            setVisibleLogs(p => ({ ...p, [stage.id]: [...p[stage.id], i] }))
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
          }, (i + 1) * perLine)
          toRef.current.push(lt)
        })
      }, start)
      const t2 = setTimeout(() => {
        setStageStatuses(p => ({ ...p, [stage.id]: 'done' }))
        setElapsed(p => ({ ...p, [stage.id]: stage.duration }))
        if (idx === STAGES.length - 1) setDone(true)
      }, start + stage.duration)
      toRef.current.push(t1, t2)
      cum += stage.duration
    })
    return () => toRef.current.forEach(clearTimeout)
  }, [])

  const currentStage = STAGES.find(s => s.id === selectedStage)
  const status       = stageStatuses[selectedStage]
  const totalTime    = Object.values(elapsed).reduce((a, b) => a + b, 0)

  const stagePanel = {
    clean:       <CleanPanel />,
    resolve:     <ResolvePanel />,
    classify:    <ClassifyPanel />,
    normalize:   <NormalizePanel />,
    verify:      <VerifyPanel />,
    description: <DescriptionPanel />,
    audit:       <AuditPanel />,
    mapoutput:   <MapOutputPanel />,
  }

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-label">// Pipeline — Processing</span>
          <h1 className="page-header-title">[ {id} ]</h1>
        </div>
        <div className="page-header-right">
          {done && (
            <>
              <button className="btn" onClick={() => navigate(`/format/${id}`)}>Format & Validate</button>
              <button className="btn btn-primary" onClick={() => navigate(`/record/${id}`)}>
                View Record ›
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pipeline-layout">
        {/* Stage rail */}
        <div className="pipeline-rail">
          <div className="pipeline-rail-header">
            <div className="pipeline-rail-title">// Work Order</div>
            <div className="pipeline-wo-id">{id}</div>
            <div className="pipeline-wo-meta">MPN: LM741CN/NOPB · Texas Instruments</div>
          </div>

          <div className="pipeline-stages">
            {STAGES.map(stage => {
              const s = stageStatuses[stage.id]
              const isActive = activeStage === stage.id && s === 'running'
              return (
                <div
                  key={stage.id}
                  className={`pipeline-stage-item${isActive ? ' active' : ''}${s === 'done' ? ' done' : ''}${s === 'pending' ? ' pending' : ''}${selectedStage === stage.id ? ' selected' : ''}`}
                  onClick={() => s !== 'pending' && setSelectedStage(stage.id)}
                >
                  <div className="pipeline-stage-num">[ {stage.num} ]</div>
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
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--divider)' }}>
              <div className="text-label" style={{ marginBottom: 6 }}>// Total elapsed</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--green)' }}>
                {(totalTime / 1000).toFixed(1)}s
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="pipeline-detail">
          <div className="pipeline-detail-header">
            <div>
              <div className="pipeline-detail-name">[ {currentStage?.num} ] {currentStage?.name}</div>
              <div className="pipeline-detail-desc">{currentStage?.desc}</div>
            </div>
            <StageStatus status={status} />
          </div>

          <div className="pipeline-detail-body">
            {/* Stage-specific panel */}
            {stagePanel[selectedStage] || <GenericPanel stage={selectedStage} />}

            {/* Log stream */}
            <div className="pipeline-log">
              <div className="pipeline-log-header">
                <span className="pipeline-log-title">// Stage Log</span>
              </div>
              <div className="pipeline-log-body" ref={logRef}>
                {(LOG_LINES[selectedStage] || []).map((line, i) =>
                  visibleLogs[selectedStage]?.includes(i) ? (
                    <div key={i} className={`pipeline-log-line ${line.type}`}>{line.text}</div>
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
