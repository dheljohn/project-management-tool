"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import Image from "next/image";
import api from "../../../lib/api";
import { ChevronLeft } from "lucide-react";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { getUserInitials } from "../../app/utils/getUserInitials";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useTheme } from "next-themes";
import SettingsSheet from "./SettingSheet";

export default function Navbar() {
  const pathname = usePathname();
  const { breadcrumbs } = useBreadcrumbs();
  const { data: currentUser } = useCurrentUser();
  const username = currentUser?.user_id ?? "User";

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const [settingsOpen, setSettingsOpen] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const isKanban = pathname.startsWith("/projects/");

  const isProjectPage = pathname === "/projects";
  const { mutate, isPending, error } = useLogout();

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
    setTheme(isDark ? "light" : "dark");
  }

  function handleLogout() {
    mutate();
  }

  return (
    <header className="h-16 border-b border-border bg-background shrink-0 shadow-sm z-20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/*  Left: Logo + Breadcrumbs  */}
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center gap-0 select-none"
          >
            {isKanban && <ChevronLeft className="block md:hidden" />}

            {isProjectPage && (
              <div className="flex items-center ">
                {/* Icon mark */}
                <div className="flex w-10 h-10 rounded-lg items-center justify-center shrink-0">
                  <Image
                    src="/proyekto.png"
                    alt="Logo"
                    width={30}
                    height={30}
                    priority
                  />
                </div>
                {/* Wordmark */}
                <span className="block text-foreground font-bold text-base tracking-tight">
                  ro<span className="text-accent">yekto</span>
                </span>
              </div>
            )}

            {isKanban && (
              <div className="flex items-center ">
                {/* Icon mark */}
                <div className="hidden md:flex w-10 h-10 rounded-lg items-center justify-center shrink-0">
                  <Image
                    src="/proyekto.png"
                    alt="Logo"
                    width={30}
                    height={30}
                    priority
                  />
                </div>
                {/* Wordmark */}
                <span className="hidden md:block text-foreground font-bold text-base tracking-tight">
                  ro<span className="text-accent">yekto</span>
                </span>
              </div>
            )}
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

        {/*  Right: Avatar + Settings  */}
        <div className="flex items-center gap-3">
          {/* <JoinProjectForm /> */}
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

            {/*  Settings Popup  */}
            <SettingsSheet
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              username={username}
              isDark={isDark}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
            />
          </div>

          <div
            className="hidden sm:flex w-8 h-8 rounded-full bg-accent/20 border border-accent/30
                            items-center justify-center shrink-0"
          >
            <span className="text-accent text-xs font-bold">
              {getUserInitials(username)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
