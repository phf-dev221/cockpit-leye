"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { getProjectRoute } from "@/lib/utils";

export function ProjectSettingsPage() {
  const router = useRouter();
  const { activeProject, projects, renameProject, deleteProject } = useProjectWorkspace();
  const [nameDraft, setNameDraft] = useState(activeProject?.name ?? "");

  useEffect(() => {
    setNameDraft(activeProject?.name ?? "");
  }, [activeProject?.id, activeProject?.name]);

  if (!activeProject) {
    return <EmptyProjectState title="No project selected." description="Create a project from the backend workspace before opening settings." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Project Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{activeProject.name}</h1>
          <p className="mt-2 text-sm leading-7 text-ink/65">
            Rename or archive the current project here instead of cluttering the main workspace.
          </p>
        </div>
        <Link
          href={getProjectRoute(activeProject.id)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2.5 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
        >
          Back to desk
        </Link>
      </div>

      <SectionContainer
        eyebrow="Project Identity"
        title="Rename the current project"
        description="Use a clean name now. We can keep the workspace focused once this moves out of the dashboard."
        className="bg-white"
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
          <Button
            onClick={() => {
              if (!nameDraft.trim()) return;
              renameProject(nameDraft.trim());
            }}
          >
            Save name
          </Button>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Project Safety"
        title="Delete this project"
        description="Keep delete isolated here so it is harder to trigger by accident from the cockpit."
        className="bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-rose-50 p-4">
          <p className="max-w-2xl text-sm leading-6 text-rose-900/80">
            You still have {projects.length} project{projects.length > 1 ? "s" : ""} in the workspace.
          </p>
          <Button
            variant="danger"
            disabled={projects.length <= 1}
            onClick={() => {
              const currentId = activeProject.id;
              void deleteProject(currentId).then(() => {
                router.push(getProjectRoute());
              });
            }}
          >
            Delete project
          </Button>
        </div>
      </SectionContainer>
    </div>
  );
}
