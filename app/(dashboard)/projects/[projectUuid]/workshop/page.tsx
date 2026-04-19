import { redirect } from "next/navigation";

export default async function WorkshopPage({
  params
}: {
  params: Promise<{ projectUuid: string }>;
}) {
  const { projectUuid } = await params;
  redirect(`/projects/${projectUuid}/problem-statement`);
}
