import { ProjectNotificationsScreen } from "@/features/projects/components/project-notifications-screen";

export default async function NotificationsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectNotificationsScreen projectId={projectId} />;
}
