"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { Project } from "../../types/types";
import { Button } from "../ui/Button";

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

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/*  Title  */}
        <h2 className="text-foreground text-lg font-semibold mb-5">
          {mode === "create" ? "Create Project" : "Edit Project"}
        </h2>

        {/*  Name  */}
        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-1">
            Project Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ProjectFlow"
            className={inputClass}
          />
        </div>

        {/*  Description  */}
        <div className="mb-5">
          <label className="block text-sm text-muted-foreground mb-1">
            Description{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/*  Error  */}
        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        {/*  Actions  */}
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="save">
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Project"
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
