"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ActiveView = "kanban" | "activity" | "members";

interface ViewContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  // Initialize with 'kanban' during server-rendering fallback
  const [activeView, setActiveViewState] = useState<ActiveView>("kanban");

  // Read from localStorage safely inside useEffect once mounted on the client
  useEffect(() => {
    const savedView = localStorage.getItem("kanban_active_view");
    if (savedView) {
      setActiveViewState(savedView as ActiveView);
    }
  }, []);

  // Custom setter that updates both React state AND localStorage
  const setActiveView = (newView: ActiveView) => {
    setActiveViewState(newView);
    localStorage.setItem("kanban_active_view", newView);
  };

  return (
    <ViewContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
