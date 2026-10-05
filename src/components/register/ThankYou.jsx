import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { EVENT } from './eventInfo';
import { loadInvite } from './inviteStore';
import './register.css';

const Arrow = ({ down }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
    <path
      d={down ? 'M10 4v10m0 0-4-4m4 4 4-4M4.5 16h11' : 'M4 10h11M11 5.5 15.5 10 11 14.5'}
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ThankYou() {
  const { state } = useLocation();
  const [blob, setBlob] = useState(null);
  const [ready, setReady] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('rg-body');
    return () => document.body.classList.remove('rg-body');
  }, []);

  useEffect(() => {
    let live = true;
    loadInvite().then((b) => {
      if (live) {
        setBlob(b);
        setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!blob) return undefined;
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  const firstName = state?.firstName || '';
  const file = useMemo(
    () => (blob ? new File([blob], `pgwt-2026-invite-${slug(firstName) || 'guest'}.jpg`, { type: 'image/jpeg' }) : null),
    [blob, firstName]
  );
  const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));

  if (!state) return <Navigate to="/register" replace />;

  const download = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    try {
      await navigator.share({
        files: [file],
        title: `My invite to ${EVENT.name} ${EVENT.year}`,
        text: `I'll be at ${EVENT.name} ${EVENT.year}. Register at https://www.praisegodwiththetwins.com/register`,
      });
    } catch {
      // The person closed the share sheet: nothing to do.
    }
  };

  return (
    <div className="rg rg-thanks">
      <header className="rg-top">
        <span className="rg-wordmark">{EVENT.name}</span>
        <span className="rg-year">{EVENT.year}</span>
      </header>

      <main className="rg-shell rg-shell--thanks">
        <section className="rg-done">
          <div className="rg-check" aria-hidden="true">
            <span className="rg-check-ring" />
            <svg viewBox="0 0 48 48" width="48" height="48">
              <path d="m13 25 8 8 14-17" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
            </svg>
          </div>
          <p className="rg-eyebrow">Registration complete</p>
          <h1 className="rg-title">
            {firstName ? `${firstName}, you're in` : "You're in"}. See you at the <span className="rg-script">{EVENT.theme}</span>
          </h1>
          <p className="rg-lede">
            {state.emailSent
              ? `A confirmation is on its way to ${state.email}. If you don't see it within a few minutes, check your spam folder.`
              : `We couldn't send the confirmation email to ${state.email}, but your registration was received. Download your invite below and keep it safe.`}
          </p>

          {file && (
            <div className="rg-actions rg-actions--wrap">
              <button type="button" className="rg-btn rg-btn--primary" onClick={download}>
                <span>Download invite</span>
                <span className="rg-btn-icon"><Arrow down /></span>
              </button>
              {canShare && (
                <button type="button" className="rg-btn rg-btn--ghost" onClick={share}>Share</button>
              )}
            </div>
          )}
          {file && <p className="rg-fine rg-fine--touch">On a phone, press and hold the invite to save it to your photos.</p>}
        </section>

        <figure className="rg-invite">
          {url ? (
            <img src={url} alt="Your personal invite to Praise God with the Twins 2026" width="1500" height="2000" />
          ) : (
            <div className="rg-invite-empty">
              {ready ? (
                <>
                  <p>Your invite isn't available on this device any more.</p>
                  <Link to="/register" className="rg-btn rg-btn--ghost">Create it again</Link>
                </>
              ) : (
                <span className="rg-spin rg-spin--lg" aria-label="Loading your invite" />
              )}
            </div>
          )}
        </figure>

        <section className="rg-dates" aria-labelledby="dates-title">
          <h2 className="rg-h2" id="dates-title">Save the dates</h2>
          <ul>
            {EVENT.sessions.map((s) => (
              <li key={s.id}>
                <div className="rg-date">
                  <span className="rg-date-day">{s.day}</span>
                  <span className="rg-date-time">{s.time}</span>
                </div>
                <div className="rg-date-body">
                  {s.title && <strong>{s.title}</strong>}
                  {s.venue && <span className="rg-venue">{s.venue}</span>}
                  {s.address && <span className="rg-address">{s.address}</span>}
                </div>
              </li>
            ))}
          </ul>
          <p className="rg-fine">
            Questions? Call <a href={`tel:${EVENT.enquiries.tel}`}>{EVENT.enquiries.display}</a>
          </p>
        </section>
      </main>

      <footer className="rg-foot">Convened by {EVENT.conveners}</footer>
    </div>
  );
}
