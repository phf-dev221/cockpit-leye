import { ProjectNotificationsScreen } from "@/features/projects/components/project-notifications-screen";

export default async function NotificationsPage({
  params
}: {
  params: Promise<{ projectUuid: string }>;
}) {
  const { projectUuid } = await params;

  return <ProjectNotificationsScreen projectId={projectUuid} />;
}
