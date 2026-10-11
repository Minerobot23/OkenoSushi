#!/usr/bin/env bash
# Encodes the rendered frames into the files the page serves (playbook phase 6), then checks them.
#   bash media/storefront-film/encode.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
out=public/film
mkdir -p "$out"
for v in tall wide; do
  frames="media/storefront-film/renders-$v/final"
  last=$(ls "$frames" | sort | tail -1)
  ffmpeg -v error -y -framerate 24 -start_number 1 -i "$frames/frame_%04d.png" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an "$out/arrival-$v.mp4"
  ffmpeg -v error -y -framerate 24 -start_number 1 -i "$frames/frame_%04d.png" \
    -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 -pix_fmt yuv420p -an "$out/arrival-$v.webm"
  ffmpeg -v error -y -i "$frames/frame_0001.png" -q:v 4 "$out/arrival-$v-poster.jpg"
  ffmpeg -v error -y -i "$frames/$last" -c:v libwebp -quality 86 "$out/arrival-$v-end.webp"
  for f in "$out/arrival-$v.mp4" "$out/arrival-$v.webm"; do
    ffprobe -v error -select_streams v:0 -count_frames \
      -show_entries stream=codec_name,pix_fmt,width,height,nb_read_frames:format=duration,size -of compact "$f"
  done
done
