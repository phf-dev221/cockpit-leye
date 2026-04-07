"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionContainer } from "@/components/ui/section-container";
import { authApi } from "@/features/auth/services/auth-api";
import { getAuthSession } from "@/features/auth/services/auth-session";
import { googleCalendarApi, type GoogleCalendarStatus } from "@/features/integrations/services/google-calendar-api";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { workspaceApi } from "@/features/workspaces/services/workspace-api";

const inviteRoleOptions = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage le workspace, les membres et les projets."
  },
  {
    value: "editor",
    label: "Editor",
    description: "Contribue aux projets et modifie le contenu."
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Consulte le workspace sans modifier le contenu."
  }
] as const;

export function AccountSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const session = getAuthSession();
  const { activeWorkspace, refresh } = useWorkspaces();
  const [form, setForm] = useState({
    fullName: session?.user?.full_name ?? "",
    email: session?.user?.email ?? "",
    timezone: session?.user?.timezone ?? "Africa/Dakar",
    locale: session?.user?.locale ?? "fr",
    avatarUrl: session?.user?.avatar_url ?? ""
  });
  const [workspaceForm, setWorkspaceForm] = useState({
    name: ""
  });
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "editor"
  });
  const [acceptInviteForm, setAcceptInviteForm] = useState({
    token: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isAcceptingInvitation, setIsAcceptingInvitation] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void authApi
      .me()
      .then((user) => {
        if (cancelled || !user) {
          return;
        }

        setForm({
          fullName: user.full_name ?? "",
          email: user.email ?? "",
          timezone: user.timezone ?? "Africa/Dakar",
          locale: user.locale ?? "fr",
          avatarUrl: user.avatar_url ?? ""
        });
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Impossible de charger le compte.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void googleCalendarApi
      .getStatus()
      .then((status) => {
        if (!cancelled) {
          setGoogleStatus(status);
        }
      })
      .catch((caughtError) => {
        if (!cancelled) {
          setGoogleError(caughtError instanceof Error ? caughtError.message : "Impossible de charger Google Calendar.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsGoogleLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      return;
    }

    setIsGoogleConnecting(true);
    setGoogleError(null);

    void googleCalendarApi
      .connect({ code, workspace_id: activeWorkspace?.id ? String(activeWorkspace.id) : null })
      .then(() => googleCalendarApi.getStatus())
      .then((status) => {
        setGoogleStatus(status);
        router.replace("/account");
      })
      .catch((caughtError) => {
        setGoogleError(caughtError instanceof Error ? caughtError.message : "Impossible de connecter Google Calendar.");
      })
      .finally(() => {
        setIsGoogleConnecting(false);
      });
  }, [activeWorkspace?.id, router, searchParams]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.updateProfile({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        timezone: form.timezone.trim() || null,
        locale: form.locale.trim() || null,
        avatar_url: form.avatarUrl.trim() || null
      });

      setMessage("Compte mis a jour.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Impossible de mettre a jour le compte.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarError(null);
    setIsUploadingAvatar(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
      const token = getAuthSession()?.token ?? "";

      const signatureResponse = await fetch(`${baseUrl}/api/files/cloudinary/signature`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include"
      });

      if (!signatureResponse.ok) {
        throw new Error("Le service d'upload avatar n'est pas disponible.");
      }

      const signaturePayload = (await signatureResponse.json()) as {
        timestamp: number;
        folder: string;
        api_key: string;
        cloud_name: string;
        upload_preset?: string | null;
        signature: string;
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.api_key);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("folder", signaturePayload.folder);
      formData.append("signature", signaturePayload.signature);

      if (signaturePayload.upload_preset) {
        formData.append("upload_preset", signaturePayload.upload_preset);
      }

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signaturePayload.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Impossible d'uploader la photo.");
      }

      const uploadPayload = (await uploadResponse.json()) as { secure_url?: string };

      if (!uploadPayload.secure_url) {
        throw new Error("La photo n'a pas ete retournee apres upload.");
      }

      setForm((current) => ({
        ...current,
        avatarUrl: uploadPayload.secure_url ?? ""
      }));
    } catch (caughtError) {
      setAvatarError(caughtError instanceof Error ? caughtError.message : "Impossible d'uploader la photo.");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  }

  async function handleCreateWorkspace() {
    setIsCreatingWorkspace(true);
    setWorkspaceError(null);
    setWorkspaceMessage(null);

    try {
      const workspace = await workspaceApi.createWorkspace({
        name: workspaceForm.name.trim(),
        default_timezone: form.timezone.trim() || "Africa/Dakar",
        default_currency: "XOF"
      });

      setWorkspaceMessage(`Workspace "${workspace.name}" cree.`);
      setWorkspaceForm({ name: "" });
      await refresh();
    } catch (caughtError) {
      setWorkspaceError(caughtError instanceof Error ? caughtError.message : "Impossible de creer le workspace.");
    } finally {
      setIsCreatingWorkspace(false);
    }
  }

  async function handleInvite() {
    if (!activeWorkspace?.id) {
      setInviteError("Aucun workspace actif.");
      return;
    }

    setIsInviting(true);
    setInviteError(null);
    setInviteMessage(null);
    setInviteToken(null);

    try {
      const response = await workspaceApi.inviteMember(String(activeWorkspace.id), {
        email: inviteForm.email.trim(),
        role: inviteForm.role
      });

      setInviteMessage(`Invitation creee pour ${inviteForm.email.trim()}.`);
      setInviteToken(response.invitation_token ?? null);
      setInviteForm((current) => ({ ...current, email: "" }));
    } catch (caughtError) {
      setInviteError(caughtError instanceof Error ? caughtError.message : "Impossible de creer l'invitation.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleAcceptInvitation() {
    setIsAcceptingInvitation(true);
    setAcceptError(null);
    setAcceptMessage(null);

    try {
      await authApi.acceptInvitation({
        token: acceptInviteForm.token.trim()
      });

      setAcceptMessage("Invitation acceptee et workspace ajoute au compte.");
      setAcceptInviteForm({ token: "" });
      await refresh();
    } catch (caughtError) {
      setAcceptError(caughtError instanceof Error ? caughtError.message : "Impossible d'accepter l'invitation.");
    } finally {
      setIsAcceptingInvitation(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } finally {
      router.replace("/login");
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  async function handleGoogleConnect() {
    setGoogleError(null);
    setIsGoogleConnecting(true);

    try {
      const response = await googleCalendarApi.connect({
        workspace_id: activeWorkspace?.id ? String(activeWorkspace.id) : null
      });

      if (response.authorization_url) {
        window.location.href = response.authorization_url;
        return;
      }

      const status = await googleCalendarApi.getStatus();
      setGoogleStatus(status);
    } catch (caughtError) {
      setGoogleError(caughtError instanceof Error ? caughtError.message : "Impossible de connecter Google Calendar.");
    } finally {
      setIsGoogleConnecting(false);
    }
  }

  async function handleGoogleSync() {
    if (!googleStatus?.connection_id) {
      return;
    }

    setGoogleError(null);
    setIsGoogleSyncing(true);

    try {
      await googleCalendarApi.sync(googleStatus.connection_id);
      const status = await googleCalendarApi.getStatus();
      setGoogleStatus(status);
    } catch (caughtError) {
      setGoogleError(caughtError instanceof Error ? caughtError.message : "Impossible de synchroniser Google Calendar.");
    } finally {
      setIsGoogleSyncing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Account Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Mon compte</h1>
        <p className="mt-2 text-sm leading-7 text-ink/65">
          Mettez a jour vos informations de connexion et de profil sans toucher aux donnees workspace.
        </p>
        <div className="mt-4">
          <Button variant="ghost" className="border border-ink/10 bg-white text-ink" onClick={() => void handleLogout()} disabled={isLoggingOut}>
            {isLoggingOut ? "Deconnexion..." : "Se deconnecter"}
          </Button>
        </div>
      </div>

      <SectionContainer
        eyebrow="User Profile"
        title="Informations personnelles"
        description="Ce formulaire met a jour le compte connecte utilise par le cockpit."
        className="bg-white"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Nom complet"
          />
          <Input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            type="email"
          />
          <Input
            value={form.timezone}
            onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
            placeholder="Timezone"
          />
          <Input
            value={form.locale}
            onChange={(event) => setForm((current) => ({ ...current, locale: event.target.value }))}
            placeholder="Locale"
          />
          <div className="md:col-span-2">
            <div className="rounded-[1.5rem] border border-ink/10 bg-[#faf7f1] p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-white">
                  {form.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-ink/40">No photo</span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink">Photo de profil</p>
                  <p className="text-sm leading-6 text-ink/62">
                    Upload ton image directement au lieu de coller une URL.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      className="border border-ink/10 bg-white text-ink"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? "Upload..." : "Uploader une photo"}
                    </Button>
                    {form.avatarUrl ? (
                      <Button
                        variant="ghost"
                        className="border border-ink/10 bg-white text-ink"
                        onClick={() => setForm((current) => ({ ...current, avatarUrl: "" }))}
                        disabled={isUploadingAvatar}
                      >
                        Retirer la photo
                      </Button>
                    ) : null}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void handleAvatarUpload(event)}
                  />
                </div>
              </div>
              {avatarError ? <p className="mt-3 text-sm text-rose-600">{avatarError}</p> : null}
            </div>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving || !form.fullName.trim() || !form.email.trim()}
          >
            {isSaving ? "Saving..." : "Save account"}
          </Button>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Secured Access"
        title="Create Access"
        description="Ces actions sont disponibles uniquement apres connexion. Cree un workspace ou genere un acces invite pour le workspace actif."
        className="bg-white"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-ink/10 p-5">
            <div>
              <p className="text-sm font-medium text-ink">Nouveau workspace</p>
              <p className="mt-1 text-sm leading-6 text-ink/65">
                Utilise cette action pour creer un nouvel espace de travail depuis le dashboard.
              </p>
            </div>
            <Input
              value={workspaceForm.name}
              onChange={(event) => setWorkspaceForm({ name: event.target.value })}
              placeholder="Nom du workspace"
            />
            {workspaceError ? <p className="text-sm text-rose-600">{workspaceError}</p> : null}
            {workspaceMessage ? <p className="text-sm text-emerald-700">{workspaceMessage}</p> : null}
            <Button
              onClick={() => void handleCreateWorkspace()}
              disabled={isCreatingWorkspace || !workspaceForm.name.trim()}
            >
              {isCreatingWorkspace ? "Creation..." : "Create access"}
            </Button>
          </div>

          <div className="space-y-4 rounded-3xl border border-ink/10 p-5">
            <div>
              <p className="text-sm font-medium text-ink">Invitation securisee</p>
              <p className="mt-1 text-sm leading-6 text-ink/65">
                Invite un membre dans le workspace actif{activeWorkspace ? ` : ${activeWorkspace.name}` : ""}.
              </p>
            </div>
            <Input
              value={inviteForm.email}
              onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email du membre"
              type="email"
            />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Role d'acces</p>
              <div className="grid gap-3">
                {inviteRoleOptions.map((roleOption) => {
                  const selected = inviteForm.role === roleOption.value;

                  return (
                    <button
                      key={roleOption.value}
                      type="button"
                      onClick={() => setInviteForm((current) => ({ ...current, role: roleOption.value }))}
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        selected
                          ? "border-ink bg-ink text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)]"
                          : "border-ink/10 bg-[#f8f5ef] text-ink hover:border-ink/20 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${selected ? "text-white" : "text-ink"}`}>
                            {roleOption.label}
                          </p>
                          <p className={`mt-1 text-sm leading-6 ${selected ? "text-white/72" : "text-ink/62"}`}>
                            {roleOption.description}
                          </p>
                        </div>
                        <span
                          className={`mt-1 h-4 w-4 rounded-full border ${
                            selected ? "border-white bg-white" : "border-ink/20 bg-transparent"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {inviteError ? <p className="text-sm text-rose-600">{inviteError}</p> : null}
            {inviteMessage ? <p className="text-sm text-emerald-700">{inviteMessage}</p> : null}
            {inviteToken ? (
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Token d'invitation : <span className="break-all font-mono">{inviteToken}</span>
              </div>
            ) : null}
            <Button
              onClick={() => void handleInvite()}
              disabled={isInviting || !inviteForm.email.trim() || !activeWorkspace?.id}
            >
              {isInviting ? "Invitation..." : "Generate invitation"}
            </Button>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Secured Access"
        title="Invitation"
        description="Accepte ici un token d'invitation depuis un compte deja connecte pour ajouter un workspace a ton acces."
        className="bg-white"
      >
        <div className="space-y-4">
          <Input
            value={acceptInviteForm.token}
            onChange={(event) => setAcceptInviteForm({ token: event.target.value })}
            placeholder="Invitation token"
          />
          {acceptError ? <p className="text-sm text-rose-600">{acceptError}</p> : null}
          {acceptMessage ? <p className="text-sm text-emerald-700">{acceptMessage}</p> : null}
          <div className="flex justify-end">
            <Button
              onClick={() => void handleAcceptInvitation()}
              disabled={isAcceptingInvitation || !acceptInviteForm.token.trim()}
            >
              {isAcceptingInvitation ? "Validation..." : "Accept invitation"}
            </Button>
          </div>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Calendar"
        title="Google Calendar"
        description="Connecte ton Google Calendar, lance une synchronisation, puis retrouve ici les evenements du jour."
        className="bg-white"
      >
        <div className="space-y-4">
          <div className="rounded-[1.4rem] border border-ink/10 bg-[#faf7f1] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {isGoogleLoading
                    ? "Chargement..."
                    : googleStatus?.calendar_label
                      ? `Connecte a ${googleStatus.calendar_label}`
                      : "Aucune connexion Google Calendar"}
                </p>
                <p className="mt-1 text-sm leading-6 text-ink/62">
                  {googleStatus?.last_synced_at
                    ? `Derniere synchronisation: ${new Date(googleStatus.last_synced_at).toLocaleString()}`
                    : "Connecte ton calendrier pour recuperer tes evenements du jour."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void handleGoogleConnect()} disabled={isGoogleConnecting || isGoogleLoading}>
                  {isGoogleConnecting ? "Connexion..." : googleStatus?.connection_id ? "Reconnecter Google" : "Connecter Google Calendar"}
                </Button>
                {googleStatus?.connection_id ? (
                  <Button variant="ghost" className="border border-ink/10 bg-white text-ink" onClick={() => void handleGoogleSync()} disabled={isGoogleSyncing}>
                    {isGoogleSyncing ? "Sync..." : "Synchroniser maintenant"}
                  </Button>
                ) : null}
              </div>
            </div>
            {googleError ? <p className="mt-3 text-sm text-rose-600">{googleError}</p> : null}
            {googleStatus?.message ? <p className="mt-3 text-sm text-amber-700">{googleStatus.message}</p> : null}
          </div>

          <div className="grid gap-3">
            {(googleStatus?.recent_events ?? [])
              .filter((event) => {
                if (!event.starts_at) {
                  return false;
                }

                const date = new Date(event.starts_at);
                const now = new Date();

                return (
                  date.getFullYear() === now.getFullYear() &&
                  date.getMonth() === now.getMonth() &&
                  date.getDate() === now.getDate()
                );
              })
              .map((event) => (
                <div key={event.external_event_id ?? `${event.title}-${event.starts_at}`} className="rounded-[1.2rem] border border-ink/10 bg-white p-4">
                  <p className="text-sm font-semibold text-ink">{event.title}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {event.starts_at ? new Date(event.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    {event.ends_at
                      ? ` - ${new Date(event.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                  </p>
                </div>
              ))}

            {!isGoogleLoading &&
            (googleStatus?.recent_events ?? []).filter((event) => {
              if (!event.starts_at) {
                return false;
              }

              const date = new Date(event.starts_at);
              const now = new Date();

              return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate()
              );
            }).length === 0 ? (
              <div className="rounded-[1.2rem] border border-dashed border-ink/10 bg-[#faf7f1] p-4 text-sm text-ink/62">
                Aucun evenement Google Calendar trouve pour aujourd'hui.
              </div>
            ) : null}
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
