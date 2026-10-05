import React from 'react';
import './ComingSoon.css';

function DrumIcon() {
  return (
    <svg
      className="cs-drumIcon"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 8 L26 8 L23 26 L11 26 Z" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="17" cy="8" rx="9" ry="3" stroke="currentColor" strokeWidth="1" />
      <line x1="10.5" y1="12" x2="23.5" y2="12" stroke="currentColor" strokeWidth="0.75" />
      <line x1="9.6" y1="16" x2="24.4" y2="16" stroke="currentColor" strokeWidth="0.75" />
      <line x1="9" y1="20" x2="25" y2="20" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

function ComingSoon() {
  return (
    <div className="cs-page">
      <div className="cs-noise" aria-hidden="true" />
      <div className="cs-glow cs-glow--one" aria-hidden="true" />
      <div className="cs-glow cs-glow--two" aria-hidden="true" />

      <main className="cs-content">
        <div className="cs-eyebrow cs-reveal" style={{ '--cs-delay': '0ms' }}>
          <DrumIcon />
          <span>Save the Date &middot; 2026</span>
        </div>

        <p className="cs-script cs-reveal" style={{ '--cs-delay': '120ms' }}>
          Praise God
        </p>

        <h1 className="cs-headline cs-reveal" style={{ '--cs-delay': '240ms' }}>
          WITH THE
          <br />
          <span className="cs-headline-accent">TWINS</span>
        </h1>

        <p className="cs-tagline cs-reveal" style={{ '--cs-delay': '360ms' }}>
          The 2026 edition is on its way. Details are being finalized &mdash;
          registration for this year&rsquo;s gathering opens soon.
        </p>

        <div className="cs-divider cs-reveal" style={{ '--cs-delay': '460ms' }} aria-hidden="true" />

        <p className="cs-footer cs-reveal" style={{ '--cs-delay': '560ms' }}>
          Convened by Taiwo &amp; Kenny Jones
        </p>
      </main>
    </div>
  );
}

export default ComingSoon;
