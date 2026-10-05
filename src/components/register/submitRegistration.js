// Posts the registration and invite to /api/register (a Vercel function that sends the emails through Resend).
const TIMEOUT_MS = 25000;

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error || new Error('Could not read the invite'));
    reader.readAsDataURL(blob);
  });

// Hash of what is being sent: a retry of the same form reuses the id, so the server never emails twice.
async function submissionId(values, invite) {
  const bytes = new TextEncoder().encode(JSON.stringify(values) + invite);
  if (!window.crypto?.subtle) return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

export class SubmitError extends Error {
  constructor(message, detail) {
    super(message);
    this.detail = detail;
  }
}

// Resolves { confirmation, organiser } when at least one email went out; throws SubmitError otherwise.
export async function submitRegistration(values, blob, company = '') {
  const invite = await toBase64(blob);
  const payload = { ...values, invite, company, submissionId: await submissionId(values, invite) };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } catch (err) {
    throw new SubmitError('network', err.name === 'AbortError' ? 'The server took too long to respond.' : err.message);
  } finally {
    clearTimeout(timer);
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // not JSON (for example an HTML error page from the host)
  }
  if (!res.ok || !data.ok) {
    throw new SubmitError(res.status === 400 ? 'invalid' : 'server', data.detail || data.error || `HTTP ${res.status}`);
  }
  return { confirmation: Boolean(data.confirmation), organiser: Boolean(data.organiser) };
}
