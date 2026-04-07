"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/services/auth-api";
import { hasAuthSession } from "@/features/auth/services/auth-session";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const isAuthenticated = hasAuthSession();

  async function handleLogin() {
    setError(null);
    await authApi.login(loginForm);
    router.push("/projects/new");
  }

  async function handleLogout() {
    setError(null);
    await authApi.logout();
    router.refresh();
  }

  function runAction(action: () => Promise<void>) {
    startTransition(() => {
      action().catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Une erreur est survenue.");
      });
    });
  }

  return (
    <main className="tanjiro-login-page min-h-screen px-4 py-4 md:px-6 md:py-5">
      <div className="tanjiro-login-blur" />
      <div className="tanjiro-login-shell mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1320px] overflow-hidden rounded-[2.4rem] border border-white/40 shadow-[0_40px_110px_rgba(15,23,42,0.22)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="tanjiro-hero relative hidden overflow-hidden bg-[#f7f3ed] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,157,92,0.14),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(242,233,221,0.9))]" />
          <div className="absolute inset-0 flex items-end justify-center px-8 py-10">
            <img
              src="https://www.pngall.com/wp-content/uploads/14/Tanjiro-PNG-Cutout.png"
              alt="Tanjiro"
              className="tanjiro-illustration max-h-full w-auto object-contain"
            />
          </div>
        </section>

        <section className="tanjiro-form-panel relative flex min-h-full w-full flex-col bg-[#0f1115] px-8 py-7 text-slate-950 md:px-10 md:py-8 lg:px-12 lg:py-9">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="tanjiro-logo-ring" />
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-white">Teranga</p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Cockpit Access</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-white/68">
              <ShieldCheck className="h-4 w-4" />
              Protected
            </div>
          </div>

          <div className="mt-10 max-w-[520px]">
            <div className="mt-8">
              <p className="text-sm uppercase tracking-[0.24em] text-white/45">Access</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white md:text-[2.8rem]">
                Sign in to your cockpit.
              </h2>
              <p className="mt-4 max-w-[470px] text-sm leading-7 text-white/68 md:text-[15px]">
                Authenticate with your existing account. Workspace invitations and access management are available only
                inside the dashboard after connection.
              </p>
            </div>

            {error ? (
              <div className="mt-8 rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {isAuthenticated ? (
              <div className="mt-8 rounded-[1.6rem] border border-emerald-200 bg-emerald-50 px-5 py-5">
                <p className="font-medium text-emerald-900">Session active detectee.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button className="tanjiro-primary-button" onClick={() => router.push("/projects/new")}>
                    Ouvrir le cockpit
                  </Button>
                  <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-white" onClick={() => runAction(handleLogout)}>
                    Se deconnecter
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-8 space-y-4">
              <Input
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                className="tanjiro-input"
              />
              <Input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Password"
                className="tanjiro-input"
              />
              <Button
                className="tanjiro-primary-button h-14 w-full justify-center text-base"
                disabled={!loginForm.email.trim() || !loginForm.password.trim() || isPending}
                onClick={() => runAction(handleLogin)}
              >
                {isPending ? "Connexion..." : "Sign In"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mt-auto flex justify-end pt-7 text-sm text-slate-500">
            <div className="flex items-center gap-6 text-white/62">
              <span>FR</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
