"use client";

import { useEffect, useState } from "react";
import ProjectCard from "../../../features/projects/components/ProjectCard";
import ProjectModal from "../../../features/projects/components/ProjectModal";
import { useBreadcrumbs } from "../../../context/BreadcrumbContext";
import { useProjects } from "../../../features/projects/hooks/useProjects";
import { Project } from "../../../types/types";
import { Button } from "../../../components/ui/Button";
import { JoinProjectButton } from "../../../features/invite/components/JoinProjectModal";
import {
  ArrowDownZA,
  ArrowUpAZ,
  ClockArrowDown,
  ClockArrowUp,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(
    undefined,
  );

  <ArrowDownZA />;
  <ArrowUpAZ />;

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

  const getSortIcon = (value: string, order: "asc" | "desc") => {
    const iconSize = 14;
    if (value === "name") {
      return order === "asc" ? (
        <ArrowUpAZ size={iconSize} />
      ) : (
        <ArrowDownZA size={iconSize} />
      );
    }
    if (value === "updatedAt") {
      return order === "asc" ? (
        <ClockArrowUp size={iconSize} />
      ) : (
        <ClockArrowDown size={iconSize} />
      );
    }
    // Default to createdAt / Calendar
    return order === "asc" ? (
      <CalendarArrowUp size={iconSize} />
    ) : (
      <CalendarArrowDown size={iconSize} />
    );
  };

  // Logic to switch order if pill is already active, otherwise switch the sorting category
  const handleSortClick = (value: typeof sortBy) => {
    if (sortBy === value) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(value);
      // Optional: Set intuitive default directions when clicking a new pill
      setSortOrder(value === "name" ? "asc" : "desc");
    }
  };

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
      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 border-b border-border shrink-0">
        <div className="max-w-6xl mx-auto">
          {/*  Header  */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-accent uppercase tracking-widest mb-1">
                Workspace
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Projects
              </h1>

              <p className="text-muted-foreground text-xs sm:text-sm mt-1.5">
                {list.length === 0
                  ? "No projects yet. Get started by creating your first one!"
                  : `${list.length} project${list.length !== 1 ? "s" : ""} in your workspace`}
              </p>
            </div>
          </div>

          {list.length > 0 && (
            <div className="flex flex-row items-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-5 justify-between ">
              {/*  Stats  */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 min-w-0 w-full justify-between md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                      {list.length}
                    </span>
                    <span className="text-[10px] sm:text-[11px] lg:text-xs text-muted-foreground leading-tight">
                      Total
                      <br />
                      Projects
                    </span>
                  </div>

                  <div className="w-px h-7 sm:h-8 bg-border" />

                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                      {
                        list.filter((p) => {
                          const d = new Date(p.updatedAt);
                          const now = new Date();
                          return (
                            now.getTime() - d.getTime() <
                            7 * 24 * 60 * 60 * 1000
                          );
                        }).length
                      }
                    </span>
                    <span className="text-[10px] sm:text-[11px] lg:text-xs text-muted-foreground leading-tight">
                      Active this
                      <br />
                      week
                    </span>
                  </div>
                </div>

                {recentProject && (
                  <>
                    <div className="w-px h-7 sm:h-8 bg-border hidden md:block" />
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 basis-full md:basis-auto md:w-auto order-3 md:order-0">
                      <span className="text-[10px] sm:text-[11px] lg:text-xs text-muted-foreground whitespace-nowrap">
                        Last updated
                      </span>
                      <span className="text-[10px] sm:text-[11px] lg:text-xs font-medium text-foreground bg-muted px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md truncate max-w-[2000px] md:max-w-75 lg:max-w-none">
                        {recentProject.name}
                      </span>
                      {/* <Button variant="pill"> UI </Button> */}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-end gap-2 flex-col sm:flex-row ">
                <JoinProjectButton />

                <Button
                  variant="add"
                  onClick={openCreateModal}
                  // /* Changed flex-col flex to a centered row layout */
                  className="flex items-center gap-1.5 bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-full cursor-pointer transform transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="sm:hidden">New</span>
                  <span className="hidden sm:inline">New Project</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*  Content Area  */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
            {list.length > 0 && (
              <>
                <div className="relative sm:max-w-sm sm:my-auto">
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

                <div className="flex flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 justify-end">
                  {[
                    { label: "Name", value: "name" },
                    { label: "Updated", value: "updatedAt" },
                    { label: "Created", value: "createdAt" },
                  ].map((item) => {
                    const isActive = sortBy === item.value;
                    return (
                      <Button
                        variant="pill"
                        key={item.value}
                        onClick={() =>
                          handleSortClick(item.value as typeof sortBy)
                        }
                        className={`shrink-0 text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer
                      ${
                        isActive
                          ? "text-accent border-accent bg-accent/5 "
                          : "text-muted-foreground border-border hover:text-foreground hover:border-accent"
                      }`}
                      >
                        <span>{item.label}</span>
                        {isActive && getSortIcon(item.value, sortOrder)}
                      </Button>
                    );
                  })}
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
              <div className="flex flex-col sm:flex-col items-center gap-4 w-full justify-center">
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 bg-accent hover:opacity-90 text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg transition-opacity cursor-pointer"
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

                {/* Better Divider */}
                <div className="flex items-center w-full sm:w-auto gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="h-px bg-border flex-1 sm:w-8"></div>
                  <span>or</span>
                  <div className="h-px bg-border flex-1 sm:w-8"></div>
                </div>

                <JoinProjectButton />
              </div>
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
