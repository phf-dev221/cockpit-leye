import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppProviders } from "@/app/providers";
import { AppShell } from "@/components/layout/app-shell";
import { FRONT_AUTH_COOKIE } from "@/features/auth/auth-constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  if (!cookieStore.get(FRONT_AUTH_COOKIE)?.value) {
    redirect("/login");
  }

  return (
    <AppProviders>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}
