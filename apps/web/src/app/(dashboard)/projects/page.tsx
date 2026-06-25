// src/app/(dashboard)/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import ProjectCard from "../../../components/projects/ProjectCard";
import ProjectModal from "../../../components/projects/ProjectModal";

interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await api.get("/test02/get_user_projects");
      setProjects(res.data);
    } catch {
      setError("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedProject(undefined);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEditModal(project: Project) {
    setSelectedProject(project);
    setModalMode("edit");
    setModalOpen(true);
  }

  function handleModalSuccess(updatedProject: Project) {
    if (modalMode === "create") {
      setProjects((prev) => [updatedProject, ...prev]);
    } else {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            {projects.length} project(s) found
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-700 rounded-xl">
          <p className="text-gray-500 text-sm">No projects yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-3 text-cyan-400 text-sm hover:underline"
          >
            Create your first project
          </button>
        </div>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={openEditModal}
          />
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProjectModal
          mode={modalMode}
          project={selectedProject}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
