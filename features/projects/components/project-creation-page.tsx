"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  getEmptyCreateProjectDraft,
  ProjectCreationWizard
} from "@/features/projects/components/project-creation-wizard";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { getProjectRoute, slugifyProjectName } from "@/lib/utils";

export function ProjectCreationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(getEmptyCreateProjectDraft);
  const { createProject } = useProjectWorkspace();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-600">New Project</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Create outside the dashboard</h1>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            A dedicated setup page keeps the cockpit light while still helping you think properly.
          </p>
        </div>
        <Link
          href={getProjectRoute()}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
        >
          Back to desk
        </Link>
      </div>

      <ProjectCreationWizard
        value={draft}
        onChange={setDraft}
        onSubmit={(seed) => {
          void createProject(draft.name.trim(), seed).then((nextSnapshot) => {
            const createdProject = nextSnapshot.projects[0];
            router.push(getProjectRoute(createdProject?.id ?? slugifyProjectName(draft.name), "/sections"));
          });
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}
