"use client";

import { useServerStatus } from "../../context/ServerStatusContext";

export function ServerOfflineOverlay() {
  const { isServerUnreachable, isClientOffline } = useServerStatus();

  if (isClientOffline) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm text-center px-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
        >
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
        <h1 className="text-lg font-semibold text-foreground">
          You're offline
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Check your internet connection. We'll reconnect automatically once
          you're back online.
        </p>
      </div>
    );
  }

  if (isServerUnreachable) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm text-center px-6">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--destructive)"
          strokeWidth="2"
        >
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
        <h1 className="text-lg font-semibold text-foreground">
          Can't reach the server
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your internet is fine, but our server isn't responding right now.
          We'll reconnect automatically or try again below.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 text-sm rounded-md bg-accent text-bg font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return null;
}
