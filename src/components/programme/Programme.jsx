import { useEffect, useRef, useState } from 'react';
import { EVENT } from '../register/eventInfo';
import markSrc from '../../data/imgg/pgwt_mark.png';
import pages from './pages.json';
import '../register/register.css';
import './programme.css';

const PDF_URL = '/programme-files/pgwt-2026-jubilee-programme.pdf';
const PDF_NAME = 'PGWT-2026-Jubilee-Programme.pdf';
const pdfSize = `${(pages.pdfBytes / 1e6).toFixed(1)} MB`;

const pageSrc = (n, w) => `/programme-files/pages/p${String(n).padStart(2, '0')}-${w}.webp`;
const numbers = Array.from({ length: pages.count }, (_, i) => i + 1);

const DownloadIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
    <path
      d="M10 4v10m0 0-4-4m4 4 4-4M4.5 16h11"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

function DownloadButton({ innerRef }) {
  return (
    <a ref={innerRef} className="rg-btn rg-btn--primary" href={PDF_URL} download={PDF_NAME}>
      <span>Download PDF ({pdfSize})</span>
      <span className="rg-btn-icon"><DownloadIcon /></span>
    </a>
  );
}

export default function Programme() {
  const heroCta = useRef(null);
  const [dock, setDock] = useState(false);

  useEffect(() => {
    const previous = document.title;
    document.title = `Programme | ${EVENT.name} ${EVENT.year}`;
    document.body.classList.add('rg-body');
    return () => {
      document.title = previous;
      document.body.classList.remove('rg-body');
    };
  }, []);

  useEffect(() => {
    const el = heroCta.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setDock(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="rg pg">
      <header className="rg-top">
        <img className="rg-mark" src={markSrc} alt="" width="40" height="40" />
        <span className="rg-wordmark">{EVENT.name}</span>
        <span className="rg-year">{EVENT.year}</span>
        <a className="rg-enq" href={`tel:${EVENT.enquiries.tel}`}>Enquiries {EVENT.enquiries.display}</a>
      </header>

      <main className="pg-main">
        <section className="pg-hero" aria-labelledby="pg-title">
          <p className="pg-eyebrow">Official programme</p>
          <h1 id="pg-title" className="pg-title">Event programme</h1>
          <p className="pg-lede">
            {EVENT.name} {EVENT.year}. Theme: {EVENT.theme}.
          </p>
          <p className="pg-meta">
            <span>{pages.count} pages</span>
            <span aria-hidden="true">·</span>
            <span>Read it right here, or keep a copy</span>
          </p>
          <div className="pg-cta">
            <DownloadButton innerRef={heroCta} />
          </div>
        </section>

        <ol
          className="pg-pages"
          aria-label={`Programme pages, ${pages.count} in total`}
          style={{ '--pg-ratio': `${pages.width} / ${pages.height}` }}
        >
          {numbers.map((n) => (
            <li key={n} className="pg-page">
              <img
                src={pageSrc(n, 1240)}
                srcSet={`${pageSrc(n, 800)} 800w, ${pageSrc(n, 1240)} 1240w`}
                sizes="(min-width: 900px) 860px, 100vw"
                width={pages.width}
                height={pages.height}
                alt={`Programme page ${n} of ${pages.count}`}
                loading={n === 1 ? 'eager' : 'lazy'}
                decoding="async"
                {...(n === 1 ? { fetchpriority: 'high' } : {})}
              />
            </li>
          ))}
        </ol>

        <section className="pg-end" aria-label="End of programme">
          <p>That is the whole programme.</p>
          <div className="pg-cta">
            <DownloadButton />
          </div>
          <button type="button" className="rg-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to the top
          </button>
        </section>
      </main>

      <div className="pg-dock" data-show={dock} aria-hidden={!dock}>
        <a className="rg-btn rg-btn--primary" href={PDF_URL} download={PDF_NAME} tabIndex={dock ? 0 : -1}>
          <span>Download PDF ({pdfSize})</span>
          <span className="rg-btn-icon"><DownloadIcon /></span>
        </a>
      </div>

      <footer className="rg-foot">
        Enquiries <a href={`tel:${EVENT.enquiries.tel}`}>{EVENT.enquiries.display}</a>
        <span aria-hidden="true"> · </span>
        Convened by {EVENT.conveners}
      </footer>
    </div>
  );
}
