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
| 2026-10-05 | Registration UI v3: white pages in the QR code palette (lime, leaf, forest, deep green ink, gold accents), Archivo Black and Plus Jakarta Sans via Google Fonts; thank-you page shows a pre-rendered styled QR SVG for sharing | tooling | User picked the white QR-colour template from the design options artifact. The QR is a static SVG asset in src/data/imgg (generated once with qr-code-styling, decodes to the /register URL), so no runtime QR dependency is added. v1 is tag design-v1, v2 is tag design-v2. |
| 2026-10-05 | Registration emails move from EmailJS (browser) to Resend via a Vercel serverless function at /api/register; env vars RESEND_API_KEY, RESEND_FROM, ORGANISER_EMAIL are server-only | hosting | The API key cannot live in a CRA bundle, so the project now has server-side code, which stack.md previously ruled out. It runs only on the Vercel target: the legacy cPanel/zip deploy has no /api, so /register must be served from Vercel. The key is held in .env.local and the Vercel project env vars. Tracked in issue #4. |
| 2026-10-05 | Removed the hidden honeypot field from /register and /api/register | scope | On the first real preview test the server returned a success response for a genuine registration without sending any email (Resend log showed no send), consistent with the browser autofilling the hidden field. A silent drop of a real registrant costs more than the honeypot protects, since anything calling the API directly bypasses it anyway. Abuse protection is the same-origin check, server validation and a recommended Vercel rate-limit rule. |
