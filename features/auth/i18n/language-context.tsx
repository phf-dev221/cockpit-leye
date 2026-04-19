"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

type Language = "en";

interface Translations {
  login: {
    welcome: string;
    welcomeSubtitle: string;
    signIn: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    signingIn: string;
    or: string;
    useVoice: string;
    voiceLogin: string;
    voiceSubtitle: string;
    backToEmail: string;
    pressToSpeak: string;
    listening: string;
    speakNow: string;
    verifying: string;
    voiceRecognized: string;
    error: string;
    retry: string;
    cancel: string;
  };
  auth: {
    secure: string;
    privacy: string;
  };
}

const translations: Translations = {
  login: {
    welcome: "Welcome back",
    welcomeSubtitle: "Sign in to access your cockpit",
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "********",
    signingIn: "Signing in...",
    or: "Or",
    useVoice: "Use my voice",
    voiceLogin: "Voice Login",
    voiceSubtitle: "Say your passphrase to sign in",
    backToEmail: "Back to email",
    pressToSpeak: "Press and speak",
    listening: "Listening... Speak now",
    speakNow: "Press to stop",
    verifying: "Verifying...",
    voiceRecognized: "Voice recognized",
    error: "Click to retry",
    retry: "Record again",
    cancel: "Cancel",
  },
  auth: {
    secure: "Secure",
    privacy: "Privacy",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value = useMemo<LanguageContextType>(
    () => ({
      language: "en",
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translations,
    }),
    []
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
