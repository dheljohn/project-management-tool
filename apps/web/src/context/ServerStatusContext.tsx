"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { registerOfflineListener } from "../../lib/offlineSignal";

interface ServerStatusContextValue {
  isServerUnreachable: boolean;
  isClientOffline: boolean;
  setIsServerUnreachable: (offline: boolean) => void;
}

const ServerStatusContext = createContext<ServerStatusContextValue | null>(
  null,
);

export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [isServerUnreachable, setIsServerUnreachable] = useState(false);
  const [isClientOffline, setIsClientOffline] = useState(false);

  useEffect(() => {
    registerOfflineListener(setIsServerUnreachable);
  }, []);

  useEffect(() => {
    setIsClientOffline(!navigator.onLine);

    const handleOnline = () => setIsClientOffline(false);
    const handleOffline = () => setIsClientOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ServerStatusContext.Provider
      value={{ isServerUnreachable, isClientOffline, setIsServerUnreachable }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  const ctx = useContext(ServerStatusContext);
  if (!ctx) {
    throw new Error("useServerStatus must be used within ServerStatusProvider");
  }
  return ctx;
}
