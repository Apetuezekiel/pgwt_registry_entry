// Hands the generated invite from /register to /thanks. Memory covers the normal
// client-side navigation; sessionStorage covers a page refresh on /thanks.
const KEY = 'pgwt-invite-2026';
let current = null;

const toDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export async function saveInvite(blob) {
  current = blob;
  try {
    sessionStorage.setItem(KEY, await toDataUrl(blob));
  } catch {
    // Storage full or blocked: memory copy still works for this visit.
  }
}

export async function loadInvite() {
  if (current) return current;
  try {
    const url = sessionStorage.getItem(KEY);
    if (url) {
      current = await (await fetch(url)).blob();
      return current;
    }
  } catch {
    // fall through
  }
  return null;
}

export function clearInvite() {
  current = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
