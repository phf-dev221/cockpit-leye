"use client";

import Link from "next/link";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_PROJECT_ID } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const targetHref = `/projects/${DEFAULT_PROJECT_ID}`;

  useEffect(() => {
    router.prefetch(targetHref);
  }, [router, targetHref]);

  return (
    <main className="login-stage flex min-h-screen items-center justify-center px-4 py-8">
      <div className="login-aura" />
      <div className="login-aura-two" />
      <div className="login-aura-three" />

      <div className="login-3d-wrap relative z-10 mx-auto w-full max-w-[920px]">
        <section className="login-panel">
          <div className="login-core-card rounded-[2.3rem] p-6 text-white sm:p-8 md:p-10">
            <div className="mx-auto max-w-[620px] text-center">
              <div className="login-chip mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/72">
                <Sparkles className="h-4 w-4" />
                Private Access
              </div>

              <div className="mt-8 space-y-5">
                <div className="login-floating-card mx-auto flex h-20 w-20 items-center justify-center rounded-[1.8rem]">
                  <LockKeyhole className="h-8 w-8 text-cyan-200" />
                </div>
                <h1 className="text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-6xl">
                  Entre dans ton cockpit.
                </h1>
                <p className="mx-auto max-w-xl text-base leading-8 text-white/68 sm:text-lg">
                  Une entree simple, plus cinematique, moins bavarde. Clique et ouvre directement
                  ton espace de travail.
                </p>
              </div>

              <div className="mt-10">
                <div className="mx-auto mb-6 h-px max-w-[260px] bg-white/12" />
              </div>

              <div className="login-enter">
                <Button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      router.push(targetHref);
                    })
                  }
                  disabled={isPending}
                  className="mx-auto flex min-h-[168px] w-full max-w-[360px] flex-col items-start justify-between rounded-[2rem] bg-white px-7 py-7 text-left text-ink transition-transform duration-200 hover:-translate-y-1"
                >
                  <span className="text-xs uppercase tracking-[0.22em] text-ink/45">Enter</span>
                  <span className="text-4xl font-semibold tracking-[-0.04em]">
                    {isPending ? "Ouverture..." : "Connecte"}
                  </span>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm text-ink/58">
                      {isPending ? "Chargement du dashboard" : "Open personal dashboard"}
                    </span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Button>
                <p className="mt-4 text-sm text-white/70">
                  Si le bouton ne repond pas, ouvre directement{" "}
                  <Link href={targetHref} className="underline decoration-white/35 underline-offset-4">
                    le dashboard
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
