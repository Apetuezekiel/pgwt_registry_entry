---
source: bootstrap
---

# Stack

## Language/Framework
Create React App (react-scripts 5.0.1), React 18.2, react-router-dom v6 (BrowserRouter/Routes in src/App.js), react-bootstrap + bootstrap 5.3 for UI. No TypeScript, no server-side code - pure client-side SPA.

## Hosting Platform
Two targets as of 2026-09-15:
- Original: manual `npm run build` + zip upload to shared/cPanel-style hosting under `pgwt.kennyjonesdesigns.com` (`package.json`'s `homepage` field; a pre-built `build.zip` is committed at the repo root as evidence of this flow).
- New: Vercel project `pgwt_registry_entry` (GitHub-connected, Create React App preset, auto-deployed on push), aliased at `pgwtregistryentry.vercel.app`. See `.claude/services-log.md` and `.claude/decisions-log.md` for context.

## Database
None. No backend, no database client in dependencies. All persistence is client-side (form state) plus outbound email via EmailJS.

## Key Third-Party Services
- EmailJS (`@emailjs/browser` v3 and legacy `emailjs-com` v3, both present - see `src/components/SendEmails.jsx`) for sending registration confirmation emails directly from the browser, no backend.
- html2canvas - for generating a shareable image/selfie artifact from the registration form.
- react-easy-crop / react-image-crop / react-dropzone - image upload and cropping for the invitee photo.

## Known Constraints
- Client-only SPA with no backend: any "coming soon" or new page must be a pure React component/route - no server rendering, no API routes available.
- react-router-dom v6 `Routes` in `src/App.js` currently has no catch-all/404 route, so any unmatched path (e.g. `/website`) renders blank rather than a 404 page or redirect.
- Two overlapping EmailJS packages are installed (`@emailjs/browser` and legacy `emailjs-com`) - not a hard constraint, but a sign of incomplete migration worth being aware of before adding more email logic.
- No test files present despite `@testing-library/*` being installed - `npm test` would run against an empty suite.
