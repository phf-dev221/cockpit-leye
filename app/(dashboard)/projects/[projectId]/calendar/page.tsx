import { ProjectCalendarPage } from "@/features/projects/components/project-calendar-page";

export default async function CalendarPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectCalendarPage projectId={projectId} />;
}
