import Link from "next/link";
import Logo from "../../../components/layout/navbar/Logo";
import { Users } from "lucide-react";

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
          <div className="max-w-6xl mx-auto">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
              {/* Browser bar */}
              <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/40" />
                  <div className="h-3 w-3 rounded-full bg-status-progress/40" />
                  <div className="h-3 w-3 rounded-full bg-status-done/40" />
                </div>

                <div className="flex-1 rounded-md bg-muted px-3 py-1 text-center text-xs text-muted-foreground">
                  proyekto.app/projects/1
                </div>
              </div>

              {/* Board */}
              <div className="grid grid-cols-1 gap-5 bg-background p-6 md:grid-cols-3">
                {/* ================= Todo ================= */}
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="border-b border-border bg-card-muted px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-status-todo" />
                        <h3 className="text-sm font-semibold text-foreground">
                          To do
                        </h3>
                      </div>

                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        3
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {[
                      {
                        title: "Design system setup",
                        desc: "Create reusable UI components.",
                        priority: "High",
                        color: "bg-red-500/10 text-red-500",
                      },
                      {
                        title: "API integration",
                        desc: "Connect backend endpoints.",
                        priority: "Medium",
                        color: "bg-yellow-500/10 text-yellow-500",
                      },
                      {
                        title: "Write unit tests",
                        desc: "Increase code coverage.",
                        priority: "Low",
                        color: "bg-green-500/10 text-green-500",
                      },
                    ].map((task) => (
                      <div
                        key={task.title}
                        className="rounded-lg border border-l-2 border-border bg-card p-4 transition-transform duration-300 "
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1 text-sm font-medium text-foreground">
                            {task.title}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.color}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {task.desc}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex -space-x-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent ring-2 ring-card">
                              JD
                            </div>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent ring-2 ring-card">
                              AN
                            </div>
                          </div>

                          <span className="text-[10px] text-muted-foreground">
                            Jul 6
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= In Progress ================= */}
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="border-b border-border bg-card-muted px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-status-progress" />
                        <h3 className="text-sm font-semibold text-foreground">
                          In Progress
                        </h3>
                      </div>

                      <span className="rounded-full bg-status-progress/10 px-2 py-0.5 text-[10px] font-medium text-status-progress">
                        2 / 5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {[
                      {
                        title: "Implement anti-CSRF filters",
                        desc: "Secure backend request pipes for incoming team actions.",
                        priority: "High",
                        color: "bg-red-500/10 text-red-500",
                      },
                      {
                        title: "Test live websocket channels",
                        desc: "Verify that board updates broadcast across all screens instantly.",
                        priority: "Medium",
                        color: "bg-yellow-500/10 text-yellow-500",
                      },
                    ].map((task) => (
                      <div
                        key={task.title}
                        className="rounded-lg border border-l-2 border-border bg-card p-4 transition-transform duration-300 "
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex-1 text-sm font-medium text-foreground">
                            {task.title}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.color}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {task.desc}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex -space-x-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent ring-2 ring-card">
                              CO
                            </div>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent ring-2 ring-card">
                              DE
                            </div>
                          </div>

                          <span className="text-[10px] text-muted-foreground">
                            Jul 6
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= Done ================= */}
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  <div className="border-b border-border bg-card-muted px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-status-done" />
                        <h3 className="text-sm font-semibold text-foreground">
                          Done
                        </h3>
                      </div>

                      <span className="rounded-full bg-status-done/10 px-2 py-0.5 text-[10px] font-medium text-status-done">
                        2
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {[
                      {
                        title: "Database Schema",
                        desc: "Create a database schema for the application.",
                        priority: "High",
                        color: "bg-red-500/10 text-red-500",
                      },
                      {
                        title: "Login Page",
                        desc: "Create a login page for the application.",
                        priority: "Medium",
                        color: "bg-yellow-500/10 text-yellow-500",
                      },
                    ].map((task) => (
                      <div
                        key={task.title}
                        className="rounded-lg border border-l-2 border-border bg-card p-4 transition-transform duration-300  "
                      >
                        <div className="flex items-start justify-between gap-2 ">
                          <p className="flex-1 text-sm font-medium text-foreground line-through ">
                            {task.title}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.color}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground line-through">
                          {task.desc}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex -space-x-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent ring-2 ring-card">
                              SD
                            </div>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent ring-2 ring-card">
                              ML
                            </div>
                          </div>

                          <span className="text-[10px] text-muted-foreground">
                            Jul 4
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  desc: "Login details are hidden in tamper-proof cookies with anti-hijack CSRF protection, completely blocked from malicious scripts by secure NestJS walls.",
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
                    <Users
                      size={20}
                      strokeWidth={1.5}
                      className="text-accent"
                    />
                  ),
                  title: "Real-time collaboration",
                  desc: "Work seamlessly with multiple team members simultaneously. updates and logs sync automatically.",
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
