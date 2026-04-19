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

export function getProjectRoute(projectId?: string | null, suffix = "", projectUuid?: string | null) {
  const id = projectUuid || projectId;
  if (!id || id === "current") {
    if (!suffix) {
      return "/today";
    }
    return "/projects/new" + suffix;
  }

  return `/projects/${id}${suffix}`;
}
