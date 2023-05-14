/**
 * Convert a hex color to an RGB object.
 * The hex color must be in the format #RRGGBB.
 * @param hex
 * @returns An RGB object.
 */
export function hexToRGB(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  return { r, g, b };
}
