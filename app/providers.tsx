"use client";

import type { ReactNode } from "react";

import { ProjectWorkspaceProvider } from "@/features/projects/hooks/use-project-workspace";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ProjectWorkspaceProvider>{children}</ProjectWorkspaceProvider>;
}
