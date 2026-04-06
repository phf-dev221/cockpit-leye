import { TodayDeskPage } from "@/features/projects/components/today-desk-page";

export default async function ProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <TodayDeskPage projectId={projectId} />;
}
