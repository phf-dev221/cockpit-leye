import type { DemoProject } from "@/types";

export const sectionService = {
  list(project: DemoProject) {
    return project.canvases;
  }
};
