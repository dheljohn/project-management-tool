import Link from "next/link";
import Logo from "../../../components/layout/navbar/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/*  Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden px-6 pt-24 pb-20"
          id="#top"
        >
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent/8 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6 border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Now in v1.0
            </span>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight text-foreground mb-6">
              Ship projects
              <br />
              <span className="text-accent">without the chaos.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Proyekto is a Kanban-style project management tool built for teams
              that want clarity, drag tasks, track progress, and ship faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 bg-accent hover:opacity-90 text-accent-foreground font-semibold px-8 py-3.5 rounded-xl transition-opacity"
              >
                Start for free
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 border border-border text-foreground font-medium px-8 py-3.5 rounded-xl hover:bg-muted transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Kanban Preview */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lift">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/40" />
                  <div className="w-3 h-3 rounded-full bg-status-progress/40" />
                  <div className="w-3 h-3 rounded-full bg-status-done/40" />
                </div>
                <div className="flex-1 mx-4 bg-muted rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                  proyekto.app/projects/1
                </div>
              </div>

              {/* Mock Kanban board */}
              <div className="p-6 grid grid-cols-3 gap-4 bg-background min-h-64">
                {/* Todo column */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      To do
                    </span>
                  </div>
                  {[
                    "Design system setup",
                    "API integration",
                    "Write unit tests",
                  ].map((t) => (
                    <div
                      key={t}
                      className="bg-card border border-border rounded-lg p-3"
                    >
                      <p className="text-xs font-medium text-foreground">{t}</p>
                      <div className="mt-2 h-1 w-1/3 rounded-full bg-muted" />
                    </div>
                  ))}
                </div>

                {/* In Progress column */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      In Progress
                    </span>
                  </div>
                  {["Build Kanban board", "Auth with httpOnly"].map((t) => (
                    <div
                      key={t}
                      className="bg-card border border-border rounded-lg p-3"
                    >
                      <p className="text-xs font-medium text-foreground">{t}</p>
                      <div className="mt-2 h-1 w-2/3 rounded-full bg-status-progress/30">
                        <div className="h-full w-1/2 rounded-full bg-status-progress" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Done column */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      Done
                    </span>
                  </div>
                  {[
                    "Project scaffold",
                    "Database schema",
                    "Login page",
                    "Route guards",
                  ].map((t) => (
                    <div
                      key={t}
                      className="bg-card border border-border rounded-lg p-3 opacity-70"
                    >
                      <p className="text-xs font-medium text-foreground line-through">
                        {t}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  Features  */}
        <section className="px-6 py-20 border-t border-border " id="features">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
                Features
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                Everything your team needs
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                Built with the tools developers actually use, no bloat, no
                lock-in.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="7" height="18" rx="1" />
                      <rect x="14" y="3" width="7" height="11" rx="1" />
                    </svg>
                  ),
                  title: "Kanban board",
                  desc: "Drag and drop tasks across Todo, In Progress, and Done columns with real-time optimistic updates.",
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  ),
                  title: "Activity log",
                  desc: "Every task move, rename, and update is automatically logged with timestamps and user attribution.",
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  ),
                  title: "Secure by default",
                  desc: "JWT stored in httpOnly cookies — never exposed to JavaScript. NestJS guards protect every endpoint.",
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  ),
                  title: "Progress tracking",
                  desc: "Segmented progress bars per project show Todo, In Progress, and Done at a glance.",
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M15 3h6v6" />
                      <path d="M10 14L21 3" />
                    </svg>
                  ),
                  title: "Split panel view",
                  desc: "Toggle between Kanban only, Activity Log only, or a split view — preference saved automatically.",
                },
                {
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  ),
                  title: "Multi-project workspace",
                  desc: "Manage multiple projects from one workspace with per-project task counts and completion stats.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-card border border-border rounded-xl p-5 hover:border-accent transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  CTA Banner  */}
        <section className="px-6 py-20" id="cta">
          <div className="max-w-2xl mx-auto text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get organized?
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your workspace in seconds. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent hover:opacity-90 text-accent-foreground font-semibold px-8 py-3.5 rounded-xl transition-opacity"
            >
              Create your account
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/*  Footer  */}
      <footer className="border-t border-border py-2 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />

          <p className="text-xs text-muted-foreground">
            © 2026 Proyekto. Built with Next.js + NestJS.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="#top"
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>

            <Link
              href="#cta"
              className="hover:text-foreground transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
