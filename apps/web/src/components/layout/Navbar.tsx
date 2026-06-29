// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useBreadcrumbs } from "../../context/BreadcrumbContext";
// import { usePathname } from "next/navigation";

// export default function Navbar() {
//   const router = useRouter();
//   const { breadcrumbs } = useBreadcrumbs();
//   const username = localStorage.getItem("user_id");
//   const pathname = usePathname();

//   function handleLogout() {
//     localStorage.removeItem("auth_token");
//     router.push("/login");
//   }

//   return (
//     <header className="h-16 border-b border-border bg-card">
//       <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
//         {/* ── Left ── */}
//         <div className="flex items-center gap-6">
//           <Link href="/projects" className="text-lg font-semibold">
//             <span className="text-accent">Project Manage</span>
//           </Link>

//           {breadcrumbs.length > 0 && pathname !== "/projects" && (
//             <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
//               {breadcrumbs.map((crumb, index) => (
//                 <div key={index} className="flex items-center gap-2">
//                   <span>/</span>
//                   {crumb.href ? (
//                     <Link
//                       href={crumb.href}
//                       className="hover:text-foreground transition-colors"
//                     >
//                       {crumb.label}
//                     </Link>
//                   ) : (
//                     <span className="text-foreground">{crumb.label}</span>
//                   )}
//                 </div>
//               ))}
//             </nav>
//           )}
//         </div>

//         {/* ── Right ── */}
//         <div className="flex items-center gap-4">
//           <span className="text-sm text-muted-foreground">
//             Welcome, {username?.toUpperCase()}!
//           </span>

//           <button
//             onClick={handleLogout}
//             className="rounded-lg bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:opacity-90 transition-opacity"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import Image from "next/image"; // ✅ Correct

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { breadcrumbs } = useBreadcrumbs();
  const username = localStorage.getItem("user_id") ?? "User";

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Sync isDark with <html> class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    const next = !isDark;
    html.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    router.push("/login");
  }

  // Initials for avatar
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-card shrink-0">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* ── Left: Logo + Breadcrumbs ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center gap-2 select-none"
          >
            {/* Icon mark */}
            <div className="w-10 h-10 rounded-lg  flex items-center justify-center shrink-0">
              {/* <span className="text-accent-foreground text-xs font-black">
                P
              </span> */}

              <Image
                src="/proyekto.png"
                alt="Logo"
                width={30}
                height={30}
                priority
              />
            </div>
            {/* Wordmark */}
            <span className="text-foreground font-bold text-base tracking-tight">
              pro<span className="text-accent">yekto</span>
            </span>
          </Link>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && pathname !== "/projects" && (
            <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-border">/</span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* ── Right: Avatar + Settings ── */}
        <div className="flex items-center gap-3">
          {/* Username */}
          <span className="hidden md:block text-sm text-muted-foreground">
            {username.toUpperCase()}
          </span>

          {/* Avatar placeholder */}
          <div
            className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30
                          flex items-center justify-center shrink-0"
          >
            <span className="text-accent text-xs font-bold">{initials}</span>
          </div>

          {/* Settings trigger */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${
                  settingsOpen
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {/* Gear icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            {/* ── Settings Popup ── */}
            {settingsOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-card border border-border
                              rounded-xl shadow-lift z-50 overflow-hidden"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {username.toUpperCase()}
                  </p>
                </div>

                {/* Theme toggle */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    {isDark ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                      </svg>
                    )}
                    {isDark ? "Dark" : "Light"} mode
                  </div>

                  {/* Toggle switch */}
                  <button
                    type="button"
                    aria-label="Toggle dark mode"
                    onClick={toggleTheme}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200
                      ${isDark ? "bg-accent" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card
                                  shadow transition-transform duration-200
                                  ${isDark ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm
                             text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
