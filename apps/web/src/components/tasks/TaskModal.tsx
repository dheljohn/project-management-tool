"use client";

import { useState } from "react";
import api from "../../../lib/api";

type TaskStatus = "Todo" | "In_Progress" | "Done";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

interface taskModalProps {
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
}: taskModalProps) {
  const [name, setName] = useState("");
  const [contents, setContents] = useState("");
  const [status, setStatus] = useState<"Todo" | "In_Progress" | "Done">("Todo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let res;
      res = await api.post("/test03/create_task", {
        project_id: projectId,
        name,
        contents,
        status,
      });
      console.log(res.data);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h2 className="text-white text-lg font-semibold mb-5">Create Task</h2>

        <input
          type="text"
          placeholder="Task Title"
          className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 w-full text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Task Description"
          className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mb-4 w-full text-white"
          value={contents}
          onChange={(e) => setContents(e.target.value)}
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end">
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Loading..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
