---
source: bootstrap
---

# Decisions Log

Append-only log of consequential decisions for this project. Do not edit or delete prior entries - add new rows only.

| Date | Decision | Constraint Type (cost/hosting/tooling/scope) | Rationale |
|------|----------|-----------------------------------------------|-----------|
| 2026-09-15 | Log initialized | scope | Decision-log workflow set up; no real entries yet, to be backfilled separately |
| 2026-09-15 | Added Vercel as a second deployment target (fresh project `pgwt_registry_entry`, auto-aliased to pgwtregistryentry.vercel.app) alongside the existing manual cPanel/zip deploy to pgwt.kennyjonesdesigns.com | hosting | User directed "push to vercel" for the new coming-soon page; this is a brand-new empty Vercel project, so its auto-assigned "production" alias carries no live traffic and does not touch the existing kennyjonesdesigns.com hosting |
