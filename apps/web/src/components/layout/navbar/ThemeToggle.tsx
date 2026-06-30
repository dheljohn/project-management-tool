"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const next = !isDark;

    html.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");

    setIsDark(next);
  }

  return (
    <button
      aria-label="Toggle dark mode"
      type="button"
      onClick={toggleTheme}
      className="relative w-9 h-5 rounded-full bg-muted"
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-card transition-transform ${
          isDark ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}
