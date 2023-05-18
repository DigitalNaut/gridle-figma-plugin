/**
 * Returns a promise that resolves after the given number of milliseconds.
 * @param ms The number of milliseconds to wait.
 * @returns A promise that resolves after the given number of milliseconds.
 */

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns a function that returns true if the interval has passed since the last time the function was called.
 * @param interval The interval in milliseconds.
 * @returns A function that returns true if the interval has passed since the last time the function was called.
 */
export function lastUpdateTracker(interval: number) {
  let lastUpdate = Date.now();
  return () => {
    let shouldUpdate = Date.now() - lastUpdate > interval;
    if (shouldUpdate) lastUpdate = Date.now();
    return shouldUpdate;
  };
}
