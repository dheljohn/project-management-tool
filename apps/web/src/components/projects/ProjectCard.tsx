// src/components/projects/ProjectCard.tsx
"use client";

import { useRouter } from "next/navigation";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const router = useRouter();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-cyan-500 transition-colors group relative">
      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent card click
          onEdit(project);
        }}
        className="absolute top-4 right-4 text-gray-500 hover:text-cyan-400 text-xs px-2 py-1 rounded-md border border-gray-700 hover:border-cyan-500 transition-colors"
      >
        Edit
      </button>

      {/* Clickable Area → Kanban */}
      <div
        onClick={() => router.push(`/projects/${project.id}`)}
        className="cursor-pointer"
      >
        <h2 className="text-white font-semibold text-lg group-hover:text-cyan-400 transition-colors pr-12">
          {project.name}
        </h2>

        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
          {project.description ?? "No description provided."}
        </p>

        <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
          <span>
            Created:{" "}
            {new Date(project.createdAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span>
            Updated:{" "}
            {new Date(project.updatedAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
