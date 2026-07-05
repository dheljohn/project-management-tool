let listener: ((isOffline: boolean) => void) | null = null;

export function setGlobalOfflineHandler(isOffline: boolean) {
  if (listener) {
    listener(isOffline); // Pass the message to React
  }
}

export function registerOfflineListener(
  callback: (isOffline: boolean) => void,
) {
  listener = callback;
}
