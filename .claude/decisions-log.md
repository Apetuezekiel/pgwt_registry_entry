---
source: bootstrap
---

# Decisions Log

Append-only log of consequential decisions for this project. Do not edit or delete prior entries - add new rows only.

| Date | Decision | Constraint Type (cost/hosting/tooling/scope) | Rationale |
|------|----------|-----------------------------------------------|-----------|
| 2026-09-15 | Log initialized | scope | Decision-log workflow set up; no real entries yet, to be backfilled separately |
| 2026-09-15 | Added Vercel as a second deployment target (fresh project `pgwt_registry_entry`, auto-aliased to pgwtregistryentry.vercel.app) alongside the existing manual cPanel/zip deploy to pgwt.kennyjonesdesigns.com | hosting | User directed "push to vercel" for the new coming-soon page; this is a brand-new empty Vercel project, so its auto-assigned "production" alias carries no live traffic and does not touch the existing kennyjonesdesigns.com hosting |
| 2026-10-05 | /register serves the live registration form (2026 flier) instead of the coming-soon page | scope | User directed that the 2026 flier go on the registration page and the form go live at /register; coming-soon component kept in src/components but unrouted. Live EmailJS sends and invite downloads are now reachable in production. |
| 2026-10-05 | Registration UI is hand-written CSS with no Bootstrap, Toastify or html2canvas in the routed app; invite is composed on a canvas | tooling | Preview and download share one canvas drawing path (what you see is what you get), and the bundle drops from about 120 kB to 65 kB gzipped. The dark v1 design is preserved at git tag design-v1. Legacy 2023 components remain in src/components but are unrouted. |
