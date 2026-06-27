// "use client";
// import { useState } from "react";
// import { Inbox, Calendar, SquareKanban, Logs } from "lucide-react";

// type Tab = "inbox" | "logs" | "kanban" | "switch";

// const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
//   { id: "inbox", label: "Inbox", icon: <Inbox size={15} /> },
//   { id: "kanban", label: "Board", icon: <SquareKanban size={15} /> },
//   { id: "logs", label: "Logs", icon: <Logs size={15} /> },

//   { id: "switch", label: "Switch", icon: <Logs size={15} /> },
// ];

// export default function TabNav() {
//   const [active, setActive] = useState<Tab>("kanban");

//   return (
//     <div className="flex items-center gap-1 bg-[#1a1d23] border border-[#2e3138] rounded-xl px-2 py-1.5 fixed bottom-5 left-1/2 -translate-x-1/2 z-50 ">
//       {TABS.map((tab, i) => (
//         <div key={tab.id} className="flex items-center">
//           {/* divider before Switch boards */}
//           {i === 3 && <div className="w-px h-5 bg-[#2e3138] mx-1" />}

//           <button
//             type="button"
//             onClick={() => setActive(tab.id)}
//             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative
//               ${
//                 active === tab.id
//                   ? "bg-[#1e2d4a] text-blue-400"
//                   : "text-gray-400 hover:text-gray-200 hover:bg-[#22262e]"
//               }
//             `}
//           >
//             {tab.icon}
//             {tab.label}
//             {/* active underline indicator */}
//             {active === tab.id && (
//               <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full" />
//             )}
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }// components/BoardToggle.tsx
"use client";

type ActiveView = "kanban" | "activity" | "both";

interface BoardToggleProps {
  active: ActiveView;
  onChange: (view: ActiveView) => void;
}

export default function BoardToggle({ active, onChange }: BoardToggleProps) {
  function toggle(view: "kanban" | "activity") {
    if (active === "both") {
      // turning one off — keep the other
      onChange(view === "kanban" ? "activity" : "kanban");
    } else if (active === view) {
      // trying to turn off the only active one — block it
      return;
    } else {
      // turning the other one on — both active
      onChange("both");
    }
  }

  const kanbanOn = active === "kanban" || active === "both";
  const activityOn = active === "activity" || active === "both";

  return (
    <div className="flex items-center gap-1 bg-[#1a1d23] border border-[#2e3138] rounded-xl px-2 py-1.5 fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <button
        type="button"
        onClick={() => toggle("kanban")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative
          ${
            kanbanOn
              ? "bg-[#1e2d4a] text-cyan-400"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#22262e]"
          }`}
      >
        {/* kanban icon */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <rect x="14" y="3" width="7" height="11" rx="1" />
        </svg>
        Board
        {kanbanOn && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full" />
        )}
      </button>

      <div className="w-px h-5 bg-[#2e3138] mx-1" />

      <button
        type="button"
        onClick={() => toggle("activity")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative
          ${
            activityOn
              ? "bg-[#1e2d4a] text-cyan-400"
              : "text-gray-400 hover:text-gray-200 hover:bg-[#22262e]"
          }`}
      >
        {/* activity icon */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        Activity
        {activityOn && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full" />
        )}
      </button>
    </div>
  );
}
