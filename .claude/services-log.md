---
source: bootstrap
---

# Services Log

Append-only log of third-party services/APIs this project uses and what each is for. Do not edit or delete prior entries - add new rows only.

| Date | Service | Used For | Category | Alternative Considered |
|------|---------|----------|----------|--------------------------|
| 2026-09-15 | Vercel | Hosting the /register coming-soon page build (auto-linked GitHub repo, Create React App preset) | Hosting | None - directly requested by user |
| 2026-10-05 | Resend (domain praisegodwiththetwins.com verified, sending key held server-side only) | Registration confirmation email with the invite attached, plus the organiser notification, sent from a Vercel function (api/register.js) | Email | EmailJS (existing; public key and templates live in the browser bundle, and it produced the real "could not submit" failures) |
| 2026-10-05 | Prisma Postgres (Vercel Marketplace, Free plan: 100K operations and 500 MB a month, database pgwt-registrations, region iad1) | Storing one row per registration for the organiser's count and export, written from api/register.js | Database | Vercel Blob (one file per registration, no dedupe, N reads to list), Google Sheet via Apps Script, reading organiser emails back from Resend |
