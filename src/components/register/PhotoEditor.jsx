import { useEffect, useRef, useState } from 'react';
import { ZOOM_MIN, ZOOM_MAX, drawPhoto } from './drawInvite';

const NUDGE = 0.04;
const clampZoom = (z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));

// A large circular window onto the photo. It frames the photo exactly as the flier's
// circle will (same transform, same units), but big enough to grab with a thumb.
export default function PhotoEditor({ photo, transform, onTransform }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const latest = useRef(transform);
  const [size, setSize] = useState(0);

  latest.current = transform;

  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(([entry]) => setSize(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size < 1) return undefined;
    const raf = requestAnimationFrame(() => {
      const px = Math.round(size * Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = px;
      canvas.height = px;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      drawPhoto(ctx, px / 2, px / 2, px, photo, transform);
    });
    return () => cancelAnimationFrame(raf);
  }, [photo, transform, size]);

  // Wheel zoom needs a non-passive listener so the page does not scroll as well.
  useEffect(() => {
    const el = wrapRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      onTransform({ zoom: clampZoom(latest.current.zoom - e.deltaY * 0.002) });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onTransform]);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const beginGesture = () => {
    const t = latest.current;
    if (pointers.current.size === 2) {
      gesture.current = { mode: 'pinch', dist: distance(), zoom: t.zoom };
    } else if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      gesture.current = { mode: 'pan', x: p.x, y: p.y, ox: t.ox, oy: t.oy };
    } else {
      gesture.current = null;
    }
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    beginGesture();
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (g.mode === 'pan') {
      const d = wrapRef.current.getBoundingClientRect().width;
      onTransform({ ox: g.ox + (e.clientX - g.x) / d, oy: g.oy + (e.clientY - g.y) / d });
    } else if (g.mode === 'pinch' && pointers.current.size === 2) {
      onTransform({ zoom: clampZoom((g.zoom * distance()) / g.dist) });
    }
  };

  const endPointer = (e) => {
    pointers.current.delete(e.pointerId);
    beginGesture();
  };

  const onKeyDown = (e) => {
    const t = latest.current;
    const moves = { ArrowLeft: [-NUDGE, 0], ArrowRight: [NUDGE, 0], ArrowUp: [0, -NUDGE], ArrowDown: [0, NUDGE] };
    if (moves[e.key]) {
      e.preventDefault();
      onTransform({ ox: t.ox + moves[e.key][0], oy: t.oy + moves[e.key][1] });
    } else if (e.key === '+' || e.key === '=') {
      onTransform({ zoom: clampZoom(t.zoom + 0.1) });
    } else if (e.key === '-') {
      onTransform({ zoom: clampZoom(t.zoom - 0.1) });
    }
  };

  return (
    <div
      ref={wrapRef}
      className="rg-editor"
      tabIndex={0}
      role="group"
      aria-label="Photo editor. Drag to move, pinch or scroll to zoom. Arrow keys move, plus and minus zoom."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvasRef} className="rg-editor-canvas" />
    </div>
  );
}
