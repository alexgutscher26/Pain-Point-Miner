"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Shield, SlidersHorizontal, User2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut } from "@/lib/auth-client";

export interface SettingsFormValues {
  fullName: string;
  email: string;
  company: string;
  role: string;
  weeklyDigest: boolean;
  scanCompletionAlerts: boolean;
  billingNotifications: boolean;
  defaultSubredditCount: number;
  minimumOpportunityScore: number;
  defaultLocale: string;
}

export function SettingsPageClient({
  initialValues,
}: {
  initialValues: SettingsFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<SettingsFormValues>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isRevokingToken, setIsRevokingToken] = useState<string | null>(null);
  const [sessions, setSessions] = useState<
    Array<{
      token: string;
      createdAt: string;
      expiresAt: string;
      ipAddress: string | null;
      userAgent: string | null;
    }>
  >([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      company: values.company.trim(),
      role: values.role.trim(),
      defaultLocale: values.defaultLocale.trim(),
    };

    if (!payload.fullName) {
      setErrorMessage("Full name is required.");
      toast.error("Full name is required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const fallbackMessage = "Unable to update settings.";
        const responseText = await response.text();
        let message = fallbackMessage;
        if (responseText) {
          try {
            const parsed = JSON.parse(responseText) as { message?: string };
            if (parsed.message) {
              message = parsed.message;
            }
          } catch {
            message = fallbackMessage;
          }
        }
        throw new Error(message);
      }

      const updated = (await response.json()) as SettingsFormValues;
      setValues(updated);
      toast.success("Settings saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update settings.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "DELETE" || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (!response.ok) {
        const fallbackMessage = "Unable to delete account.";
        const responseText = await response.text();
        let message = fallbackMessage;
        if (responseText) {
          try {
            const parsed = JSON.parse(responseText) as { message?: string };
            if (parsed.message) {
              message = parsed.message;
            }
          } catch {
            message = fallbackMessage;
          }
        }
        throw new Error(message);
      }

      toast.success("Account deleted.");
      await signOut().catch(() => undefined);
      router.replace("/sign-in");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete account.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleChangePassword() {
    if (isChangingPassword) return;

    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error("Current password and new password are required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New password confirmation does not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions,
        }),
      });

      if (!response.ok) {
        const fallbackMessage = "Unable to change password.";
        const responseText = await response.text();
        let message = fallbackMessage;
        if (responseText) {
          try {
            const parsed = JSON.parse(responseText) as {
              message?: string;
              error?: string;
            };
            message = parsed.message || parsed.error || fallbackMessage;
          } catch {
            message = fallbackMessage;
          }
        }
        throw new Error(message);
      }

      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangePasswordOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to change password.";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function loadSessions() {
    setIsLoadingSessions(true);
    try {
      const response = await fetch("/api/auth/list-sessions", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Unable to fetch sessions.");
      }

      const payload = (await response.json()) as unknown;
      const parsedSessions = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { data?: unknown[] })?.data)
          ? ((payload as { data: unknown[] }).data ?? [])
          : [];

      const normalized = parsedSessions
        .map((item) => item as Record<string, unknown>)
        .filter((item) => typeof item.token === "string")
        .map((item) => ({
          token: String(item.token),
          createdAt: String(item.createdAt ?? ""),
          expiresAt: String(item.expiresAt ?? ""),
          ipAddress: item.ipAddress ? String(item.ipAddress) : null,
          userAgent: item.userAgent ? String(item.userAgent) : null,
        }));

      setSessions(normalized);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch sessions.";
      toast.error(message);
    } finally {
      setIsLoadingSessions(false);
    }
  }

  async function handleRevokeSession(token: string) {
    if (!token || isRevokingToken) return;

    setIsRevokingToken(token);
    try {
      const response = await fetch("/api/auth/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Unable to revoke session.");
      }

      setSessions((prev) => prev.filter((session) => session.token !== token));
      toast.success("Session revoked.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to revoke session.";
      toast.error(message);
    } finally {
      setIsRevokingToken(null);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#ff4500]" />
            <p className="text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">
              Dashboard Settings
            </p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
            Settings
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Manage your account preferences, notifications, and scan defaults.
          </p>
        </div>
        <button
          type="submit"
          form="settings-form"
          disabled={isSaving}
          className="bg-[#ff4500] hover:bg-[#e63e00] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-[0.15em] transition-colors inline-flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-[#111] rounded-[28px] border border-white/5 p-6 md:p-8 shadow-2xl">
            <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2.5 mb-6">
              <User2 className="w-5 h-5 text-[#ff4500]" />
              Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={values.fullName}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, fullName: value }))
                }
              />
              <Field
                label="Email"
                type="email"
                value={values.email}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, email: value }))
                }
              />
              <Field
                label="Company"
                value={values.company}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, company: value }))
                }
              />
              <Field
                label="Role"
                value={values.role}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, role: value }))
                }
              />
            </div>
          </section>

          <section className="bg-[#111] rounded-[28px] border border-white/5 p-6 shadow-2xl">
            <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2.5 mb-5">
              <Shield className="w-5 h-5 text-[#ff4500]" />
              Security
            </h3>
            <div className="space-y-3">
              <ActionButton
                label="Change Password"
                onClick={() => setIsChangePasswordOpen(true)}
              />
              <ActionButton
                label="View Active Sessions"
                onClick={() => {
                  setIsSessionsOpen(true);
                  void loadSessions();
                }}
              />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-[#111] rounded-[28px] border border-white/5 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-[#ff4500]" />
                Notifications
              </h3>
              <span className="px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-[0.15em]">
                Coming Soon
              </span>
            </div>
            <fieldset
              disabled
              className="space-y-4 opacity-60 pointer-events-none"
            >
              <ToggleRow
                title="Weekly market digest"
                description="Receive top trends and highest-value pain points every Monday."
                checked={values.weeklyDigest}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({ ...prev, weeklyDigest: checked }))
                }
              />
              <ToggleRow
                title="Scan completion alerts"
                description="Get notified when your background analysis is complete."
                checked={values.scanCompletionAlerts}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    scanCompletionAlerts: checked,
                  }))
                }
              />
              <ToggleRow
                title="Billing notifications"
                description="Receive invoices and plan usage alerts."
                checked={values.billingNotifications}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    billingNotifications: checked,
                  }))
                }
              />
            </fieldset>
          </section>

          <section className="bg-[#111] rounded-[28px] border border-white/5 p-6 md:p-8 shadow-2xl">
            <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2.5 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-[#ff4500]" />
              Scan Defaults
            </h3>
            <div className="space-y-4">
              <Field
                label="Default Subreddit Count"
                type="number"
                min={1}
                max={25}
                value={values.defaultSubredditCount.toString()}
                onChange={(value) =>
                  setValues((prev) => ({
                    ...prev,
                    defaultSubredditCount: clampNumber(
                      value,
                      1,
                      25,
                      prev.defaultSubredditCount,
                    ),
                  }))
                }
              />
              <Field
                label="Minimum Opportunity Score"
                type="number"
                min={0}
                max={100}
                value={values.minimumOpportunityScore.toString()}
                onChange={(value) =>
                  setValues((prev) => ({
                    ...prev,
                    minimumOpportunityScore: clampNumber(
                      value,
                      0,
                      100,
                      prev.minimumOpportunityScore,
                    ),
                  }))
                }
              />
              <Field
                label="Default Locale"
                value={values.defaultLocale}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, defaultLocale: value }))
                }
              />
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              Need higher limits?{" "}
              <Link
                href="/dashboard/billing"
                className="text-[#ff4500] hover:text-[#ff6d33] font-bold"
              >
                Upgrade your plan
              </Link>
              .
            </p>
          </section>
        </div>
      </form>

      <section className="bg-[#111] rounded-[28px] border border-rose-500/30 p-6 md:p-8 shadow-2xl">
        <h3 className="text-rose-400 font-black text-lg tracking-tight mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-zinc-400 mb-5">
          Deleting your account removes all reports, scans, and team workspaces
          permanently.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-[0.15em] transition-colors"
            >
              Delete Account
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#0e0e0e] border border-rose-500/30 text-zinc-100">
            <AlertDialogHeader className="text-left place-items-start">
              <AlertDialogTitle className="text-rose-400 font-black">
                Delete your account?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This action is permanent and removes your account and all
                associated data. Type{" "}
                <span className="text-zinc-100 font-bold">DELETE</span> to
                continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Type DELETE"
              className="w-full h-11 rounded-xl border border-white/10 bg-black/30 text-sm text-zinc-100 px-3 outline-none focus:border-rose-500/60"
            />
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800"
                onClick={() => setDeleteConfirmation("")}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  void handleDeleteAccount();
                }}
                disabled={deleteConfirmation !== "DELETE" || isDeleting}
                className="bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="bg-[#0e0e0e] border border-white/10 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white font-black">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update your password. Use at least 8 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <Field
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Field
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
            />
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={revokeOtherSessions}
                onChange={(event) =>
                  setRevokeOtherSessions(event.target.checked)
                }
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-[#ff4500] focus:ring-[#ff4500]"
              />
              Revoke other active sessions
            </label>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleChangePassword()}
              disabled={isChangingPassword}
              className="rounded-lg bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e63e00] disabled:opacity-60"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionsOpen} onOpenChange={setIsSessionsOpen}>
        <DialogContent className="bg-[#0e0e0e] border border-white/10 text-zinc-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-black">
              Active Sessions
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Review and revoke active sessions for this account.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
            {isLoadingSessions ? (
              <div className="py-8 text-center text-zinc-500 text-sm">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm">
                No active sessions found.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.token}
                  className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {session.userAgent || "Unknown device"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      IP: {session.ipAddress || "Unknown"} | Started:{" "}
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Expires:{" "}
                      {session.expiresAt
                        ? new Date(session.expiresAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRevokeSession(session.token)}
                    disabled={isRevokingToken === session.token}
                    className="shrink-0 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
                  >
                    {isRevokingToken === session.token
                      ? "Revoking..."
                      : "Revoke"}
                  </button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                void loadSessions();
              }}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setIsSessionsOpen(false)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function clampNumber(
  value: string,
  min: number,
  max: number,
  fallback: number,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "password";
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full h-11 rounded-xl border border-white/10 bg-black/30 text-sm text-zinc-100 px-3 outline-none focus:border-[#ff4500]/60"
      />
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 cursor-pointer">
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-[#ff4500] focus:ring-[#ff4500]"
      />
    </label>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 hover:border-[#ff4500]/40 bg-black/20 hover:bg-black/40 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors"
    >
      {label}
    </button>
  );
}
