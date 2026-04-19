"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ProjectCreationWizard, getEmptyCreateProjectDraft } from "@/features/projects/components/project-creation-wizard";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { getProjectRoute } from "@/lib/utils";
import { Rocket } from "lucide-react";

export function ProjectCreationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(getEmptyCreateProjectDraft);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createProject, error, isMutating } = useProjectWorkspace();

  async function handleSubmit(seed: any) {
    setSubmitError(null);

    try {
      const nextSnapshot = await createProject(draft.name.trim(), seed);
      const projectId = nextSnapshot.activeProjectId ?? nextSnapshot.projects[0]?.id ?? null;
      if (!projectId) {
        setSubmitError("Project creation did not return a project. Please check the backend response.");
        return;
      }
      router.push(getProjectRoute(projectId, "/sections"));
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : "Unable to create project.");
    }
  }

  return (
    <div className="min-h-[80vh]">
      <div className="flex items-center gap-2 mb-6">
        <Rocket className="h-5 w-5 text-slate-400" />
        <span className="text-sm text-slate-500">Let's build something great</span>
      </div>
      {submitError || error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError ?? error}
        </div>
      ) : null}
      <ProjectCreationWizard
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        submitLabel={isMutating ? "Creating..." : "Create Project"}
      />
    </div>
  );
}
