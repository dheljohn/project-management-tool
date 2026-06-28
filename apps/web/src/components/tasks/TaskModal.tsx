// "use client";

// import { useState, useEffect } from "react";
// import api from "../../../lib/api";
// import { TaskStatus, Task } from "../../types/types";

// interface TaskModalProps {
//   task?: Task; // Optional: if provided, modal switches to "Update" mode
//   projectId: number;
//   onClose: () => void;
//   onSuccess: (task: Task) => void;
// }

// export default function TaskModal({
//   task,
//   projectId,
//   onClose,
//   onSuccess,
// }: TaskModalProps) {
//   // 1. Check if we are updating by seeing if a task was passed in
//   const isUpdateMode = !!task;
//   const userId = localStorage.getItem("user_id");

//   // 2. Pre-fill state values if we are editing an existing task
//   const [name, setName] = useState(task?.name || "");
//   const [contents, setContents] = useState(task?.contents || "");
//   const [status, setStatus] = useState<"Todo" | "In_Progress" | "Done">(
//     task?.status || "Todo",
//   );
//   const [remark, setRemark] = useState(""); // Added remark for change-logging
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // 3. Sync fields if the passed 'task' changes while the modal is open
//   useEffect(() => {
//     if (task) {
//       setName(task.name || "");
//       setContents(task.contents || "");
//       setStatus(task.status || "Todo");
//     }
//   }, [task]);

//   async function handleSubmit() {
//     console.log("userId being sent:", userId);
//     if (!name.trim()) {
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       let res;

//       // 4. Dynamically switch between Create and Update APIs
//       if (isUpdateMode) {
//         res = await api.put("/test03/patch_task", {
//           id: task.id,
//           task_id: task.id,
//           user_id: userId,
//           name,
//           contents,
//           status,
//           remark: remark || "Updated via UI modal",
//         });
//       } else {
//         res = await api.post("/test03/create_task", {
//           project_id: projectId,
//           user_id: userId,
//           name,
//           contents,
//           status,
//           remark: remark || "Created via UI modal",
//         });
//       }
//       console.log(res);

//       console.log(res.data);
//       onSuccess(res.data); // This sends the fresh data back to trigger useEffect refetch!
//       onClose();
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
//       onClick={onClose}
//     >
//       <div
//         className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Dynamic Header text */}
//         <h2 className="text-white text-lg font-semibold mb-5">
//           {isUpdateMode ? "Edit Task" : "Create Task"}
//         </h2>

//         <label className="text-gray-400 text-xs block mb-1">Task Title</label>
//         <input
//           type="text"
//           placeholder="Task Title"
//           className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 w-full text-white"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <label className="text-gray-400 text-xs block mb-1">
//           Task Description
//         </label>
//         <textarea
//           placeholder="Task Description"
//           className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 w-full text-white"
//           value={contents}
//           onChange={(e) => setContents(e.target.value)}
//         />

//         {/* Dynamic Status Dropdown (Only shows or becomes active when updating/managing statuses) */}
//         {/* <label className="text-gray-400 text-xs block mb-1">Status</label>
//         <select
//           title="status"
//           className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 w-full text-white appearance-none"
//           value={status}
//           onChange={(e) => setStatus(e.target.value as any)}
//         >
//           <option value="Todo">Todo</option>
//           <option value="In Progress">In Progress</option>
//           <option value="Done">Done</option>
//         </select> */}

//         {/* Remark input field so the backend changelog logs the reason */}
//         {/* <label className="text-gray-400 text-xs block mb-1">
//           Change Remark / Note
//         </label>
//         <input
//           type="text"
//           placeholder="Why are you making this change?"
//           className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 w-full text-white"
//           value={remark}
//           onChange={(e) => setRemark(e.target.value)}
//         /> */}

//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         <div className="flex justify-end">
//           <button
//             className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md mr-2"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading
//               ? "Loading..."
//               : isUpdateMode
//                 ? "Save Changes"
//                 : "Create Task"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { TaskStatus, Task } from "../../types/types";

interface TaskModalProps {
  task?: Task;
  projectId: number;
  onClose: () => void;
  onSuccess: (task: Task) => void;
}

export default function TaskModal({
  task,
  projectId,
  onClose,
  onSuccess,
}: TaskModalProps) {
  const isUpdateMode = !!task;
  const userId = localStorage.getItem("user_id");

  const [name, setName] = useState(task?.name || "");
  const [contents, setContents] = useState(task?.contents || "");
  const [status, setStatus] = useState<"Todo" | "In_Progress" | "Done">(
    task?.status || "Todo",
  );
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setName(task.name || "");
      setContents(task.contents || "");
      setStatus(task.status || "Todo");
    }
  }, [task]);

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isUpdateMode) {
        res = await api.put("/test03/patch_task", {
          id: task.id,
          task_id: task.id,
          user_id: userId,
          name,
          contents,
          status,
          remark: remark || "Updated via UI modal",
        });
      } else {
        res = await api.post("/test03/create_task", {
          project_id: projectId,
          user_id: userId,
          name,
          contents,
          status,
          remark: remark || "Created via UI modal",
        });
      }
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "bg-muted border border-border rounded-md px-4 py-2 w-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <h2 className="text-foreground text-lg font-semibold mb-5">
          {isUpdateMode ? "Edit Task" : "Create Task"}
        </h2>

        {/* ── Title ── */}
        <label className="text-muted-foreground text-xs block mb-1">
          Task Title
        </label>
        <input
          type="text"
          placeholder="Task Title"
          className={`${inputClass} mb-4`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* ── Description ── */}
        <label className="text-muted-foreground text-xs block mb-1">
          Task Description
        </label>
        <textarea
          placeholder="Task Description"
          className={`${inputClass} mb-4 resize-none`}
          rows={3}
          value={contents}
          onChange={(e) => setContents(e.target.value)}
        />

        {/* ── Error ── */}
        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2">
          <button
            className="bg-muted hover:bg-muted/70 text-foreground px-4 py-2 rounded-md text-sm transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-accent hover:opacity-90 text-accent-foreground px-4 py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : isUpdateMode
                ? "Save Changes"
                : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
