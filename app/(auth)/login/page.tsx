"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Users, Mail, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/services/auth-api";
import { hasAuthSession, clearAuthSession, getAuthSession } from "@/features/auth/services/auth-session";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [inviteForm, setInviteForm] = useState({ email: "" });

  const isAuthenticated = hasAuthSession();
  const session = getAuthSession();

  async function handleLogin() {
    setError(null);
    try {
      await authApi.login(loginForm);
      router.push("/today");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Une erreur est survenue.");
    }
  }

  async function handleLogout() {
    setError(null);
    clearAuthSession();
    router.refresh();
  }

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try { await action(); } 
      catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Une erreur est survenue."); }
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 md:py-10">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        <div className="mb-6 text-center md:mb-10">
          <h1 className="text-3xl font-bold text-white md:text-5xl">Teranga Cockpit</h1>
          <p className="mt-1 text-sm text-slate-400 md:text-lg">Founder intelligence system</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 md:rounded-2xl">
            {error}
          </div>
        )}

        {isAuthenticated && session?.user ? (
          <Card className="border-emerald-500/30 bg-emerald-500/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-emerald-300">Session active</p>
                <p className="text-sm text-emerald-400/70">{session.user.email}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => router.push("/today")}>
                Accéder au cockpit
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={() => runAction(handleLogout)}>
                <LogOut className="mr-2 h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
            <Card className="border-slate-700/50 bg-slate-800/50 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Créer mon espace</h2>
              </div>
              <p className="text-sm text-slate-400 mb-3">Lancez votre cockpit personnel pour structurer vos projets.</p>
              <div className="space-y-2">
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Votre email"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
                  placeholder="Mot de passe"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  disabled={!loginForm.email.trim() || !loginForm.password.trim() || isPending}
                  onClick={() => runAction(handleLogin)}
                >
                  {isPending ? "Création..." : "Créer mon espace"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="border-slate-700/50 bg-slate-800/50 p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20">
                  <Mail className="h-4 w-4 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Inviter quelqu'un</h2>
              </div>
              <p className="text-sm text-slate-400 mb-3">Générez un lien d'invitation temporaire.</p>
              <div className="space-y-2">
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((c) => ({ ...c, email: e.target.value }))}
                  placeholder="Email de l'invité"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
                <Button
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                  disabled={!inviteForm.email.trim() || isPending}
                  onClick={() => alert("Lien d'invitation généré! Enviez-le à " + inviteForm.email)}
                >
                  Générer le lien
                </Button>
              </div>
            </Card>

            <div className="md:col-span-2">
              <Card className="border-slate-600/50 bg-slate-800/30 p-4 md:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <span className="text-emerald-400">🔒</span>
                  </div>
                  <span className="font-semibold text-white">Accès sécurisé</span>
                </div>
                <ul className="grid grid-cols-1 gap-2 text-sm text-slate-400 md:grid-cols-2">
                  <li className="flex items-center gap-2">✓ Tokens temporaires avec expiration</li>
                  <li className="flex items-center gap-2">✓ Authentification sécurisée</li>
                  <li className="flex items-center gap-2">✓ Protection sessions multiples</li>
                  <li className="flex items-center gap-2">✓ Workspace privé</li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}