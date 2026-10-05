// POST /api/register: validates a registration and sends two emails through Resend
// (confirmation with the invite attached to the registrant, notification to the organiser).
// Env: RESEND_API_KEY, RESEND_FROM, ORGANISER_EMAIL. The key never reaches the browser.
const EVENT = require('./_event');

const RESEND_URL = 'https://api.resend.com/emails';
const MAX_IMAGE_B64 = 4 * 1024 * 1024; // ~3 MB of JPEG; the real invite is well under 1.5 MB
const SEND_TIMEOUT_MS = 12000;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const oneLine = (s) => String(s).replace(/[\r\n\t]+/g, ' ').trim();

function parse(body) {
  const b = body && typeof body === 'object' ? body : {};
  const v = {
    firstName: oneLine(b.to_firstname ?? ''),
    lastName: oneLine(b.to_lastname ?? ''),
    phone: oneLine(b.to_phone ?? ''),
    email: oneLine(b.to_email ?? ''),
    address: String(b.to_address ?? '').replace(/\s+/g, ' ').trim(),
  };
  const image = typeof b.invite === 'string' ? b.invite : '';
  const id = typeof b.submissionId === 'string' ? b.submissionId : '';
  const errors = [];
  if (!v.firstName || v.firstName.length > 80) errors.push('first name');
  if (!v.lastName || v.lastName.length > 80) errors.push('last name');
  if (!/^\d{7,15}$/.test(v.phone.replace(/[\s()+-]/g, '')) || v.phone.length > 30) errors.push('phone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) || v.email.length > 254) errors.push('email');
  if (v.address.length < 5 || v.address.length > 300) errors.push('address');
  if (!/^[a-f0-9]{32}$/.test(id)) errors.push('submission id');
  // JPEG magic bytes FF D8 FF always encode to "/9j/" in base64.
  if (!image || image.length > MAX_IMAGE_B64 || !image.startsWith('/9j/')) errors.push('invite image');
  return { v, image, id, errors };
}

const LIME = '#528609';
const FOREST = '#2f4d05';
const INK = '#0c1608';
const MIST = '#f2f7e8';
const LINE = '#cddab9';

function sessionsHtml() {
  return EVENT.sessions
    .map((s) => {
      const where = [s.venue, s.address].filter(Boolean).join(', ');
      return `<tr><td style="padding:10px 14px 10px 0;vertical-align:top;white-space:nowrap;font-weight:700;color:${FOREST}">${esc(s.day)}</td>
<td style="padding:10px 0;vertical-align:top;color:${INK}"><strong>${esc(s.time)}</strong>${s.title ? ` · ${esc(s.title)}` : ''}${where ? `<br><span style="color:#55634a">${esc(where)}</span>` : ''}</td></tr>`;
    })
    .join('');
}

function sessionsText() {
  return EVENT.sessions
    .map((s) => `${s.day}, ${s.time}${s.title ? ` - ${s.title}` : ''}${s.venue ? `\n  ${s.venue}, ${s.address}` : ''}`)
    .join('\n');
}

function shell(inner) {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid ${LINE};border-radius:16px">
<tr><td style="padding:6px 0;background:${LIME};background:linear-gradient(135deg,${LIME},${FOREST});border-radius:15px 15px 0 0;height:6px;line-height:6px;font-size:0">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 24px">${inner}</td></tr>
</table></td></tr></table></body></html>`;
}

function confirmation(v) {
  const subject = `You're registered: ${EVENT.name} ${EVENT.year}`;
  const html = shell(`
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${LIME};font-weight:700">Registration confirmed</p>
<h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;color:${INK}">${esc(v.firstName)}, you're in.</h1>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3b4a2e">Thank you for registering for <strong>${esc(EVENT.name)} ${EVENT.year}</strong> (theme: ${esc(EVENT.theme)}). Your personalised invite is attached to this email. Save it and share it with someone who should be there.</p>
<div style="background:${MIST};border-radius:12px;padding:14px 18px;margin:0 0 18px">
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">${sessionsHtml()}</table></div>
<p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#3b4a2e">Questions? Call <a href="tel:${esc(EVENT.enquiries.tel)}" style="color:${FOREST};font-weight:700">${esc(EVENT.enquiries.display)}</a> or reply to this email.</p>
<p style="margin:16px 0 0;font-size:13px;color:#55634a">With love, ${esc(EVENT.conveners)}</p>`);
  const text = `${v.firstName}, you're in.

Thank you for registering for ${EVENT.name} ${EVENT.year} (theme: ${EVENT.theme}). Your personalised invite is attached.

${sessionsText()}

Questions? Call ${EVENT.enquiries.display} or reply to this email.

With love, ${EVENT.conveners}`;
  return { subject, html, text };
}

function notification(v) {
  const full = `${v.firstName} ${v.lastName}`;
  const row = (k, val) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#55634a;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0;color:${INK}">${val}</td></tr>`;
  const html = shell(`
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${LIME};font-weight:700">New registration</p>
<h1 style="margin:0 0 14px;font-size:22px;color:${INK}">${esc(full)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5">
${row('Phone', `<a href="tel:${esc(v.phone.replace(/[^\d+]/g, ''))}" style="color:${FOREST}">${esc(v.phone)}</a>`)}
${row('Email', `<a href="mailto:${esc(v.email)}" style="color:${FOREST}">${esc(v.email)}</a>`)}
${row('Address', esc(v.address))}
</table>
<p style="margin:16px 0 0;font-size:13px;color:#55634a">Their invite is attached. Reply to this email to write to them directly.</p>`);
  const text = `New registration: ${full}\nPhone: ${v.phone}\nEmail: ${v.email}\nAddress: ${v.address}\n\nTheir invite is attached. Reply to write to them directly.`;
  return { subject: `New registration: ${full}`, html, text };
}

async function send(payload, idempotencyKey) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (res.ok) return { ok: true };
    let msg = '';
    try {
      msg = (await res.json()).message || '';
    } catch {
      // body was not JSON
    }
    return { ok: false, status: res.status, message: msg || res.statusText };
  } catch (err) {
    return { ok: false, status: 0, message: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Browsers always send Origin on a cross-site POST; reject any that is not this site.
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try {
      host = new URL(origin).host;
    } catch {
      // malformed origin falls through to the rejection below
    }
    if (host !== req.headers.host) return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const { RESEND_API_KEY, RESEND_FROM, ORGANISER_EMAIL } = process.env;
  if (!RESEND_API_KEY || !RESEND_FROM || !ORGANISER_EMAIL) {
    console.error('register: missing RESEND_API_KEY, RESEND_FROM or ORGANISER_EMAIL');
    return res.status(500).json({ ok: false, error: 'Email is not configured on the server.' });
  }

  const { v, image, id, errors } = parse(req.body);
  if (errors.length) return res.status(400).json({ ok: false, error: `Invalid: ${errors.join(', ')}` });

  const filename = `PGWT-${EVENT.year}-invite-${v.firstName.replace(/[^\w-]+/g, '') || 'guest'}.jpg`;
  const attachments = [{ filename, content: image }];
  const toGuest = confirmation(v);
  const toOrganiser = notification(v);

  // The key is a hash of the submission, so a retry of the same form never sends twice.
  const [guest, organiser] = await Promise.all([
    send({ from: RESEND_FROM, to: [v.email], reply_to: ORGANISER_EMAIL, ...toGuest, attachments }, `${id}-guest`),
    send({ from: RESEND_FROM, to: [ORGANISER_EMAIL], reply_to: v.email, ...toOrganiser, attachments }, `${id}-organiser`),
  ]);

  if (!guest.ok) console.error('register: confirmation failed', guest.status, guest.message);
  if (!organiser.ok) console.error('register: organiser notification failed', organiser.status, organiser.message);

  if (!guest.ok && !organiser.ok) {
    return res.status(502).json({
      ok: false,
      error: 'We could not send your registration emails.',
      detail: `Confirmation: ${guest.status || 'no response'} ${guest.message} · Organiser: ${organiser.status || 'no response'} ${organiser.message}`,
    });
  }
  return res.status(200).json({ ok: true, confirmation: guest.ok, organiser: organiser.ok });
};
