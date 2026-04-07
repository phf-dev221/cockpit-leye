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
        title="Update the current project"
        description="Modifiez ici l'identite du projet et la note founder de reference."
        className="bg-white"
      >
        <div className="space-y-4">
          <Input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
          <textarea
            value={founderNoteDraft}
            onChange={(event) => setFounderNoteDraft(event.target.value)}
            placeholder="Founder note"
            className="min-h-36 w-full rounded-[1.3rem] border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary"
          />
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <Button
            onClick={async () => {
              if (!nameDraft.trim()) return;
              await renameProject(nameDraft.trim());
              await updateFounderNote(founderNoteDraft);
              setMessage("Projet mis a jour.");
            }}
          >
            Save project
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
