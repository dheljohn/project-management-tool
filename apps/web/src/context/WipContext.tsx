"use client";

import { createContext, useContext, useState } from "react";

interface WipContextValue {
  wipLimit: number | null;
  setWipLimit: (limit: number | null) => void;
}

const WipContext = createContext<WipContextValue>({
  wipLimit: null,
  setWipLimit: () => {},
});

export function WipProvider({ children }: { children: React.ReactNode }) {
  const [wipLimit, setWipLimit] = useState<number | null>(null);
  return (
    <WipContext.Provider value={{ wipLimit, setWipLimit }}>
      {children}
    </WipContext.Provider>
  );
}

export const useWip = () => useContext(WipContext);
