"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, FolderKanban, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { getProjectRoute } from "@/lib/utils";

export function ProjectSettingsPage() {
  const router = useRouter();
  const { activeProject, projects, renameProject, updateFounderNote, deleteProject } = useProjectWorkspace();
  const [nameDraft, setNameDraft] = useState(activeProject?.name ?? "");
  const [founderNoteDraft, setFounderNoteDraft] = useState(activeProject?.founderNote ?? "");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setNameDraft(activeProject?.name ?? "");
    setFounderNoteDraft(activeProject?.founderNote ?? "");
    setMessage(null);
  }, [activeProject?.founderNote, activeProject?.id, activeProject?.name]);

  if (!activeProject) {
    return <EmptyProjectState title="No project selected." description="Open or create a project before using this page." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <SectionContainer
        eyebrow="Manage"
        title="Project settings"
        description="Update the identity, keep one clean founder note, or delete the project if needed."
        className="warm-panel"
        action={
          <Link
            href={getProjectRoute(activeProject.id)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Back
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Project</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{activeProject.name}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stage</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{activeProject.stageLabel}</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace projects</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{projects.length}</p>
          </div>
        </div>
      </SectionContainer>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionContainer
          eyebrow="Identity"
          title="Update project"
          description="Keep the name and the founder note aligned with the current direction."
          className="warm-panel"
        >
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-900">Project name</span>
              <Input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-900">Founder note</span>
              <textarea
                value={founderNoteDraft}
                onChange={(event) => setFounderNoteDraft(event.target.value)}
                placeholder="What should the team remember about this project?"
                className="min-h-48 w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-pine"
              />
            </label>

            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  if (!nameDraft.trim()) {
                    return;
                  }

                  await renameProject(nameDraft.trim());
                  await updateFounderNote(founderNoteDraft);
                  setMessage("Project updated.");
                }}
              >
                <Save className="h-4 w-4" />
                Save project
              </Button>
            </div>
          </div>
        </SectionContainer>

        <div className="space-y-5">
          <SectionContainer
            eyebrow="Usage"
            title="When to use this page"
            description="Only for project-level settings. Daily work should stay in sections, calendar, and sprint."
            className="warm-panel"
          >
            <div className="space-y-3 text-sm leading-6 text-slate-700">
              <div className="flex items-start gap-3 rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                <FolderKanban className="mt-0.5 h-4 w-4 text-pine" />
                <p>Rename the project when the scope changes.</p>
              </div>
              <div className="flex items-start gap-3 rounded-[1.15rem] border border-slate-200 bg-white px-4 py-4">
                <FolderKanban className="mt-0.5 h-4 w-4 text-pine" />
                <p>Update the founder note when the core narrative changes.</p>
              </div>
            </div>
          </SectionContainer>

          <SectionContainer
            eyebrow="Danger Zone"
            title="Delete project"
            description="This action removes the current project."
            className="warm-panel"
          >
            <div className="rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-rose-900">
                    You currently have {projects.length} project{projects.length > 1 ? "s" : ""} in this workspace.
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
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </Button>
                </div>
              </div>
            </div>
          </SectionContainer>
        </div>
      </section>
    </div>
  );
}
