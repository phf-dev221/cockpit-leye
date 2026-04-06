import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDaysLabel(days: number) {
  return `Day ${days}`;
}

export function slugifyProjectName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new-project";
}

export function getProjectRoute(projectId?: string | null, suffix = "") {
  if (!projectId) {
    return "/projects/new";
  }

  return `/projects/${projectId}${suffix}`;
}
