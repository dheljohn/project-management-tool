"use client";

import { useEffect, useState } from "react";
import ProjectCard from "../../../features/projects/components/ProjectCard";
import ProjectModal from "../../../features/projects/components/ProjectModal";
import { useBreadcrumbs } from "../../../context/BreadcrumbContext";
import { useProjects } from "../../../features/projects/hooks/useProjects";
import { Project } from "../../../types/types";
import { Button } from "../../../components/ui/Button";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(
    undefined,
  );

  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "name">(
    "updatedAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "" }]);
  }, [setBreadcrumbs]);

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

  function handleModalSuccess() {
    setModalOpen(false);
  }

  const list = projects ?? [];

  const filtered = list
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "updatedAt") {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const recentProject = list.reduce<Project | null>((latest, p) => {
    if (!latest) return p;
    return new Date(p.updatedAt) > new Date(latest.updatedAt) ? p : latest;
  }, null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">
            Failed to fetch projects.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-accent text-sm hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/*  Workspace Header  */}
      <div className="px-8 pt-8 pb-6 border-b border-border shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-widest mb-1">
                Workspace
              </p>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground text-sm mt-1.5">
                {list.length === 0
                  ? "No projects yet. Get started by creating your first one!"
                  : `${list.length} project${list.length !== 1 ? "s" : ""} in your workspace`}
              </p>
            </div>
          </div>

          {list.length > 0 && (
            <div className="flex items-center gap-6 mt-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {list.length}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Total
                  <br />
                  Projects
                </span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {
                    list.filter((p) => {
                      const d = new Date(p.updatedAt);
                      const now = new Date();
                      return (
                        now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000
                      );
                    }).length
                  }
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Active this
                  <br />
                  week
                </span>
              </div>
              {recentProject && (
                <>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Last updated
                    </span>
                    <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded-md">
                      {recentProject.name}
                    </span>
                  </div>
                </>
              )}

              <button
                onClick={openCreateModal}
                className="shrink-0 flex items-center gap-2 bg-accent hover:opacity-90 text-accent-foreground text-sm font-medium px-4 py-2.5 rounded-lg transition-opacity my-auto ml-auto"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/*  Content Area  */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            {list.length > 0 && (
              <>
                <div className="relative max-w-sm my-auto">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="cancel"
                    onClick={() =>
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                    // className="ml-2 px-3 py-2 rounded-full border border-border bg-muted hover:bg-muted/70 flex items-center gap-2 text-sm"
                  >
                    {sortOrder === "asc" ? (
                      <>
                        ↑ <span>Asc</span>
                      </>
                    ) : (
                      <>
                        ↓ <span>Desc</span>
                      </>
                    )}
                  </Button>
                  {[
                    { label: "Updated", value: "updatedAt" },
                    { label: "Created", value: "createdAt" },
                    { label: "Name", value: "name" },
                  ].map((item) => (
                    <Button
                      variant="save"
                      key={item.value}
                      onClick={() => setSortBy(item.value as typeof sortBy)}
                      className={`px-3 py-2 rounded-full text-sm transition-colors border
                        ${
                          sortBy === item.value
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                        }`}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center h-72 border border-dashed border-border rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-muted-foreground"
                >
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="11" rx="1" />
                </svg>
              </div>
              <p className="text-foreground font-medium text-sm">
                No projects yet
              </p>
              <p className="text-muted-foreground text-xs mt-1 mb-4">
                Create a project to start managing tasks.
              </p>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 bg-accent hover:opacity-90 text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg transition-opacity"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create your first project
              </button>
            </div>
          )}

          {list.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">
                No projects match{" "}
                <span className="text-foreground font-medium">"{search}"</span>
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-accent text-xs hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
