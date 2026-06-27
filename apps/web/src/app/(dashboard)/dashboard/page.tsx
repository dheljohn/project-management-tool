import Sidebar from "../../../components/layout/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Placeholder */}
      {/* <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
          <div className="text-xl font-bold tracking-wider mb-8">
            ADMIN CORE
          </div>
          <nav className="space-y-2">
            <a
              href="#"
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
            <a
              href="#"
              className="block text-slate-400 hover:bg-slate-800 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Settings
            </a>
          </nav>
        </aside> */}
      <Sidebar />
      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar Placeholder */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-800">
            System Overview
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full">
              Database Connected
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
              AD
            </div>
          </div>
        </header>

        {/* Core Metrics Grid */}
        <main className="p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total System Users
              </p>
              <p className="text-3xl font-bold mt-2">1,248</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                ↑ 12% increase this week
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                API Requests (24h)
              </p>
              <p className="text-3xl font-bold mt-2">48,920</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                ↑ 4.3% load growth
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Server Health Status
              </p>
              <p className="text-3xl font-bold mt-2 text-emerald-600">99.9%</p>
              <p className="text-xs text-slate-400 mt-1">
                All microservices operational
              </p>
            </div>
          </div>

          {/* Content Table / Log Section Placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">
                Recent Operational Events
              </h3>
            </div>
            <div className="p-6">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Event Type</th>
                      <th className="p-4">Origin Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-4 font-mono text-xs">
                        2026-06-23 23:14:02
                      </td>
                      <td className="p-4">
                        Database Bootstrap Migration Success
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          OK
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-xs">
                        2026-06-23 22:45:19
                      </td>
                      <td className="p-4">
                        Root Admin Account Created Automatically
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          SYSTEM
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
