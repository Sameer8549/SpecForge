# SpecForge

**Product Intelligence Platform** — turns limited product inputs (MPN, brand, short description, optional datasheet) into structured, validated, explainable product records for industrial commerce.

## Visual world

**Laboratory Assay Document** — the interface IS the instrument. Near-black ground, instrument-amber accent, Geist Mono for all data values. Structure by ruled horizontal lines, not boxed cards.

## Stack

- React 18 + Vite
- React Router v6
- Vanilla CSS (no utility frameworks)
- Google Fonts: Geist Mono

## Pages

| Route | Page |
|---|---|
| `/` | Landing / entry |
| `/input` | Work order — MPN, brand, description, datasheet upload |
| `/pipeline/:id` | Live pipeline view — Extract → Verify → Adjudicate → Audit |
| `/record/:id` | Product record output — per-field confidence, expandable provenance |
| `/adjudication/:id` | Conflict resolution detail |
| `/queue` | Review queue — flag/approve/reject |
| `/batch` | Batch CSV upload and processing status |
| `/history` | Record library — searchable, filterable |
| `/settings` | API keys, model routing, schema config |

## Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Design decisions

See [DESIGN.md](./DESIGN.md) for the full design system.
See [PRODUCT.md](./PRODUCT.md) for product truth.

## Notes

All resolution data in this build is synthetic and labelled as such.
No actual API calls are made — the pipeline is simulated with timed events.
