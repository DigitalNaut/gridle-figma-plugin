/**
 * Clamps a value between a minimum and maximum value.
 * @param value The value to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Formats a number as a percentage string.
 * @param value The value to format.
 * @returns A percentage string. For example, 0.5 becomes "50.0%".
 */
export function toPercentage(value: number) {
  const num = (value * 100).toFixed(1);
  return Number.isNaN(num) ? "0.0%" : num + "%";
}

/**
 * Formats a number as a float with a given precision.
 * @param value The value to format.
 * @param precision The number of decimal places to include.
 * @returns A float string. For example, 0.5 becomes "0.50".
 * @see https://stackoverflow.com/a/11832950/124279
 */
export function toFloat(value: number) {
  const num = Math.round(value * 100) / 100;
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Converts a string to an integer.
 * @param str The string to convert.
 * @returns A number or 0 if the string is not a number.
 */
export function toInteger(str: string) {
  const num = parseInt(str);
  return Number.isNaN(num) ? 0 : num;
}
