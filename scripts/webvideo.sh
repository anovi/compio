#!/usr/bin/env bash
#
# webvideo.sh — compress a master export (e.g. ProRes from DaVinci Resolve) for the web.
#
# Produces, next to the input file (or in -o DIR):
#   <name>-<height>.mp4    H.264 + AAC, faststart (always)
#   <name>-<height>.webm   AV1 + Opus            (with -a)
#
# Usage:
#   webvideo.sh [options] input.mov [more inputs...]
#
# Options:
#   -r HEIGHT   output height in px, e.g. 1080, 720 (default: 1080; 0 = keep original)
#   -q CRF      H.264 quality, lower = better/bigger (default: 23, sensible 18–28)
#   -Q CRF      AV1 quality (default: 35, sensible 30–40)
#   -a          also make an AV1 .webm
#   -m          mute: drop audio (background / hero videos)
#   -s PRESET   x264 preset (default: slow; veryslow = smaller, slower)
#   -o DIR      output directory (default: same folder as input)
#   -f          overwrite existing outputs
#   -h          show this help
#
# Examples:
#   webvideo.sh master.mov
#   webvideo.sh -a -r 720 master.mov
#   webvideo.sh -m -q 26 -a hero-loop.mov
#   webvideo.sh -o ~/Desktop/web *.mov

set -euo pipefail

HEIGHT=1080
CRF_H264=23
CRF_AV1=35
MAKE_AV1=0
MUTE=0
PRESET=slow
OUT_DIR=""
OVERWRITE="-n"

usage() { sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }
die()   { echo "Error: $*" >&2; exit 1; }

while getopts ":r:q:Q:ams:o:fh" opt; do
  case "$opt" in
    r) HEIGHT="$OPTARG" ;;
    q) CRF_H264="$OPTARG" ;;
    Q) CRF_AV1="$OPTARG" ;;
    a) MAKE_AV1=1 ;;
    m) MUTE=1 ;;
    s) PRESET="$OPTARG" ;;
    o) OUT_DIR="$OPTARG" ;;
    f) OVERWRITE="-y" ;;
    h) usage 0 ;;
    :) die "option -$OPTARG needs a value" ;;
    \?) die "unknown option -$OPTARG (use -h for help)" ;;
  esac
done
shift $((OPTIND - 1))

[ $# -ge 1 ] || usage 1
# Prefer Homebrew's ffmpeg-full (has AV1/libsvtav1); it is keg-only, so not on PATH.
FFMPEG=""
for c in /opt/homebrew/opt/ffmpeg-full/bin/ffmpeg /usr/local/opt/ffmpeg-full/bin/ffmpeg; do
  if [ -x "$c" ]; then FFMPEG="$c"; break; fi
done
if [ -z "$FFMPEG" ]; then FFMPEG="$(command -v ffmpeg || true)"; fi
[ -n "$FFMPEG" ] || die "ffmpeg not found. Install it with: brew install ffmpeg-full"

for v in "$HEIGHT" "$CRF_H264" "$CRF_AV1"; do
  case "$v" in ''|*[!0-9]*) die "-r, -q and -Q must be whole numbers (got '$v')" ;; esac
done

if [ "$MAKE_AV1" -eq 1 ] && ! "$FFMPEG" -hide_banner -encoders 2>/dev/null | grep -q libsvtav1; then
  die "your ffmpeg has no libsvtav1 (AV1). Install it with: brew install ffmpeg-full — or run without -a"
fi

if [ -n "$OUT_DIR" ]; then mkdir -p "$OUT_DIR"; fi

# Scale filter: keep aspect ratio, even width; never upscale.
if [ "$HEIGHT" -eq 0 ]; then
  VF="scale=trunc(iw/2)*2:trunc(ih/2)*2"
  SUFFIX="web"
else
  VF="scale=-2:'min($HEIGHT,ih)'"
  SUFFIX="$HEIGHT"
fi

COLOR=(-color_primaries bt709 -color_trc bt709 -colorspace bt709)

human_size() {
  local bytes
  bytes=$(stat -f%z "$1" 2>/dev/null || stat -c%s "$1")
  awk -v b="$bytes" 'BEGIN { split("B KB MB GB",u); i=1; while (b>=1024 && i<4) { b/=1024; i++ } printf "%.1f %s", b, u[i] }'
}

for IN in "$@"; do
  [ -f "$IN" ] || { echo "Skipping '$IN' (not a file)" >&2; continue; }

  dir="${OUT_DIR:-$(dirname "$IN")}"
  base="$(basename "$IN")"
  name="${base%.*}"

  echo "▶ $base"

  # ---- H.264 MP4 ----
  MP4="$dir/$name-$SUFFIX.mp4"
  if [ "$MUTE" -eq 1 ]; then AUDIO=(-an); else AUDIO=(-c:a aac -b:a 128k); fi
  "$FFMPEG" -hide_banner -loglevel warning -stats $OVERWRITE -i "$IN" \
    -c:v libx264 -preset "$PRESET" -crf "$CRF_H264" \
    -profile:v high -pix_fmt yuv420p \
    -vf "$VF" "${COLOR[@]}" \
    "${AUDIO[@]}" \
    -movflags +faststart \
    "$MP4"
  echo "  ✓ $(basename "$MP4")  ($(human_size "$MP4"))"

  # ---- AV1 WebM ----
  if [ "$MAKE_AV1" -eq 1 ]; then
    WEBM="$dir/$name-$SUFFIX.webm"
    if [ "$MUTE" -eq 1 ]; then AUDIO=(-an); else AUDIO=(-c:a libopus -b:a 96k); fi
    "$FFMPEG" -hide_banner -loglevel warning -stats $OVERWRITE -i "$IN" \
      -c:v libsvtav1 -preset 6 -crf "$CRF_AV1" -g 240 \
      -pix_fmt yuv420p \
      -vf "$VF" "${COLOR[@]}" \
      "${AUDIO[@]}" \
      "$WEBM"
    echo "  ✓ $(basename "$WEBM")  ($(human_size "$WEBM"))"
  fi

  echo "  source: $(human_size "$IN")"
done