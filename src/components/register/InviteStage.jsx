import { useEffect, useRef, useState } from 'react';
import { FLIER_W, FLIER_H, SLOT, PHOTO_R, drawInvite, clampOffsets } from './drawInvite';

const pct = (v, total) => `${(v / total) * 100}%`;
const SLOT_STYLE = {
  left: pct(SLOT.cx - PHOTO_R, FLIER_W),
  top: pct(SLOT.cy - PHOTO_R, FLIER_H),
  width: pct(PHOTO_R * 2, FLIER_W),
};
const NUDGE = 0.03;

function CameraIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="rg-slot-icon">
      <path
        d="M5 11.5h4l1.6-2.8h10.8L23 11.5h4a1 1 0 0 1 1 1V24a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V12.5a1 1 0 0 1 1-1Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
      <circle cx="16" cy="17.8" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function InviteStage({ flier, photo, transform, interactive, onTransform, onPick, failed }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const slotRef = useRef(null);
  const drag = useRef(null);
  const [cssWidth, setCssWidth] = useState(0);

  // Measure on the next frame, not inside the observer callback (avoids the "ResizeObserver loop" error).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCssWidth(entry.contentRect.width));
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !flier || cssWidth < 1) return undefined;
    const raf = requestAnimationFrame(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(cssWidth * dpr);
      canvas.width = w;
      canvas.height = Math.round((w * FLIER_H) / FLIER_W);
      drawInvite(canvas.getContext('2d'), w, flier, photo, transform);
    });
    return () => cancelAnimationFrame(raf);
  }, [flier, photo, transform, cssWidth]);

  const move = (ox, oy) => onTransform(clampOffsets(photo, { ...transform, ox, oy }));

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: transform.ox, oy: transform.oy };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const d = slotRef.current.getBoundingClientRect().width;
    move(drag.current.ox + (e.clientX - drag.current.x) / d, drag.current.oy + (e.clientY - drag.current.y) / d);
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onKeyDown = (e) => {
    const step = { ArrowLeft: [-NUDGE, 0], ArrowRight: [NUDGE, 0], ArrowUp: [0, -NUDGE], ArrowDown: [0, NUDGE] }[e.key];
    if (!step) return;
    e.preventDefault();
    move(transform.ox + step[0], transform.oy + step[1]);
  };

  return (
    <div className="rg-stage" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="rg-stage-canvas"
        role="img"
        aria-label="Your invite preview on the Praise God with the Twins 2026 flier"
      />
      {failed && (
        <p className="rg-stage-note" role="alert">We couldn't load the flier. Refresh the page to try again.</p>
      )}
      {!photo && interactive && (
        <button type="button" className="rg-slot rg-slot--add" style={SLOT_STYLE} onClick={onPick}>
          <CameraIcon />
          <span>Add your photo</span>
        </button>
      )}
      {!photo && !interactive && (
        <div className="rg-slot rg-slot--add rg-slot--idle" style={SLOT_STYLE} aria-hidden="true">
          <CameraIcon />
          <span>Your photo goes here</span>
        </div>
      )}
      {photo && interactive && (
        <div
          ref={slotRef}
          className="rg-slot rg-slot--drag"
          style={SLOT_STYLE}
          tabIndex={0}
          role="group"
          aria-label="Photo position. Drag, or use the arrow keys, to reposition."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
        />
      )}
    </div>
  );
}
