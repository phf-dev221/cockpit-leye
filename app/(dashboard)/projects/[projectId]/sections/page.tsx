import { SectionWorkspacePage } from "@/features/sections/components/section-workspace-page";

export default async function SectionsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <SectionWorkspacePage projectId={projectId} />;
}
