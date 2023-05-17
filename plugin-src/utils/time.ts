export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function lastUpdateTracker(interval: number) {
  let lastUpdate = Date.now();
  return () => {
    let shouldUpdate = Date.now() - lastUpdate > interval;
    if (shouldUpdate) lastUpdate = Date.now();
    return shouldUpdate;
  };
}
