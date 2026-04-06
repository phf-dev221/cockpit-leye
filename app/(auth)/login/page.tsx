"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, LockKeyhole, MailPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/services/auth-api";

type AccessMode = "login" | "register" | "invite";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AccessMode>("login");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    workspaceName: ""
  });

  const [inviteForm, setInviteForm] = useState({
    token: "",
    fullName: "",
    password: ""
  });

  const heading = useMemo(() => {
    if (mode === "register") return "Cree ton acces et ton premier workspace.";
    if (mode === "invite") return "Rejoins un workspace avec ton token d'invitation.";
    return "Connecte-toi a ton cockpit.";
  }, [mode]);

  const description = useMemo(() => {
    if (mode === "register") {
      return "Le front est maintenant pret pour un vrai backend d'authentification: creation de compte, creation de workspace et bootstrap owner.";
    }

    if (mode === "invite") {
      return "Les cofondateurs ou collaborateurs rejoignent l'espace avec un token d'invitation securise.";
    }

    return "Connexion via backend Laravel, puis chargement des workspaces et des projets autorises.";
  }, [mode]);

  async function handleLogin() {
    setError(null);
    await authApi.login(loginForm);
    router.push("/projects/new");
  }

  async function handleRegister() {
    setError(null);
    await authApi.register(registerForm);
    router.push("/projects/new");
  }

  async function handleInvitationAccept() {
    setError(null);
    await authApi.acceptInvitation(inviteForm);
    router.push("/projects/new");
  }

  function runAction(action: () => Promise<void>) {
    startTransition(() => {
      action().catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Une erreur est survenue.");
      });
    });
  }

  return (
    <main className="login-stage flex min-h-screen items-center justify-center px-4 py-8">
      <div className="login-aura" />
      <div className="login-aura-two" />
      <div className="login-aura-three" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1120px] gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="login-core-card rounded-[2.3rem] p-7 text-white sm:p-10">
          <div className="max-w-[640px]">
            <div className="login-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/72">
              <LockKeyhole className="h-4 w-4" />
              Access System
            </div>

            <h1 className="mt-8 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-6xl">
              {heading}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              {description}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="login-floating-card rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/62">Sign In</p>
                <p className="mt-3 text-sm leading-6 text-white/78">
                  Authentifie un membre existant et charge ses workspaces.
                </p>
              </div>
              <div className="login-floating-card rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/62">Create Access</p>
                <p className="mt-3 text-sm leading-6 text-white/78">
                  Cree un compte, cree un workspace owner, puis initialise les acces.
                </p>
              </div>
              <div className="login-floating-card rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/62">Invite Member</p>
                <p className="mt-3 text-sm leading-6 text-white/78">
                  Permet a un cofondateur de rejoindre l'espace encapsule.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="login-glass rounded-[2rem] border-white/15 bg-transparent p-5 text-white sm:p-7">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm transition ${mode === "login" ? "bg-white text-slate-950" : "bg-white/10 text-white"}`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm transition ${mode === "register" ? "bg-white text-slate-950" : "bg-white/10 text-white"}`}
            >
              Creer acces
            </button>
            <button
              type="button"
              onClick={() => setMode("invite")}
              className={`rounded-full px-4 py-2 text-sm transition ${mode === "invite" ? "bg-white text-slate-950" : "bg-white/10 text-white"}`}
            >
              Invitation
            </button>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-300/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {mode === "login" ? (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/62">Connexion</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Acceder a un workspace existant</h2>
              </div>
              <Input
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                className="bg-white text-slate-950"
              />
              <Input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Mot de passe"
                className="bg-white text-slate-950"
              />
              <Button
                className="w-full justify-between bg-white text-slate-950 hover:bg-slate-100"
                disabled={!loginForm.email.trim() || !loginForm.password.trim() || isPending}
                onClick={() => runAction(handleLogin)}
              >
                {isPending ? "Connexion..." : "Se connecter"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {mode === "register" ? (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/62">Create Access</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Creer le premier acces owner</h2>
              </div>
              <Input
                value={registerForm.fullName}
                onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Nom complet"
                className="bg-white text-slate-950"
              />
              <Input
                value={registerForm.email}
                onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email"
                className="bg-white text-slate-950"
              />
              <Input
                type="password"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Mot de passe"
                className="bg-white text-slate-950"
              />
              <Input
                value={registerForm.workspaceName}
                onChange={(event) => setRegisterForm((current) => ({ ...current, workspaceName: event.target.value }))}
                placeholder="Nom du workspace"
                className="bg-white text-slate-950"
              />
              <Button
                className="w-full justify-between bg-white text-slate-950 hover:bg-slate-100"
                disabled={
                  !registerForm.fullName.trim() ||
                  !registerForm.email.trim() ||
                  !registerForm.password.trim() ||
                  !registerForm.workspaceName.trim() ||
                  isPending
                }
                onClick={() => runAction(handleRegister)}
              >
                {isPending ? "Creation..." : "Creer acces et workspace"}
                <MailPlus className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {mode === "invite" ? (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/62">Invitation</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Rejoindre un espace collaboratif</h2>
              </div>
              <Input
                value={inviteForm.token}
                onChange={(event) => setInviteForm((current) => ({ ...current, token: event.target.value }))}
                placeholder="Token d'invitation"
                className="bg-white text-slate-950"
              />
              <Input
                value={inviteForm.fullName}
                onChange={(event) => setInviteForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="Nom complet si nouveau compte"
                className="bg-white text-slate-950"
              />
              <Input
                type="password"
                value={inviteForm.password}
                onChange={(event) => setInviteForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Mot de passe si nouveau compte"
                className="bg-white text-slate-950"
              />
              <Button
                className="w-full justify-between bg-white text-slate-950 hover:bg-slate-100"
                disabled={!inviteForm.token.trim() || isPending}
                onClick={() => runAction(handleInvitationAccept)}
              >
                {isPending ? "Validation..." : "Accepter l'invitation"}
                <Users className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.5rem] bg-white/10 p-4 text-sm leading-7 text-white/78">
            <div className="flex items-center gap-2 font-medium text-white">
              <KeyRound className="h-4 w-4" />
              Backend expectations
            </div>
            <p className="mt-2">
              Le backend doit exposer des endpoints reels pour `login`, `register`, `invitation acceptance`,
              `workspace bootstrap`, et `member access management`.
            </p>
          </div>

          <p className="mt-5 text-sm text-white/68">
            Si vous n'avez pas encore de backend branche, vous pouvez revenir a la creation de projet via{" "}
            <Link href="/projects/new" className="underline decoration-white/35 underline-offset-4">
              l'interface projet
            </Link>
            .
          </p>
        </Card>
      </div>
    </main>
  );
}
