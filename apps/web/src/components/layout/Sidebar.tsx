// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Projects", href: "/projects", icon: "📁" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-cyan-400">ProjectFlow</h1>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-cyan-500 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom - User Info */}
      <div className="mt-auto border-t border-gray-700 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-sm font-bold">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">name</span>
            <span className="text-xs text-gray-400">name@email.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
