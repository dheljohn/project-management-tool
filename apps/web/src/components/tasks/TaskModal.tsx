// "use client";

// import { useState, useEffect } from "react";
// import api from "../../../lib/api";
// import { TaskStatus, Task } from "../../types/types";
// import { Button } from "../ui/Button";

// interface TaskModalProps {
//   mode: "create" | "update";
//   task?: Task;
//   projectId: number;
//   onClose: () => void;
//   onSuccess: (task: Task) => void;
//   refreshBoard: () => Promise<void>;
// }

// export default function TaskModal({
//   mode,
//   task,
//   projectId,
//   onClose,
//   // onSuccess,
//   refreshBoard,
// }: TaskModalProps) {
//   const userId = localStorage.getItem("user_id");

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [status, setStatus] = useState<TaskStatus>(task?.status || "Todo");
//   const [remark, setRemark] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   function toApiStatus(status: TaskStatus) {
//     switch (status) {
//       case "In_Progress":
//         return "In Progress";
//       default:
//         return status;
//     }
//   }

//   useEffect(() => {
//     if (mode === "update" && task) {
//       setTitle(task.title);
//       setDescription(task.description ?? "");
//       setStatus(task.status);
//     } else {
//       setTitle("");
//       setDescription("");
//       setStatus("Todo");
//     }

//     setRemark("");
//   }, [mode, task]);

//   async function handleSubmit() {
//     if (!title.trim()) return;
//     setLoading(true);
//     setError(null);
//     try {
//       // let res;

//       if (mode === "update") {
//         await api.patch("/test03/patch_task", {
//           id: task?.id,
//           task_id: task?.id,
//           user_id: userId,
//           title,
//           description,
//           status: toApiStatus(status),
//           remark: remark || "Updated via UI modal",
//         });
//       } else {
//         await api.post("/test03/create_task", {
//           project_id: projectId,
//           user_id: userId,
//           title,
//           description,
//           status,
//           remark: remark || "Created via UI modal",
//         });
//       }
//       // console.log("RESDATA", res.data);
//       // console.log("RES", res);
//       // onSuccess(res.data);
//       await refreshBoard();
//       onClose();
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const inputClass =
//     "bg-muted border border-border rounded-md px-4 py-2 w-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

//   return (
//     <div
//       className="fixed inset-0 z-100 flex items-center justify-center bg-black/60"
//       onClick={onClose}
//     >
//       <div
//         className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-lift"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/*  Header  */}
//         <h2 className="text-foreground text-lg font-semibold mb-5">
//           {mode === "create" ? "Create Task" : "Edit Task"}
//         </h2>

//         {/*  Title  */}
//         <label className="text-muted-foreground text-xs block mb-1">
//           Task Title
//         </label>
//         <input
//           type="text"
//           placeholder="Task Title"
//           className={`${inputClass} mb-4`}
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         {/*  Description  */}
//         <label className="text-muted-foreground text-xs block mb-1">
//           Task Description
//         </label>
//         <textarea
//           placeholder="Task Description"
//           className={`${inputClass} mb-4 resize-none`}
//           rows={3}
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         {/*  Error  */}
//         {error && <p className="text-destructive text-sm mb-4">{error}</p>}

//         {/*  Actions  */}
//         <div className="flex justify-end gap-2">
//           <Button variant="cancel" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button variant="save" onClick={handleSubmit}>
//             {loading
//               ? mode === "update"
//                 ? "Updating..."
//                 : "Creating..."
//               : mode === "update"
//                 ? "Save Changes"
//                 : "Create Task"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
