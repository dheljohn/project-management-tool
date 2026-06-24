// src/components/projects/ProjectModal.tsx
"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

// ProjectModal.tsx
interface ProjectModalProps {
  mode: "create" | "edit";
  project?: Project;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export default function ProjectModal({
  mode,
  project,
  onClose,
  onSuccess,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill fields on edit mode
  useEffect(() => {
    if (mode === "edit" && project) {
      setName(project.name);
      setDescription(project.description ?? "");
    }
  }, [mode, project]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (mode === "create") {
        res = await api.post("/test02/create_project", { name, description });
      } else {
        res = await api.patch(`/test02/patch_project`, {
          id: project?.id,
          name,
          description,
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

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Title */}
        <h2 className="text-white text-lg font-semibold mb-5">
          {mode === "create" ? "Create Project" : "Edit Project"}
        </h2>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ProjectFlow"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Description Field */}
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-1">
            Description{" "}
            <span className="text-gray-600 text-xs">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Project"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
