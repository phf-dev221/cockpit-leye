import type { DemoProject } from "@/types";

export const sprintService = {
  get(project: DemoProject) {
    return project.sprint;
  }
};
