/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Key,
  Loader2,
  Shield,
  SlidersHorizontal,
  User2,
} from "lucide-react";
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

import {
  generateScoreExplanation,
  ScoringWeights,
  toOpportunityScore,
} from "@/lib/dashboard-metrics";
import { Slider } from "@/components/ui/slider";

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
  scoringWeights: ScoringWeights;
  customApiKey: string;
}

export function SettingsPageClient({
  initialValues,
  sampleOpportunities = [],
}: {
  initialValues: SettingsFormValues;
  sampleOpportunities?: any[];
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
      id: string;
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
      const response = await fetch("/api/auth/sessions");
      if (!response.ok) {
        throw new Error("Unable to fetch sessions.");
      }

      const sessionsData = (await response.json()) as Array<{
        id: string;
        createdAt: string | number | Date;
        expiresAt: string | number | Date;
        ipAddress: string | null;
        userAgent: string | null;
      }>;

      const normalized = sessionsData.map((item) => ({
        id: item.id,
        createdAt: new Date(item.createdAt).toISOString(),
        expiresAt: new Date(item.expiresAt).toISOString(),
        ipAddress: item.ipAddress || null,
        userAgent: item.userAgent || null,
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

  async function handleRevokeSession(sessionId: string) {
    if (!sessionId || isRevokingToken) return;

    setIsRevokingToken(sessionId);
    try {
      const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId }),
      });

      if (!response.ok) {
        throw new Error("Unable to revoke session.");
      }

      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
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
    <div className="mx-auto w-full max-w-5xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]" />
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Dashboard Settings
            </p>
          </div>
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-zinc-900">
            Settings
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            Manage your account preferences, notifications, and scan defaults.
          </p>
        </div>
        <button
          type="submit"
          form="settings-form"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#ff4500] px-6 py-2.5 font-mono text-[12px] font-black tracking-[0.15em] text-white uppercase shadow-sm transition-all hover:bg-[#e63e00] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-mono text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8 xl:col-span-2">
            <h3 className="mb-6 flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-900">
              <User2 className="h-5 w-5 text-[#ff4500]" />
              Profile
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <section className="rounded-2xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8">
            <h3 className="mb-5 flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-900">
              <Shield className="h-5 w-5 text-[#ff4500]" />
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

        {/* BYOK (Bring Your Own Key) Card */}
        <section className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#ff4500]" />
                <h3 className="text-lg font-black tracking-tight text-zinc-900">
                  BYOK — Bring Your Own AI Key (OpenRouter)
                </h3>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                  Bypass Plan Limits
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-zinc-500">
                Want unlimited mining without a monthly subscription? Add your
                personal{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#ff4500] hover:underline"
                >
                  OpenRouter API key
                </a>
                . All AI extraction and embedding costs will be billed directly
                to your OpenRouter account at cost (fractions of a cent per
                scan).
              </p>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <label className="block font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
              OpenRouter API Key
            </label>
            <div className="mt-2 flex gap-3">
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={values.customApiKey}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    customApiKey: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] focus:outline-none"
              />
              {values.customApiKey && (
                <button
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({ ...prev, customApiKey: "" }))
                  }
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-xs text-zinc-600 hover:bg-zinc-100"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Your key is encrypted in your personal settings and used strictly
              for your own mining runs.
            </p>
          </div>
        </section>

        <section className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8">
          <div className="absolute top-0 right-0 p-4">
            <span className="rounded-full border border-[#ff4500]/25 bg-[#ff4500]/5 px-2.5 py-1 font-mono text-[10px] font-black tracking-[0.15em] text-[#ff4500] uppercase">
              Pro Feature
            </span>
          </div>

          <h3 className="mb-2 flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-900">
            <SlidersHorizontal className="h-5 w-5 text-[#ff4500]" />
            Opportunity Scoring Engine
          </h3>
          <p className="mb-8 max-w-2xl text-sm text-zinc-500">
            Fine-tune the weights for the Opportunity Score. Changes are applied
            dynamically to all extracted insights.
          </p>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <WeightSlider
                label="Pain Intensity (w1)"
                value={values.scoringWeights.w1}
                description="How severe is the problem being described?"
                onChange={(v) =>
                  setValues((prev) => ({
                    ...prev,
                    scoringWeights: { ...prev.scoringWeights, w1: v },
                  }))
                }
              />
              <WeightSlider
                label="Monetization Score (w2)"
                value={values.scoringWeights.w2}
                description="Willingness to pay and budget indicators."
                onChange={(v) =>
                  setValues((prev) => ({
                    ...prev,
                    scoringWeights: { ...prev.scoringWeights, w2: v },
                  }))
                }
              />
              <WeightSlider
                label="Urgency (w3)"
                value={values.scoringWeights.w3}
                description="How soon does the user need a solution?"
                onChange={(v) =>
                  setValues((prev) => ({
                    ...prev,
                    scoringWeights: { ...prev.scoringWeights, w3: v },
                  }))
                }
              />
              <WeightSlider
                label="Market Maturity (w4)"
                value={values.scoringWeights.w4}
                description="Level of existing solution saturation."
                onChange={(v) =>
                  setValues((prev) => ({
                    ...prev,
                    scoringWeights: { ...prev.scoringWeights, w4: v },
                  }))
                }
              />

              <div className="border-t border-zinc-200/50 pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                    Total Weight Sum
                  </p>
                  <p
                    className={`font-mono text-sm font-black ${
                      Math.abs(
                        values.scoringWeights.w1 +
                          values.scoringWeights.w2 +
                          values.scoringWeights.w3 +
                          values.scoringWeights.w4 -
                          1.0,
                      ) < 0.01
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {(
                      values.scoringWeights.w1 +
                      values.scoringWeights.w2 +
                      values.scoringWeights.w3 +
                      values.scoringWeights.w4
                    ).toFixed(2)}
                    / 1.00
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200/50 bg-white/30 p-6">
              <h4 className="mb-6 flex items-center gap-2 font-mono text-[11px] font-black tracking-widest text-zinc-400 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
                Live Opportunity Preview
              </h4>
              <div className="space-y-4">
                {sampleOpportunities.length === 0 ? (
                  <div className="py-12 text-center font-mono text-xs text-zinc-500">
                    No opportunities found to preview.
                  </div>
                ) : (
                  sampleOpportunities.map((opp) => {
                    const score = toOpportunityScore(
                      [opp],
                      values.scoringWeights,
                    );
                    const explanation = generateScoreExplanation(
                      opp,
                      values.scoringWeights,
                    );
                    return (
                      <div
                        key={opp.id}
                        className="border-zinc-150/40 space-y-3 rounded-xl border bg-white/50 p-4 shadow-sm transition-all hover:bg-white/80"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm leading-tight font-bold text-zinc-800">
                            {opp.title}
                          </p>
                          <span className="shrink-0 rounded-lg border border-[#ff4500]/25 bg-[#ff4500]/10 px-3 py-1 text-xl font-black text-[#ff4500]">
                            {score}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium text-zinc-500 italic">
                          &quot;{explanation}&quot;
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-900">
                <Bell className="h-5 w-5 text-[#ff4500]" />
                Notifications
              </h3>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-black tracking-[0.15em] text-amber-600 uppercase">
                Coming Soon
              </span>
            </div>
            <fieldset
              disabled
              className="pointer-events-none space-y-4 opacity-60"
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

          <section className="rounded-2xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8">
            <h3 className="mb-6 flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-900">
              <SlidersHorizontal className="h-5 w-5 text-[#ff4500]" />
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
            <p className="mt-4 font-mono text-xs text-zinc-400">
              Need higher limits?{" "}
              <Link
                href="/dashboard/billing"
                className="font-bold text-[#ff4500] hover:text-[#ff6d33]"
              >
                Upgrade your plan
              </Link>
              .
            </p>
          </section>
        </div>
      </form>

      <section className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-sm md:p-8">
        <h3 className="mb-2 text-lg font-black tracking-tight text-rose-600">
          Danger Zone
        </h3>
        <p className="mb-5 text-sm text-zinc-500">
          Deleting your account removes all reports, scans, and team workspaces
          permanently.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="rounded-xl border border-rose-200 bg-rose-600 px-5 py-2.5 font-mono text-[12px] font-black tracking-[0.15em] text-white uppercase transition-colors hover:bg-rose-500"
            >
              Delete Account
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md rounded-2xl border border-zinc-200/50 bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md">
            <AlertDialogHeader className="place-items-start text-left">
              <AlertDialogTitle className="font-black text-rose-600">
                Delete your account?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-550">
                This action is permanent and removes your account and all
                associated data. Type{" "}
                <span className="font-bold text-zinc-900">DELETE</span> to
                continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Type DELETE"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white/50 px-3 font-mono text-sm text-zinc-900 transition-all outline-none focus:border-rose-500"
            />
            <AlertDialogFooter>
              <AlertDialogCancel
                className="rounded-xl border border-zinc-200/50 bg-white text-zinc-700 hover:bg-zinc-50"
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
                className="rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
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
        <DialogContent className="max-w-md rounded-2xl border border-zinc-200/50 bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="font-black text-zinc-900">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
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
            <label className="text-zinc-650 flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={revokeOtherSessions}
                onChange={(event) =>
                  setRevokeOtherSessions(event.target.checked)
                }
                className="h-4 w-4 rounded border-zinc-300 bg-white text-[#ff4500] focus:ring-[#ff4500]"
              />
              Revoke other active sessions
            </label>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(false)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleChangePassword()}
              disabled={isChangingPassword}
              className="rounded-xl bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e63e00] disabled:opacity-60"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionsOpen} onOpenChange={setIsSessionsOpen}>
        <DialogContent className="rounded-2xl border border-zinc-200/50 bg-white/95 text-zinc-900 shadow-xl backdrop-blur-md sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-zinc-900">
              Active Sessions
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Review and revoke active sessions for this account.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {isLoadingSessions ? (
              <div className="text-zinc-550 py-8 text-center text-sm">
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-zinc-550 py-8 text-center text-sm">
                No active sessions found.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200/50 bg-white/45 p-4 transition-all hover:bg-white/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-800">
                      {session.userAgent || "Unknown device"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      IP: {session.ipAddress || "Unknown"} | Started:{" "}
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleString()
                        : "Unknown"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Expires:{" "}
                      {session.expiresAt
                        ? new Date(session.expiresAt).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleRevokeSession(session.id)}
                    disabled={isRevokingToken === session.id}
                    className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                  >
                    {isRevokingToken === session.id ? "Revoking..." : "Revoke"}
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
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setIsSessionsOpen(false)}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
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
      <span className="text-zinc-550 font-mono text-[11px] font-bold tracking-[0.14em] uppercase">
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-zinc-200/50 bg-white/40 px-3 text-sm text-zinc-900 transition-all outline-none placeholder:text-zinc-400 focus:border-[#ff4500] focus:ring-4 focus:ring-[#ff4500]/10"
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-zinc-200/50 bg-white/40 p-4 transition-all hover:bg-white/60">
      <div>
        <p className="text-sm font-bold text-zinc-800">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-300 bg-white text-[#ff4500] focus:ring-[#ff4500]"
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
      className="w-full rounded-xl border border-zinc-200/50 bg-white/40 px-4 py-3 text-left font-mono text-sm font-semibold tracking-wide text-zinc-800 uppercase transition-all hover:border-[#ff4500] hover:bg-white/80 hover:text-zinc-900"
    >
      {label}
    </button>
  );
}

function WeightSlider({
  label,
  value,
  description,
  onChange,
}: {
  label: string;
  value: number;
  description: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] leading-none font-bold tracking-widest text-zinc-800 uppercase">
            {label}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">{description}</p>
        </div>
        <p className="font-mono text-xs font-black text-[#ff4500]">
          {(value * 100).toFixed(0)}%
        </p>
      </div>
      <Slider
        value={[value * 100]}
        max={100}
        step={5}
        onValueChange={(vals) => onChange(vals[0] / 100)}
        className="**:[[role=slider]]:border-[#ff4500] **:[[role=slider]]:bg-[#ff4500]"
      />
    </div>
  );
}
