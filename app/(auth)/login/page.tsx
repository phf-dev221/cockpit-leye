"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/services/auth-api";
import { hasAuthSession, clearAuthSession, getAuthSession } from "@/features/auth/services/auth-session";
import { useLanguage } from "@/features/auth/i18n/language-context";
import { LanguageSwitcher } from "@/features/auth/components/language-switcher";
import { Eye, EyeOff } from "lucide-react";

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-rose-500/20 mb-4" />
        <div className="h-4 w-32 bg-slate-700 rounded" />
      </div>
    </main>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof getAuthSession>>(null);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Min 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase");
    if (!/[a-z]/.test(password)) errors.push("One lowercase");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("One special");
    return errors;
  };

  const passwordErrors = validatePassword(loginForm.password);
  const isPasswordValid = passwordErrors.length === 0;

  useEffect(() => {
    setIsAuthenticated(hasAuthSession());
    setSession(getAuthSession());
    setInitialized(true);
  }, []);

  async function handleLogin() {
    setError(null);
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError("Please enter email and password");
      return;
    }
    if (!isPasswordValid) {
      setError("Password does not meet requirements");
      return;
    }
    
    setIsLoading(true);
    try {
      await authApi.login(loginForm);
      router.push("/today");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && session?.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-500 via-purple-500 to-cyan-500 p-1">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">T</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{session.user?.full_name || session.user?.email}</h2>
          <p className="text-slate-400 text-sm mb-8">Welcome back</p>
          <button 
            onClick={() => { clearAuthSession(); router.push("/today"); }}
            className="px-8 py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
          >
            Enter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-slate-900">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-rose-900 via-slate-900 to-purple-900">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/90 via-slate-900/80 to-slate-900/60" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl" />
          
          <div className="relative">
            <div className="w-72 h-72 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
              <span className="text-8xl font-bold text-white">T</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl">⚔</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">TERANGA</h2>
            <p className="text-rose-400">Power Your Startup</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Welcome back</h2>
            <p className="text-slate-400 text-lg">Sign in to your cockpit</p>
          </div>

          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-white">TERANGA</h1>
          </div>
          
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="Enter your email"
                className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 pr-14 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:bg-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {loginForm.password.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: "8+ chars", test: (p: string) => p.length >= 8 },
                    { label: "A-Z", test: (p: string) => /[A-Z]/.test(p) },
                    { label: "a-z", test: (p: string) => /[a-z]/.test(p) },
                    { label: "0-9", test: (p: string) => /[0-9]/.test(p) },
                    { label: "!@#$", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
                  ].map((req) => (
                    <span 
                      key={req.label}
                      className={`text-xs px-2 py-1 rounded ${
                        req.test(loginForm.password) 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-slate-700 text-slate-500"
                      }`}
                    >
                      {req.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading || !isPasswordValid || !loginForm.email}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}