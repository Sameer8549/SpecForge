# SpecForge — Product Intelligence Platform

## What it is

SpecForge resolves sparse product identifiers (MPN, brand, short description, optional datasheet) into verified, sourced, confidence-scored structured product records for industrial commerce.

## Who uses it

Procurement engineers, data operations teams, catalog managers at industrial distributors and manufacturers — people who receive raw MPNs and need to know exactly what a part is before it enters a catalog, purchase order, or BOM.

## What they do here

1. Submit an MPN (with optional brand + description + datasheet)
2. Watch the classify → extraction → verification → adjudication → audit pipeline run
3. Review the resulting assay record with per-field confidence scores and source provenance
4. Approve or override adjudicated conflicts
5. Export the verified record to downstream systems

## What makes it distinctive

- Every resolved value is traceable to its source(s)
- Conflicts are shown with full reasoning, not hidden behind a single answer
- Confidence is per-field, not a single record score
- The UI is the instrument — it shows the mechanism, not just the result

## Platform

Web application (React, Vite). Target users: desktop + tablet in office/warehouse settings.

## Content rules

- All demonstration data is synthetic and labelled as such
- No invented prices, customer names, benchmarks, or external system capabilities
