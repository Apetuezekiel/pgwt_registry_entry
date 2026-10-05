import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { EVENT } from './eventInfo';
import { loadInvite } from './inviteStore';
import markSrc from '../../data/imgg/pgwt_mark.png';
import qrSrc from '../../data/imgg/pgwt_register_qr.svg';
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
        <img className="rg-mark" src={markSrc} alt="" width="40" height="40" />
        <span className="rg-wordmark">{EVENT.name}</span>
        <span className="rg-year">{EVENT.year}</span>
        <a className="rg-enq" href={`tel:${EVENT.enquiries.tel}`}>Enquiries {EVENT.enquiries.display}</a>
      </header>

      <main className="rg-shell rg-shell--thanks">
        <section className="rg-done">
          <ol className="rg-steps" aria-label="Progress, all steps complete">
            {['Details', 'Photo', 'Review'].map((label) => (
              <li key={label} className="rg-step is-done">
                <span className="rg-step-inner">
                  <span className="rg-mk" aria-hidden="true" />
                  <span className="rg-step-label">{label}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="rg-done-title">
            <span className="rg-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path d="m5.5 12.5 4.2 4.2L18.5 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
              </svg>
            </span>
            <h1 className="rg-h1">{firstName ? `${firstName}, you're in` : "You're in"}</h1>
          </div>
          <p className="rg-lede">
            {state.emailSent
              ? `A confirmation is on its way to ${state.email}. If you don't see it within a few minutes, check your spam folder.`
              : `We couldn't send the confirmation email to ${state.email}, but your registration was received. Download your invite below and keep it safe.`}
          </p>
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

        {file && (
          <div className="rg-get">
            <div className="rg-actions rg-actions--wrap">
              <button type="button" className="rg-btn rg-btn--primary" onClick={download}>
                <span>Download invite</span>
                <span className="rg-btn-icon"><Arrow down /></span>
              </button>
              {canShare && (
                <button type="button" className="rg-btn rg-btn--ghost" onClick={share}>Share</button>
              )}
            </div>
            <p className="rg-fine rg-fine--touch">On a phone, press and hold the invite to save it to your photos.</p>
          </div>
        )}

        <section className="rg-dates" aria-labelledby="dates-title">
          <h2 className="rg-h2" id="dates-title">Save the dates</h2>
          <ul>
            {EVENT.sessions.map((s) => (
              <li key={s.id}>
                <span className="rg-date-day">{s.day}</span>
                <div className="rg-date-body">
                  <span>
                    <strong>{s.time}</strong>
                    {(s.title || s.venue) && ` · ${[s.title, s.venue].filter(Boolean).join(', ')}`}
                  </span>
                  {s.address && <span className="rg-address">{s.address}</span>}
                </div>
              </li>
            ))}
          </ul>
          <div className="rg-share">
            <img src={qrSrc} alt="QR code that opens praisegodwiththetwins.com/register" width="112" height="112" />
            <p>
              <strong>Know someone who should be there?</strong>
              Show them this code and they can register in a minute.
            </p>
          </div>
          <p className="rg-fine">
            Questions? Call <a href={`tel:${EVENT.enquiries.tel}`}>{EVENT.enquiries.display}</a>
          </p>
        </section>
      </main>

      <footer className="rg-foot">Convened by {EVENT.conveners}</footer>
    </div>
  );
}
