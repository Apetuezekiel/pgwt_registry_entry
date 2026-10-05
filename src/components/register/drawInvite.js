// Single source of truth for how a photo sits on the flier. The live preview and the
// downloaded invite both go through drawInvite, so what people see is what they get.
export const FLIER_W = 1500;
export const FLIER_H = 2000;
// The photo circle, in flier pixels. The flier's own white disc is r 260 at (750, 1458); this
// one is larger (room for two people) and is painted over it, so r must stay above the
// flier's blue rim (about 280) to hide it, and its bottom edge (cy + r) above the info
// band that starts near y 1780.
export const SLOT = { cx: 750, cy: 1440, r: 318 };
const RING = 10;
// The photo itself sits inside the white ring.
export const PHOTO_R = SLOT.r - RING;
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

const normRotation = (r) => ((r % 360) + 360) % 360;

// Work in "circle diameters" so offsets are independent of render size.
function cover(photo, rotation, zoom) {
  const swap = normRotation(rotation) % 180 !== 0;
  const rw = swap ? photo.height : photo.width;
  const rh = swap ? photo.width : photo.height;
  const s = Math.max(1 / rw, 1 / rh) * zoom;
  return { s, mx: Math.max(0, (rw * s - 1) / 2), my: Math.max(0, (rh * s - 1) / 2) };
}

// How far the photo can travel (in circle diameters) before the circle would show a gap.
export function panLimits(photo, { zoom, rotation }) {
  const { mx, my } = cover(photo, rotation, zoom);
  return { mx, my };
}

// Keep the circle fully covered by the photo.
export function clampOffsets(photo, { zoom, rotation, ox, oy }) {
  const { mx, my } = cover(photo, rotation, zoom);
  return { ox: Math.min(mx, Math.max(-mx, ox)), oy: Math.min(my, Math.max(-my, oy)) };
}

// Where a fresh photo starts: centred sideways, biased towards the top of portrait
// photos because that is where faces usually are.
export function initialTransform(photo) {
  const base = { zoom: 1, rotation: 0, ox: 0, oy: 0 };
  const { my } = cover(photo, 0, 1);
  return { ...base, oy: my * 0.55 };
}

// Draws the photo clipped to a circle of diameter d centred on (cx, cy).
export function drawPhoto(ctx, cx, cy, d, photo, t) {
  const { s } = cover(photo, t.rotation, t.zoom);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx + t.ox * d, cy + t.oy * d);
  ctx.rotate((normRotation(t.rotation) * Math.PI) / 180);
  ctx.scale(s * d, s * d);
  ctx.drawImage(photo, -photo.width / 2, -photo.height / 2);
  ctx.restore();
}

export function drawInvite(ctx, width, flier, photo, t) {
  const k = width / FLIER_W;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(flier, 0, 0, width, FLIER_H * k);
  const cx = SLOT.cx * k;
  const cy = SLOT.cy * k;
  // White disc and a thin blue rim echo the flier's own, at the larger size.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, SLOT.r * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b5fb0';
  ctx.lineWidth = 4 * k;
  ctx.beginPath();
  ctx.arc(cx, cy, (SLOT.r - 2) * k, 0, Math.PI * 2);
  ctx.stroke();
  if (photo) drawPhoto(ctx, cx, cy, PHOTO_R * 2 * k, photo, t);
}

export function renderInviteBlob(flier, photo, t) {
  const canvas = document.createElement('canvas');
  canvas.width = FLIER_W;
  canvas.height = FLIER_H;
  drawInvite(canvas.getContext('2d'), FLIER_W, flier, photo, t);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Invite render failed'))), 'image/jpeg', 0.92)
  );
}
