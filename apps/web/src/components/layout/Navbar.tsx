// src/components/layout/Navbar.tsx
"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const title = pageTitles[pathname] ?? "ProjectFlow";

  function handleLogout() {
    localStorage.removeItem("auth_token");
    router.push("/login");
  }

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Page Title */}
      <h2 className="text-white font-semibold text-lg">{title}</h2>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">Welcome, name👋</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
