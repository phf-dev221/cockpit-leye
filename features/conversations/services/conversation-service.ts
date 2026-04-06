import type { DemoProject } from "@/types";

export const conversationService = {
  list(project: DemoProject) {
    return project.conversations;
  }
};
