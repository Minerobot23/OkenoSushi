export type FocalPoint = { x: number; y: number };

/**
 * The box an image of aspect `ratio` occupies when it fills a `viewW` x `viewH` frame like
 * object-fit: cover, centred on `focus` (fractions). Hotspots are placed in fractions of this box,
 * so they stay on their objects at any frame shape. (Cinematic Demo Playbook, phase 7.)
 */
export function coverBox(viewW: number, viewH: number, ratio: number, focus: FocalPoint = { x: 0.5, y: 0.5 }) {
  const width = viewW / viewH > ratio ? viewW : viewH * ratio;
  const height = width / ratio;
  const clamp = (value: number, min: number) => Math.min(0, Math.max(min, value));
  return {
    width,
    height,
    left: clamp(viewW / 2 - focus.x * width, viewW - width),
    top: clamp(viewH / 2 - focus.y * height, viewH - height),
  };
}
