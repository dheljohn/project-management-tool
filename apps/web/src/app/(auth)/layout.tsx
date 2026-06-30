import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background flex overflow-hidden">
      {/*  Left: Abstract Art  */}

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-card border-l border-border">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-background to-accent/10" />

        {/* Abstract SVG art */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 900"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Ambient rings  */}
          <circle
            cx="400"
            cy="450"
            r="300"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <circle
            cx="400"
            cy="450"
            r="220"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.5"
            opacity="0.15"
          />
          <circle
            cx="400"
            cy="450"
            r="140"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.5"
            opacity="0.1"
          />

          {/* Diagonal grid texture */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`d${i}`}
              x1={-100 + i * 90}
              y1="0"
              x2={-100 + i * 90 + 400}
              y2="900"
              stroke="var(--accent)"
              strokeWidth="0.4"
              opacity="0.05"
            />
          ))}

          {/*  Three kanban lanes, drifting at gentle angles  */}
          {/* Lane 1 — To do */}
          <g transform="rotate(-4 220 360)" opacity="0.9">
            <rect
              x="120"
              y="190"
              width="200"
              height="340"
              rx="14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.8"
              opacity="0.22"
            />
            <rect
              x="140"
              y="216"
              width="160"
              height="46"
              rx="8"
              fill="var(--accent)"
              opacity="0.06"
              stroke="var(--accent)"
              strokeWidth="0.6"
            />
            <rect
              x="140"
              y="272"
              width="160"
              height="64"
              rx="8"
              fill="var(--accent)"
              opacity="0.04"
              stroke="var(--accent)"
              strokeWidth="0.6"
            />
            <rect
              x="140"
              y="346"
              width="160"
              height="40"
              rx="8"
              fill="var(--accent)"
              opacity="0.06"
              stroke="var(--accent)"
              strokeWidth="0.6"
            />
            <circle
              cx="156"
              cy="239"
              r="3"
              fill="var(--accent)"
              opacity="0.5"
            />
            <circle
              cx="156"
              cy="304"
              r="3"
              fill="var(--accent)"
              opacity="0.4"
            />
          </g>

          {/* Lane 2 — In progress (slightly raised, focal) */}
          <g transform="rotate(2 460 320)" opacity="0.95">
            <rect
              x="360"
              y="140"
              width="200"
              height="340"
              rx="14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1"
              opacity="0.3"
            />
            <rect
              x="380"
              y="168"
              width="160"
              height="56"
              rx="8"
              fill="var(--accent)"
              opacity="0.08"
              stroke="var(--accent)"
              strokeWidth="0.7"
            />
            <rect
              x="380"
              y="234"
              width="160"
              height="40"
              rx="8"
              fill="var(--accent)"
              opacity="0.05"
              stroke="var(--accent)"
              strokeWidth="0.6"
            />
            <rect
              x="380"
              y="284"
              width="160"
              height="60"
              rx="8"
              fill="var(--accent)"
              opacity="0.07"
              stroke="var(--accent)"
              strokeWidth="0.7"
            />
            {/* progress bar on the focal card */}
            <rect
              x="396"
              y="300"
              width="128"
              height="5"
              rx="2.5"
              fill="var(--accent)"
              opacity="0.15"
            />
            <rect
              x="396"
              y="300"
              width="78"
              height="5"
              rx="2.5"
              fill="var(--accent)"
              opacity="0.55"
            />
            <circle
              cx="396"
              cy="191"
              r="3.5"
              fill="var(--accent)"
              opacity="0.6"
            />
          </g>

          {/* Lane 3 — Done */}
          <g transform="rotate(-3 660 420)" opacity="0.85">
            <rect
              x="580"
              y="240"
              width="180"
              height="300"
              rx="14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.7"
              opacity="0.18"
            />
            <rect
              x="598"
              y="264"
              width="144"
              height="44"
              rx="8"
              fill="var(--accent)"
              opacity="0.05"
              stroke="var(--accent)"
              strokeWidth="0.5"
            />
            <rect
              x="598"
              y="318"
              width="144"
              height="44"
              rx="8"
              fill="var(--accent)"
              opacity="0.05"
              stroke="var(--accent)"
              strokeWidth="0.5"
            />
            {/* checkmarks for done cards */}
            <path
              d="M610 286 l6 6 l12 -12"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M610 340 l6 6 l12 -12"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>

          {/*  Flow arcs connecting the lanes (task movement)  */}
          <path
            d="M320 300 Q 350 260 360 250"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.8"
            opacity="0.18"
          />
          <path
            d="M560 300 Q 575 320 598 320"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.8"
            opacity="0.16"
          />

          {/*  Clock motif — time management, lower-left  */}
          <g transform="translate(190 660)" opacity="0.9">
            <circle
              r="58"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.8"
              opacity="0.22"
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = Math.sin(angle) * 50;
              const y1 = -Math.cos(angle) * 50;
              const x2 = Math.sin(angle) * 56;
              const y2 = -Math.cos(angle) * 56;
              return (
                <line
                  key={`tick${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--accent)"
                  strokeWidth="0.6"
                  opacity={i % 3 === 0 ? 0.35 : 0.15}
                />
              );
            })}
            {/* clock hands */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-32"
              stroke="var(--accent)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <line
              x1="0"
              y1="0"
              x2="22"
              y2="14"
              stroke="var(--accent)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.4"
            />
            <circle r="3" fill="var(--accent)" opacity="0.6" />
          </g>

          {/* Orbiting progress dot around the clock (time passing) */}
          <circle
            cx="190"
            cy="600"
            r="2.5"
            fill="var(--accent)"
            opacity="0.45"
          />

          {/*  Small floating triangles + squares for rhythm (from original)  */}
          <rect
            x="650"
            y="600"
            width="36"
            height="36"
            rx="8"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            opacity="0.15"
            transform="rotate(20 668 618)"
          />
          <polygon
            points="540,640 568,690 512,690"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            opacity="0.14"
          />

          {/* Accent focal dots */}
          <circle cx="400" cy="450" r="4" fill="var(--accent)" opacity="0.55" />
          <circle
            cx="400"
            cy="450"
            r="12"
            fill="var(--accent)"
            opacity="0.07"
          />
          <circle
            cx="460"
            cy="200"
            r="2.5"
            fill="var(--accent)"
            opacity="0.4"
          />
          <circle cx="700" cy="280" r="2" fill="var(--accent)" opacity="0.3" />
          <circle cx="130" cy="560" r="2" fill="var(--accent)" opacity="0.3" />

          {/* Wide background arcs for depth (kept from original) */}
          <path
            d="M 100 500 Q 400 200 700 500"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.6"
            opacity="0.08"
          />
          <path
            d="M 100 500 Q 400 800 700 500"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.6"
            opacity="0.08"
          />
        </svg>

        {/*  Branding overlay  */}
        <div className="absolute bottom-10 left-10 right-10">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/" className="flex items-center gap-2 select-none">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <Image
                  src="/proyekto.png"
                  alt="Logo"
                  width={30}
                  height={30}
                  priority
                />
              </div>
              <span className="text-foreground font-bold text-base tracking-tight">
                pro<span className="text-accent">yekto</span>
              </span>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Manage projects, track progress, and collaborate all in one place.
          </p>
        </div>
      </div>
      {/*  Right: Login/Reg  */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-12 lg:max-w-md xl:max-w-lg">
        {/* Background blobs for left side */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
