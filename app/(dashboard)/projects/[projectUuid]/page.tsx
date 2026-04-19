import { TodayDeskPage } from "@/features/projects/components/today-desk-page";

export default async function ProjectPage({
  params
}: {
  params: Promise<{ projectUuid: string }>;
}) {
  const { projectUuid } = await params;
  return <TodayDeskPage projectId={projectUuid} />;
}
