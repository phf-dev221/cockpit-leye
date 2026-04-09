"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/services/auth-api";
import { hasAuthSession, clearAuthSession, getAuthSession } from "@/features/auth/services/auth-session";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const isAuthenticated = hasAuthSession();
  const session = getAuthSession();

  async function handleLogin() {
    setError(null);
    try {
      await authApi.login(loginForm);
      router.push("/today");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erreur de connexion");
    }
  }

  async function handleLogout() {
    clearAuthSession();
    router.refresh();
  }

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try { await action(); } 
      catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Erreur"); }
    });
  }

  if (isAuthenticated && session?.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-500 via-purple-500 to-cyan-500 p-1">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-3xl">⚔️</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{session.user.full_name || session.user.email}</h2>
          <p className="text-slate-500 text-sm mb-8">Bienvenue</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.push("/today")}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition"
            >
              Entrer
            </button>
            <button 
              onClick={() => runAction(handleLogout)}
              className="px-6 py-3 border border-slate-300 text-slate-600 rounded-lg hover:border-rose-500 hover:text-rose-500 transition"
            >
              Quitter
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-rose-900 via-slate-900 to-rose-950">
        <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/previews/048/667/284/non_2x/tanjiro-sun-breathing-demon-slayer-free-vector.jpg')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl" />
          
          <div className="relative">
            <div className="w-72 h-72 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl shadow-black/50">
              <img 
                src="https://static.vecteezy.com/system/resources/previews/048/667/284/non_2x/tanjiro-sun-breathing-demon-slayer-free-vector.jpg" 
                alt="Tanjiro" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
              <img 
                src="https://static.vecteezy.com/system/resources/previews/048/667/284/non_2x/tanjiro-sun-breathing-demon-slayer-free-vector.jpg" 
                alt="Tanjiro" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">TERANGA</h1>
            <p className="text-rose-500">Cockpit</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome back</h2>
            <p className="text-slate-500 text-lg">Sign in to access your cockpit</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={() => runAction(handleLogin)}
              disabled={!loginForm.email.trim() || !loginForm.password.trim() || isPending}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="mt-10 flex justify-center gap-2">
            <span className="text-slate-400 text-xs">🔒 Sécurisé</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400 text-xs">Confidentialité</span>
          </div>
        </div>
      </div>
    </main>
  );
}