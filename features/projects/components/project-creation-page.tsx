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
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2.2rem] border border-[#1b1613] bg-[linear-gradient(135deg,#171310_0%,#221913_48%,#312017_100%)] px-6 py-6 shadow-[0_30px_90px_rgba(15,10,7,0.28)] sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.26em] text-[#d8b98f]">New Project</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.06em] text-[#fff8ef] sm:text-4xl">
              Start with a clean project frame
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f0dfcb]/88 sm:text-base">
              Define the core direction first, then let the dashboard inherit a project that already has signal,
              structure, and a useful first angle.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f0dfcb]">
                Problem
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f0dfcb]">
                First User
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f0dfcb]">
                Wedge
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f0dfcb]">
                Go To Market
              </span>
            </div>
          </div>
          <Link
            href={getProjectRoute()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/12"
          >
            Back to desk
          </Link>
        </div>
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
