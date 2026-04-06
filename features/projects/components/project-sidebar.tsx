"use client";

import Link from "next/link";
import { FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionContainer } from "@/components/ui/section-container";
import type { DemoProject } from "@/types";

interface ProjectSidebarProps {
  projects: DemoProject[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onResetDemo: () => void;
  getCompletion: (project: DemoProject) => number;
}

export function ProjectSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onResetDemo,
  getCompletion
}: ProjectSidebarProps) {
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Projects</p>
          <h2 className="mt-2 text-xl font-semibold">Switch fast</h2>
        </div>
        <button
          type="button"
          onClick={onResetDemo}
          className="text-xs text-ink/55 underline underline-offset-4"
        >
          Reset
        </button>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelectProject(project.id)}
            className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
              project.id === activeProjectId
                ? "border-pine bg-pine text-white"
                : "border-transparent bg-surface/80 text-ink hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{project.name}</p>
              <span className="text-xs">{getCompletion(project)}%</span>
            </div>
            <p className="mt-1 text-xs opacity-70">{project.stageLabel}</p>
          </button>
        ))}
      </div>

      <SectionContainer
        eyebrow="Create New Project"
        title="Set the foundation"
        description="Use the dedicated setup page so the dashboard stays light."
        className="bg-surface/80"
      >
        <Link
          href="/projects/new"
          className="inline-flex w-full items-center justify-between gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-panel transition-transform duration-200 hover:-translate-y-0.5"
        >
          <span>New project</span>
          <FolderPlus className="h-4 w-4" />
        </Link>
      </SectionContainer>

      <SectionContainer
        eyebrow="Project Settings"
        title={activeProject?.name ?? "Current project"}
        description="Rename or delete outside the cockpit so the main workspace stays focused."
        className="bg-surface/80"
      >
        <Link
          href={`/projects/${activeProject.id}/manage`}
          className="inline-flex w-full items-center justify-between gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
        >
          Open settings
        </Link>
      </SectionContainer>
    </Card>
  );
}
