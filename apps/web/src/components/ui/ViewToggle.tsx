import { useView } from "../../context/ViewContext";

export default function ViewToggle({}: {}) {
  const { activeView, setActiveView } = useView();

  const tabs = [
    {
      id: "kanban" as const,
      label: "Kanban",
    },
    {
      id: "activity" as const,
      label: "Activity",
    },
  ];
  return (
    <div role="tablist" className="relative flex gap-1">
      {tabs.map((t) => {
        const active = activeView === t.id;
        return (
          <button
            type="button"
            title="Switch view"
            key={t.id}
            role="tab"
            // aria-selected={active}
            onClick={() => setActiveView(t.id)}
            className={[
              "relative px-4 py-3 text-sm transition",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <span className="flex items-center gap-2">
              {t.label}
              {/* <span
                className={[
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] transition",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {t.count}
              </span> */}
            </span>
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
