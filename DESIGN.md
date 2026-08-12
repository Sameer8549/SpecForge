# SpecForge — Design System

> **Locked world:** Laboratory Assay Document
> **Mode:** Operate (task completion); Landing page is Persuade.
>
> Direction contract (150 words):
>
> **THESIS:** The interface IS the instrument — a laboratory assay document made interactive. Refuses the SaaS dashboard (sidebar + stat cards + status pills) and the form wizard. Every surface is structured like a ruled data table, not a container of components.
>
> **OWN-WORLD:** Near-black ground (#0E0F0D), instrument-amber accent (#C8943A), Geist Mono for all data values and IDs, system-ui for labels and body. Structure by ruled horizontal lines, not boxed cards. No shadows, no glass, no gradient text.
>
> **STORY:** Operator submits MPN. System runs the assay — classifies, extracts, verifies, adjudicates, stamps. Operator receives a document they can trust and trace to its sources.
>
> **FIRST VIEWPORT:** Full-bleed near-black. A single MPN input field centred like a part number on a spec sheet. Below it, a live resolution trace printing in as events arrive.
>
> **FORM:** Laboratory assay document — fields appear as results are confirmed, confidence stamps replace placeholders, the record "prints" as the pipeline completes.

---

## Palette

| Token | Value | Role |
|---|---|---|
| `--bg-base` | `#0E0F0D` | Page ground |
| `--bg-surface` | `#151614` | Elevated panels |
| `--bg-raised` | `#1C1D1A` | Inputs, secondary panels |
| `--border-ruled` | `#2A2B28` | Row rules |
| `--border-key` | `#3D3E3A` | Section separators |
| `--accent` | `#C8943A` | Instrument amber |
| `--accent-dim` | `#8A6425` | Muted accent |
| `--text-primary` | `#E8E6E0` | Body text |
| `--text-secondary` | `#8A8880` | Labels |
| `--text-tertiary` | `#555450` | Placeholder |
| `--signal-pass` | `#4E9467` | Verified |
| `--signal-warn` | `#C8943A` | Moderate confidence |
| `--signal-fail` | `#A0422A` | Low confidence |

## Typography

- Display: Geist Mono, -0.02em tracking
- Data values: Geist Mono, reserved strictly for actual data and IDs
- Labels/body: system-ui stack
- Body measure: 65–72ch max
- Tracking floor: -0.04em

## Motion

One authored sequence per page. No scattered hover effects.

- Assay print: `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)`
- Pipeline events: staggered fire along a single timeline
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` everywhere

## Structure

- Horizontal ruled lines (`border-top: 1px solid var(--border-ruled)`) are the primary structural device
- Data rows: label | value | confidence | source
- No boxed cards, no shadow elevation
- Section labels used once per logical group (not over every section)

## Prohibitions

- No gradient text
- No glass/blur as decoration
- No `border-left > 1px` on cards or callouts
- No sparklines or progress rings as content proxies
- No card grids (icon + heading + text)
- No hero-metric template
- No `border-radius > 16px` on non-pill elements
- No section number prefixes (01 / 02 / 03)
- Geist Mono only for actual data, not as a "technical" costume

## Responsiveness

- 768px breakpoint: label columns collapse, data tables stack
- 480px breakpoint: display type drops one step, side padding 16px
- Navigation: sticky topbar with hamburger below 768px
