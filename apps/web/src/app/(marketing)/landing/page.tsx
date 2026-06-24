// app/(marketing)/landing/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 flex flex-col">
      {/* Global Marketing Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <div className="text-xl font-extrabold tracking-tight text-blue-600">
          COREAPP
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Showcase */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 text-center py-20">
        {/* Release Status Tag */}
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-6 border border-blue-200">
          v1.0 Production Launch
        </span>

        {/* Catchy Hook */}
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Manage your system architecture{" "}
          <span className="text-blue-600">effortlessly.</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
          The ultimate control panel with automatic admin bootstrapping, secure
          token route guards, and lightning-fast analytics insights.
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
          <Link
            href="/register"
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-4 rounded-xl shadow-md transition text-center"
          >
            Create Your Account
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-slate-50 text-slate-800 font-medium px-8 py-4 rounded-xl border border-slate-200 shadow-sm transition text-center"
          >
            Access Dashboard
          </Link>
        </div>

        {/* Dummy Feature Previews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left border-t border-slate-200 pt-16">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">
              ⚡ Automatic Bootstrap
            </h3>
            <p className="text-sm text-slate-500">
              First registration safely gains administrative permissions
              instantly.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">
              🔒 Secure Framework
            </h3>
            <p className="text-sm text-slate-500">
              Built using Next.js App Router layout protections and NestJS
              AuthGuards.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">📊 Analytics Core</h3>
            <p className="text-sm text-slate-500">
              Beautiful dashboard layouts tracking system states out of the box.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        © 2026 CoreApp Systems. All rights reserved.
      </footer>
    </div>
  );
}
