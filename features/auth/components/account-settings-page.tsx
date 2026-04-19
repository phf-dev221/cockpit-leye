"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/services/auth-api";
import { getAuthSession, clearAuthSession } from "@/features/auth/services/auth-session";
import { googleCalendarApi, type GoogleCalendarStatus } from "@/features/integrations/services/google-calendar-api";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { workspaceApi, type WorkspaceMember } from "@/features/workspaces/services/workspace-api";

type Tab = "profile" | "team" | "workspaces" | "calendar" | "security";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "team", label: "Team" },
  { id: "workspaces", label: "Workspaces" },
  { id: "calendar", label: "Calendar" },
  { id: "security", label: "Security" },
];

const roleOptions = [
  { value: "owner", label: "Owner", desc: "Full control - can invite & remove members" },
  { value: "admin", label: "Admin", desc: "Manage workspace, members & projects" },
  { value: "editor", label: "Editor", desc: "Contribute & edit content" },
  { value: "viewer", label: "Viewer", desc: "View without editing" },
];

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-12 bg-slate-200 rounded-xl" />
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

export function AccountSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = getAuthSession();
  const { activeWorkspace, workspaces, activateWorkspace, refresh } = useWorkspaces();
  
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    timezone: "Africa/Dakar",
    locale: "en",
    avatarUrl: "",
  });

  const [inviteForm, setInviteForm] = useState({ email: "", role: "editor" });
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [createUserForm, setCreateUserForm] = useState({ fullName: "", email: "", password: "", role: "editor", workspaceId: "" });
  const [workspaceForm, setWorkspaceForm] = useState({ name: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    if (workspaces.length > 0 && !createUserForm.workspaceId) {
      setCreateUserForm(prev => ({
        ...prev,
        workspaceId: activeWorkspace?.id?.toString() || workspaces[0].id.toString()
      }));
    }
  }, [workspaces, activeWorkspace]);

  useEffect(() => {
    if (session?.user && !formLoaded) {
      setForm({
        fullName: session.user.full_name || "",
        email: session.user.email || "",
        timezone: session.user.timezone || "Africa/Dakar",
        locale: session.user.locale || "en",
        avatarUrl: session.user.avatar_url || "",
      });
      setFormLoaded(true);
    }
  }, [session, formLoaded]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("One special character");
    return errors;
  };

  const checkPasswordRequirement = (password: string, requirement: string): boolean => {
    if (requirement === "At least 8 characters") return password.length >= 8;
    if (requirement === "One uppercase letter") return /[A-Z]/.test(password);
    if (requirement === "One lowercase letter") return /[a-z]/.test(password);
    if (requirement === "One number") return /[0-9]/.test(password);
    if (requirement === "One special character") return /[^A-Za-z0-9]/.test(password);
    return false;
  };
  
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleConnecting, setGoogleConnecting] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      const members = await workspaceApi.getMembers(String(activeWorkspace.id));
      setMembers(members);
    } catch (e) {
      console.error("Error loading members:", e);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    setGoogleConnecting(true);
    googleCalendarApi.connect({ code, workspace_id: activeWorkspace?.id ? String(activeWorkspace.id) : null })
      .then(() => googleCalendarApi.getStatus())
      .then(setGoogleStatus)
      .catch(console.error)
      .finally(() => {
        setGoogleConnecting(false);
        router.replace("/account");
      });
  }, [searchParams, activeWorkspace?.id, router]);

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);
    try {
      await authApi.updateProfile({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        timezone: form.timezone.trim() || null,
        locale: form.locale.trim() || null,
        avatar_url: form.avatarUrl.trim() || null,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateWorkspace() {
    if (!workspaceForm.name.trim()) return;
    
    setSaving(true);
    setMessage(null);
    try {
      await workspaceApi.createWorkspace({
        name: workspaceForm.name.trim(),
        default_timezone: "Africa/Dakar",
        default_currency: "XOF"
      });
      setMessage({ type: "success", text: `Workspace "${workspaceForm.name}" created!` });
      setWorkspaceForm({ name: "" });
      window.location.reload();
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to create workspace" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateUser() {
    if (!createUserForm.workspaceId || !createUserForm.email.trim() || !createUserForm.password.trim() || !createUserForm.fullName.trim()) return;
    
    const passwordErrors = validatePassword(createUserForm.password);
    if (passwordErrors.length > 0) {
      setMessage({ type: "error", text: "Password does not meet requirements" });
      return;
    }
    
    // Check if email already exists in members
    const isAlreadyMember = members.some(m => m.user.email.toLowerCase() === createUserForm.email.trim().toLowerCase());
    if (isAlreadyMember) {
      setMessage({ type: "error", text: "This user is already a member of this workspace" });
      return;
    }
    
    const selectedWorkspace = workspaces.find(w => w.id.toString() === createUserForm.workspaceId);
    if (!selectedWorkspace) return;
    
    setSaving(true);
    setMessage(null);
    try {
      
      await workspaceApi.addMember(selectedWorkspace.id.toString(), {
        email: createUserForm.email.trim(),
        role: createUserForm.role,
        full_name: createUserForm.fullName.trim(),
        password: createUserForm.password,
      });
      
      setMessage({ type: "success", text: `User "${createUserForm.email}" created and added to workspace ${selectedWorkspace.name}!` });
      setCreateUserForm({ fullName: "", email: "", password: "", role: "editor", workspaceId: selectedWorkspace.id.toString() });
      loadMembers();
      window.location.reload();
    } catch (e) {
      console.error("Create user error:", e);
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to create user" });
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite() {
    if (!activeWorkspace?.id || !inviteForm.email.trim()) return;
    
    setSaving(true);
    setMessage(null);
    try {
      const response = await workspaceApi.addMember(String(activeWorkspace.id), {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
      });
      setMessage({ type: "success", text: `${inviteForm.email} added as ${inviteForm.role}!` });
      setInviteForm({ email: "", role: "editor" });
      loadMembers();
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to add member. Make sure the email exists in the system." });
    } finally {
      setSaving(false);
    }
  }

  async function handleGoogleConnect() {
    if (googleStatus?.authorization_url) {
      window.location.href = googleStatus.authorization_url;
      return;
    }
    
    setGoogleConnecting(true);
    try {
      const result = await googleCalendarApi.connect({ 
        workspace_id: activeWorkspace?.id ? String(activeWorkspace.id) : null 
      });
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      }
    } catch (e) {
      setMessage({ type: "error", text: "Failed to connect Google Calendar" });
      setGoogleConnecting(false);
    }
  }

  async function handleGoogleSync() {
    if (!googleStatus?.connection_id) return;
    
    setSaving(true);
    try {
      await googleCalendarApi.sync(googleStatus.connection_id);
      const status = await googleCalendarApi.getStatus();
      setGoogleStatus(status);
      setMessage({ type: "success", text: "Calendar synced!" });
    } catch (e) {
      setMessage({ type: "error", text: "Failed to sync calendar" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-amber-100 text-amber-800",
      admin: "bg-purple-100 text-purple-800",
      editor: "bg-blue-100 text-blue-800",
      viewer: "bg-slate-100 text-slate-800",
    };
    return colors[role] || "bg-slate-100 text-slate-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f1] p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f1] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Settings</p>
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile, team, and integrations</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
                            <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Personal Information</h2>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {(form.avatarUrl && form.avatarUrl.length > 0) ? (
                    <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    form.fullName?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{(form.fullName && form.fullName.length > 0) ? form.fullName : "Your Name"}</p>
                  <p className="text-sm text-slate-500">{(form.email && form.email.length > 0) ? form.email : " "}</p>
                  <div className="flex gap-2 mt-3">
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Upload Photo
                  </Button>
                  {(form.avatarUrl && form.avatarUrl.length > 0) && (
                    <Button variant="secondary" onClick={() => setForm({ ...form, avatarUrl: "" })}>
                      Remove
                    </Button>
                  )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <Input
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    placeholder="Africa/Dakar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <Input
                    value={form.locale}
                    onChange={(e) => setForm({ ...form, locale: e.target.value })}
                    placeholder="en"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Danger Zone</h2>
              <p className="text-sm text-slate-500 mb-6">Sign out of your account on this device.</p>
              <Button variant="danger" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Team Members</h2>
              <p className="text-sm text-slate-500 mb-6">Manage your workspace team members.</p>
              
              <div className="space-y-3 mb-6">
                {members.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No team members yet.</p>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-medium">
                          {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.user.name || member.user.email}</p>
                          <p className="text-xs text-slate-500">{member.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Create New Team Member</h2>
              <p className="text-sm text-slate-500 mb-6">Create a new user and add them to the current workspace.</p>
              
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <Input
                      value={createUserForm.fullName}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <Input
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                      placeholder="john@example.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Input
                        value={createUserForm.password}
                        onChange={(e) => {
                          setCreateUserForm({ ...createUserForm, password: e.target.value });
                          setPasswordErrors(validatePassword(e.target.value));
                        }}
                        placeholder="Minimum 8 characters"
                        type={showPassword ? "text" : "password"}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {createUserForm.password.length > 0 && (
                      <div className="mt-2 text-xs space-y-1">
                        {["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number", "One special character"].map((req) => {
                          const met = checkPasswordRequirement(createUserForm.password, req);
                          return (
                            <p key={req} className={met ? "text-emerald-600" : "text-slate-400"}>
                              {met ? "✓" : "○"} {req}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Workspace <span className="text-red-500">*</span></label>
                    <select
                      value={createUserForm.workspaceId}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, workspaceId: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">Select workspace...</option>
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleCreateUser} disabled={saving || !createUserForm.workspaceId || !createUserForm.email.trim() || !createUserForm.password.trim() || !createUserForm.fullName.trim()}>
                  {saving ? "Creating..." : "Create & Invite User"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workspaces" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Create Workspace</h2>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Create New Workspace</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Workspace Name</label>
                    <Input
                      value={workspaceForm.name}
                      onChange={(e) => setWorkspaceForm({ name: e.target.value })}
                      placeholder="My Startup"
                    />
                  </div>
                  <Button onClick={handleCreateWorkspace} disabled={saving || !workspaceForm.name.trim()}>
                    {saving ? "Creating..." : "Create Workspace"}
                  </Button>
                </div>
              </div>
            </div>

            {activeWorkspace && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Workspace Overview</h2>
                <p className="text-sm text-slate-500 mb-6">{activeWorkspace.name}</p>
                
                <div className="grid gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase">Workspace ID</p>
                    <p className="text-sm font-medium text-slate-900">{activeWorkspace.id}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase">Members</p>
                    <p className="text-sm font-medium text-slate-900">{members.length}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 mb-3 mt-6">Workspace Members</h3>
                <div className="space-y-3">
                  {members.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4">No members yet.</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-medium">
                            {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{member.user.name || member.user.email}</p>
                            <p className="text-xs text-slate-500">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            </div>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Google Calendar</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {googleStatus?.calendar_label 
                      ? `Connected to ${googleStatus.calendar_label}` 
                      : "Connect to sync your events"}
                  </p>
                </div>
                <Button onClick={handleGoogleConnect} disabled={googleConnecting}>
                  {googleConnecting ? "Connecting..." : googleStatus?.connection_id ? "Reconnect" : "Connect"}
                </Button>
              </div>

              {googleStatus?.last_synced_at && (
                <p className="text-sm text-slate-500 mb-4">
                  Last synced: {new Date(googleStatus.last_synced_at).toLocaleString()}
                </p>
              )}

              {googleStatus?.connection_id && (
                <Button variant="secondary" onClick={handleGoogleSync} disabled={saving} className="mb-4">
                  {saving ? "Syncing..." : "Sync Now"}
                </Button>
              )}

              <div className="space-y-2">
                <h3 className="font-medium text-slate-900">Today's Events</h3>
                {(googleStatus?.recent_events ?? [])
                  .filter((e) => {
                    if (!e.starts_at) return false;
                    const d = new Date(e.starts_at);
                    const now = new Date();
                    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                  })
                  .map((event) => (
                    <div key={event.external_event_id} className="p-4 bg-slate-50 rounded-xl">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-500">
                        {event.starts_at && new Date(event.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {event.ends_at && ` - ${new Date(event.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                    </div>
                  ))}
                {(googleStatus?.recent_events ?? []).filter((e) => {
                  if (!e.starts_at) return false;
                  const d = new Date(e.starts_at);
                  const now = new Date();
                  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
                }).length === 0 && (
                  <p className="text-slate-400 text-sm py-4">No events for today.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Security</h2>
              <p className="text-sm text-slate-500 mb-6">Manage your password and security settings.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Password</p>
                      <p className="text-sm text-slate-500">Change your password to keep your account secure.</p>
                    </div>
                    <Button variant="secondary" onClick={() => {
                      const currentPassword = prompt("Enter current password:");
                      if (!currentPassword) return;
                      
                      let newPassword = prompt("Enter new password (min 8 chars, uppercase, lowercase, number, special):");
                      if (!newPassword) return;
                      
                      const errors = validatePassword(newPassword);
                      if (errors.length > 0) {
                        alert("Password must have:\n" + errors.join("\n"));
                        return;
                      }
                      
                      let confirmPassword = prompt("Confirm new password:");
                      if (!confirmPassword) return;
                      
                      if (newPassword !== confirmPassword) {
                        alert("Passwords do not match!");
                        return;
                      }
                      
                      authApi.changePassword({
                        current_password: currentPassword,
                        password: newPassword,
                        password_confirmation: confirmPassword
                      }).then(() => {
                        alert("Password changed successfully!");
                      }).catch((e) => {
                        alert("Failed to change password: " + e.message);
                      });
                    }}>Change Password</Button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                      <p className="text-xs text-emerald-600 mt-2">Status: Not enabled</p>
                    </div>
                    <Button variant="secondary" onClick={() => {
                      authApi.enable2FA().then((result) => {
                        if (result.secret) {
                          alert("2FA enabled! Secret: " + result.secret);
                        }
                      }).catch((e) => {
                        alert("Failed to enable 2FA: " + e.message);
                      });
                    }}>Enable 2FA</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
