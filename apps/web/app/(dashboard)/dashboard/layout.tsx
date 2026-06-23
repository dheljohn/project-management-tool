// app/(dashboard)/layout.tsx
import RouteGuard from "../../src/components/RouteGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
          <div className="text-xl font-bold tracking-wider mb-8">
            ADMIN CORE
          </div>
          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="block bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block text-slate-400 hover:bg-slate-800 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Users
            </a>
          </nav>
        </aside>

        {/* Main Workspace Content Area */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <h1 className="text-lg font-semibold text-slate-800">Workspace</h1>
          </header>

          {/* This renders your specific page.tsx files */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
