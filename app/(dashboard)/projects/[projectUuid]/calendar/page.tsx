import { ProjectCalendarPage } from "@/features/projects/components/project-calendar-page";

export default async function CalendarPage({
  params
}: {
  params: Promise<{ projectUuid: string }>;
}) {
  const { projectUuid } = await params;

  return <ProjectCalendarPage projectId={projectUuid} />;
}
