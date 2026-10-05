---
source: bootstrap
---

# Stack

## Language/Framework
Create React App (react-scripts 5.0.1), React 18.2, react-router-dom v6 (BrowserRouter/Routes in src/App.js). The UI is hand-written CSS (src/components/register/register.css) with no UI library. No TypeScript. Client-side SPA plus one Vercel serverless function (api/register.js).

## Hosting Platform
Two targets as of 2026-09-15:
- Original: manual `npm run build` + zip upload to shared/cPanel-style hosting under `pgwt.kennyjonesdesigns.com` (`package.json`'s `homepage` field; a pre-built `build.zip` is committed at the repo root as evidence of this flow).
- New: Vercel project `pgwt_registry_entry` (GitHub-connected, Create React App preset, auto-deployed on push), aliased at `pgwtregistryentry.vercel.app`. See `.claude/services-log.md` and `.claude/decisions-log.md` for context.

## Database
Prisma Postgres (Vercel Marketplace, Free plan, region iad1), database `pgwt-registrations`, connected to the Vercel project for Production and Preview (env `DATABASE_URL`, also `POSTGRES_URL` and `PRISMA_DATABASE_URL`). One table, `registrations`, written from `api/register.js` through `pg` (`api/_db.js`). Rows are tagged `env` (production, preview) so test sign-ups stay out of the real count. Created and read with `scripts/registrations.js` (see its header for the commands). The cPanel/zip deploy has no `/api`, so it never writes here.

## Key Third-Party Services
- Prisma Postgres via Vercel Marketplace (added 2026-10-05, issue #6): stores one row per registration so the organiser can count and export sign-ups.
- Resend (added 2026-10-05, issue #4): server-side email from the Vercel function `api/register.js` (env `RESEND_API_KEY`, `RESEND_FROM`, `ORGANISER_EMAIL`; sending domain praisegodwiththetwins.com). Replaces EmailJS for the routed registration flow.

## Known Constraints
- One Vercel serverless function exists (`api/register.js`, Vercel target only; the cPanel/zip deploy has no `/api`). Local testing needs `vercel dev` (launch config `pgwt-vercel-dev`), since the CRA dev server does not run `/api`. Otherwise client-only SPA: any "coming soon" or new page must be a pure React component/route - no server rendering, no API routes available.
- react-router-dom v6 `Routes` in `src/App.js` currently has no catch-all/404 route, so any unmatched path (e.g. `/website`) renders blank rather than a 404 page or redirect.
- No test files present despite `@testing-library/*` being installed - `npm test` would run against an empty suite.
