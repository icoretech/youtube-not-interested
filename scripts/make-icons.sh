#!/usr/bin/env bash
# Builds every icon size from the master logo in assets/brand/logo-source.png.
# Requires ImageMagick 7 (`magick`).
set -euo pipefail
cd "$(dirname "$0")/.."

src=assets/brand/logo-source.png
out=assets/icons
mkdir -p "$out"

# Tight master: crop to the visible tile (alpha > 5%; the margin has faint
# near-transparent pixels that a plain -trim would keep).
bbox=$(magick "$src" -alpha extract -threshold 5% -format "%@" info:)
magick "$src" -crop "$bbox" +repage -background none -gravity center \
  -extent "%[fx:max(w,h)]x%[fx:max(w,h)]" assets/brand/logo-trimmed.png

# size:artwork. Chrome Web Store wants the 128 icon as 96px art + 16px padding;
# small toolbar sizes use almost the full canvas so they stay legible.
for spec in 16:16 32:30 48:44 128:96; do
  size=${spec%%:*}
  art=${spec##*:}
  magick assets/brand/logo-trimmed.png -filter Lanczos -resize "${art}x${art}" \
    -background none -gravity center -extent "${size}x${size}" \
    -strip "PNG32:$out/icon-$size.png"
done
printf 'Created %s\n' "$out"/icon-*.png
