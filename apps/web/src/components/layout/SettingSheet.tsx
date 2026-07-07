"use client";

import { getUserInitials } from "../../app/utils/getUserInitials";
import { ChevronLeft } from "lucide-react";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  username: string;
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export default function SettingsSheet({
  open,
  onClose,
  username,
  isDark,
  toggleTheme,
  onLogout,
}: SettingsSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300
        ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet */}
      <aside
        className={`fixed z-50 bg-card border-border shadow-2xl transition-transform duration-300 ease-out 
            
        flex flex-col

        bottom-0 left-0 right-0
        h-[70vh]
        rounded-t-3xl
        border-t

        lg:top-0
        lg:bottom-0
        lg:right-0
        lg:left-auto
        lg:h-full
        lg:w-[340px]
        xl:w-[380px]
        lg:rounded-none
        lg:rounded-l-2xl
        lg:border-l
        lg:rounded-l-2xl

        ${
          open
            ? "translate-y-0 lg:translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full"
        }`}
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center py-3 lg:hidden">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        {/* Header */}
        {/* <div className="px-6 pb-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your preferences
          </p>
        </div> */}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="hidden sm lg:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors  hover:text-foreground cursor-pointer  "
          >
            <ChevronLeft size={20} />
          </button>
          {/* User */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center gap-3 flex-col align-middle justify-center">
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-accent/20 border border-accent/30">
                <span className="text-accent font-semibold text-2xl">
                  {getUserInitials(username)}
                </span>
              </div>

              <div className="min-w-0 text-center ">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="font-medium truncate">{username.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Appearance
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </p>

                <p className="text-xs text-muted-foreground">
                  Switch application theme
                </p>
              </div>

              <button
                title="toggle"
                onClick={toggleTheme}
                className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                  isDark ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-card transition-transform ${
                    isDark ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Future section */}
          {/* <div className="px-6 py-5 border-b border-border">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              More
            </h3>

            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted transition">
              Notifications (Coming Soon)
            </button>

            <button className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted transition">
              Keyboard Shortcuts (Coming Soon)
            </button>
          </div> */}

          {/* Footer */}
        </div>
        <div className="mt-auto p-6">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/15 cursor-pointer"
          >
            <svg
              width="15"
              height="15"
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
      </aside>
    </>
  );
}
