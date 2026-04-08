"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import { Textarea } from "@/components/ui/textarea";
import {
  buildCreateProjectSeed,
  getEmptyCreateProjectDraft
} from "@/features/projects/components/project-creation-wizard";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { getProjectRoute, slugifyProjectName } from "@/lib/utils";

export function ProjectCreationPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(getEmptyCreateProjectDraft);
  const { createProject } = useProjectWorkspace();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <SectionContainer
        eyebrow="New Project"
        title="Create project"
        description="Keep it short. You can refine the rest later."
        className="warm-panel"
        action={
          <Link
            href={getProjectRoute()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Back
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Need now</p>
            <p className="mt-2 text-sm font-medium text-slate-900">A name, a problem, a user, a solution.</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Later</p>
            <p className="mt-2 text-sm font-medium text-slate-900">Business model and advanced details can wait.</p>
          </div>
          <div className="rounded-[1.25rem] border border-slate-200 bg-[#eef7f6] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Result</p>
            <p className="mt-2 text-sm font-medium text-slate-900">You land directly in sections after creation.</p>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Core"
        title="Start simple"
        description="Only the fields that matter to open a clean project."
        className="warm-panel"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Project name"
          />
          <Input
            value={draft.vision}
            onChange={(event) => setDraft((current) => ({ ...current, vision: event.target.value }))}
            placeholder="One-line vision"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Textarea
            value={draft.problem}
            onChange={(event) => setDraft((current) => ({ ...current, problem: event.target.value }))}
            placeholder="What problem are you solving?"
            className="min-h-32 bg-white"
          />
          <Textarea
            value={draft.targetUser}
            onChange={(event) => setDraft((current) => ({ ...current, targetUser: event.target.value }))}
            placeholder="Who is the first user?"
            className="min-h-32 bg-white"
          />
          <Textarea
            value={draft.solution}
            onChange={(event) => setDraft((current) => ({ ...current, solution: event.target.value }))}
            placeholder="What does the product do?"
            className="min-h-32 bg-white"
          />
          <Textarea
            value={draft.goToMarket}
            onChange={(event) => setDraft((current) => ({ ...current, goToMarket: event.target.value }))}
            placeholder="How will you get the first users?"
            className="min-h-32 bg-white"
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button
            variant="ghost"
            className="border-slate-200 bg-white text-slate-900"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              void createProject(draft.name.trim(), buildCreateProjectSeed(draft)).then((nextSnapshot) => {
                const createdProject = nextSnapshot.projects[0];
                router.push(getProjectRoute(createdProject?.id ?? slugifyProjectName(draft.name), "/sections"));
              });
            }}
            disabled={!draft.name.trim() || !draft.problem.trim() || !draft.targetUser.trim() || !draft.solution.trim()}
          >
            Create project
          </Button>
        </div>
      </SectionContainer>
    </div>
  );
}
