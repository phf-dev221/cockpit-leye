"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";

export function EmptyProjectState({
  title = "No project connected yet.",
  description = "Connect the frontend to the backend and create a workspace project to start using the cockpit.",
  showLogin = true
}: {
  title?: string;
  description?: string;
  showLogin?: boolean;
}) {
  return (
    <Card className="space-y-4 bg-white text-slate-950">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {showLogin ? (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-50"
          >
            Login
          </Link>
        ) : null}
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-900"
        >
          Create project
        </Link>
      </div>
    </Card>
  );
}
