#!/usr/bin/env bash
# Regenerates everything the /programme page serves from one source PDF.
#
#   scripts/generate-programme-pages.sh "/path/to/programme.pdf"
#
# Writes:
#   public/programme-files/pgwt-2026-jubilee-programme.pdf   the original, untouched (Download button)
#   public/programme-files/pages/pNN-800.webp, pNN-1240.webp page images for the viewer (srcset)
#   src/components/programme/pages.json                page count and aspect ratio for the viewer
#
# Needs poppler (pdftoppm, pdfinfo) and webp (cwebp): `brew install poppler webp`.
# The programme is flattened page images (no selectable text or links), so WebP loses nothing.
set -euo pipefail

SRC="${1:?usage: generate-programme-pages.sh <programme.pdf>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/public/programme-files"
PAGES="$PUB/pages"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$PAGES" "$ROOT/src/components/programme"
rm -f "$PAGES"/*.webp

cp "$SRC" "$PUB/pgwt-2026-jubilee-programme.pdf"

COUNT="$(pdfinfo "$SRC" | awk '/^Pages:/ {print $2}')"

for W in 800 1240; do
  pdftoppm -png -scale-to-x "$W" -scale-to-y -1 "$SRC" "$TMP/w$W"
done

for F in "$TMP"/w*.png; do
  base="$(basename "$F" .png)"            # w800-01
  width="${base%%-*}"; width="${width#w}"  # 800
  n="${base##*-}"                          # 01
  cwebp -quiet -q 80 -m 6 "$F" -o "$PAGES/p$n-$width.webp"
done

# Pixel size of a 1240-wide page, so the viewer can reserve the right space before images load.
read -r PW PH < <(identify -format "%w %h\n" "$TMP/w1240-01.png")
PDF_BYTES="$(stat -f%z "$PUB/pgwt-2026-jubilee-programme.pdf" 2>/dev/null || stat -c%s "$PUB/pgwt-2026-jubilee-programme.pdf")"
printf '{ "count": %s, "width": %s, "height": %s, "widths": [800, 1240], "pdfBytes": %s }\n' "$COUNT" "$PW" "$PH" "$PDF_BYTES" \
  > "$ROOT/src/components/programme/pages.json"

echo "pages: $COUNT  (${PW}x${PH} at 1240w)"
du -sh "$PAGES" "$PUB/pgwt-2026-jubilee-programme.pdf"
