---
source: bootstrap
---

# Features

Append-only log of feature and infrastructure requests for this project. Do not edit or delete prior entries - new rows only, except updating an existing row's own Status field, which is the one sanctioned exception to strict append-only (see "Updating a Feature's Status" below). Not-a-feature (CI/CD, deployment, ops/release tooling) is never logged here going forward - the Category column exists to reclassify what's already in the file, not to keep adding more of it.

| Date | Feature | Category (Feature/Infrastructure/Not-a-feature) | Description | Status (planned/in-progress/shipped) |
|------|---------|--------------------------------------------------|--------------|----------------------------------------|
| 2026-09-15 | /website coming-soon page | Feature | A designed "Praise God with the Twins 2026 Registration - Coming Soon" landing page served at the previously-blank /website route, built with react-bootstrap and the project's existing design conventions. Tracked in [issue #1](https://github.com/Apetuezekiel/pgwt_registry_entry/issues/1). | shipped |
| 2026-10-05 | /register 2026 registration form | Feature | The invitee selfie form is live at /register with the new 2026 portrait flier: the uploaded photo is clipped into the flier's circle (percent-positioned, so it holds at any width) and the downloaded invite renders at the flier's native 1500x2000. /thanks is routed again; coming-soon page is no longer routed. Tracked in [issue #2](https://github.com/Apetuezekiel/pgwt_registry_entry/issues/2). | in-progress |
| 2026-10-05 | Registration flow and thank-you page redesign (v2) | Feature | Three-step flow (details, photo, review) with inline validation, a circular photo editor (drag, pinch, wheel, arrow buttons, zoom that keeps the face in view), a live flier preview that matches the downloaded JPEG exactly, and a new success page with invite download/share and the event dates and venues from the flier. Classic ivory, navy and gold design. Tracked in [issue #3](https://github.com/Apetuezekiel/pgwt_registry_entry/issues/3). | in-progress |
| 2026-10-05 | Resend email delivery for registrations | Infrastructure | A Vercel function validates the form, then emails the registrant a confirmation with their invite attached and notifies the organiser. Uses a hash of the submission as the idempotency key so retries never duplicate, a honeypot field, same-origin check and server-side validation. Tracked in [issue #4](https://github.com/Apetuezekiel/pgwt_registry_entry/issues/4). | in-progress |
| 2026-10-05 | Registration storage and organiser export | Infrastructure | Each registration is saved as a Postgres row from api/register.js, and a developer script lists the total and the details (CSV optional) on request. No interactive surface for visitors or admins. | in-progress |
