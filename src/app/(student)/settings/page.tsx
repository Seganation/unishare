"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "~/hooks/use-session";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Pencil,
  Image,
  User,
  Mail,
  CreditCard,
  Bell,
  UserPlus,
} from "lucide-react";

export const AVATAR_COLORS = [
  { bg: "bg-red-500", text: "text-red-700" },
  { bg: "bg-blue-500", text: "text-blue-700" },
  { bg: "bg-green-500", text: "text-green-700" },
  { bg: "bg-purple-500", text: "text-purple-700" },
  { bg: "bg-orange-500", text: "text-orange-700" },
  { bg: "bg-pink-500", text: "text-pink-700" },
  { bg: "bg-indigo-500", text: "text-indigo-700" },
  { bg: "bg-teal-500", text: "text-teal-700" },
];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  // Fetch profile via TRPC
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = api.user.getProfile.useQuery();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Mutation to update profile
  const updateMutation = api.user.updateProfile.useMutation();
  const utils = api.useUtils();

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setAvatarIndex(profile.avatarIndex ?? 0);
    }
  }, [profile]);

  // Mocked upgrade state
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<"free" | "pro">("free");
  const [tab, setTab] = useState<
    "profile" | "billing" | "invitations" | "notifications"
  >((searchParams.get("tab") as any) ?? "profile");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({ name, avatarIndex });
      // Invalidate the profile query to refetch updated data
      await utils.user.getProfile.invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // TODO: call payment/upgrade API
      await new Promise((r) => setTimeout(r, 1000));
      setUpgradeTier("pro");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <nav className="space-y-2">
            <button
              onClick={() => setTab("profile")}
              className={
                "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-medium transition-colors " +
                (tab === "profile"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground")
              }
            >
              <User className="h-4 w-4" />
              General
            </button>

            <button
              onClick={() => setTab("billing")}
              className={
                "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-medium transition-colors " +
                (tab === "billing"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground")
              }
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </button>

            <button
              onClick={() => setTab("invitations")}
              className={
                "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-medium transition-colors " +
                (tab === "invitations"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground")
              }
            >
              <UserPlus className="h-4 w-4" />
              Invitations
            </button>

            <button
              onClick={() => setTab("notifications")}
              className={
                "flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left font-medium transition-colors " +
                (tab === "notifications"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground")
              }
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="md:col-span-3">
          {/* Small screen tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            <button
              onClick={() => setTab("profile")}
              className={
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap " +
                (tab === "profile" ? "bg-muted text-foreground" : "bg-card")
              }
            >
              General
            </button>
            <button
              onClick={() => setTab("billing")}
              className={
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap " +
                (tab === "billing" ? "bg-muted text-foreground" : "bg-card")
              }
            >
              Billing
            </button>
            <button
              onClick={() => setTab("invitations")}
              className={
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap " +
                (tab === "invitations" ? "bg-muted text-foreground" : "bg-card")
              }
            >
              Invitations
            </button>
            <button
              onClick={() => setTab("notifications")}
              className={
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap " +
                (tab === "notifications"
                  ? "bg-muted text-foreground"
                  : "bg-card")
              }
            >
              Notifications
            </button>
          </div>
          {tab === "profile" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Profile card */}
              <div className="bg-card col-span-1 rounded-lg border p-6">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`h-20 w-20 rounded-full ${AVATAR_COLORS[avatarIndex]?.bg ?? AVATAR_COLORS[0]?.bg ?? "bg-gray-500"} flex items-center justify-center text-3xl font-bold text-white`}
                  >
                    {name.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{name || "User Name"}</p>
                    <p className="text-muted-foreground text-sm">
                      Student • {upgradeTier === "free" ? "Free" : "Pro"}
                    </p>
                  </div>

                  <div className="w-full">
                    <label className="mb-3 block text-sm font-medium">
                      Choose Avatar Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_COLORS.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAvatarIndex(idx)}
                          className={`h-10 w-10 rounded-full ${AVATAR_COLORS[idx]?.bg ?? "bg-gray-500"} transition-transform ${
                            avatarIndex === idx
                              ? "ring-foreground scale-110 ring-2 ring-offset-2"
                              : "hover:scale-105"
                          }`}
                          aria-label={`Avatar color ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings form */}
              <div className="bg-card col-span-1 rounded-lg border p-6 md:col-span-2">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Full name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Input
                          value={email}
                          disabled
                          className="cursor-not-allowed pr-20 opacity-60"
                          placeholder="you@university.edu"
                        />
                        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-green-600 dark:text-green-500">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div className="bg-card relative rounded-lg border p-8">
              <div className="opacity-50 blur-sm">
                <h2 className="mb-4 text-lg font-semibold">Billing</h2>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Upgrade to Pro</p>
                      <p className="text-muted-foreground text-sm">
                        Unlock advanced AI credits, larger uploads
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {upgradeTier === "free" ? "Free" : "Pro"}
                      </div>
                      {upgradeTier === "free" ? (
                        <Button onClick={handleUpgrade} disabled={isUpgrading}>
                          {isUpgrading ? "Processing..." : "Upgrade"}
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          Active
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="font-semibold">Payment</p>
                    <p className="text-muted-foreground text-sm">
                      Manage saved cards and billing
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input placeholder="Cardholder name" />
                      <Input placeholder="Card number" />
                      <Button className="sm:w-auto">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Card
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="font-semibold">Danger Zone</p>
                    <p className="text-muted-foreground text-sm">
                      Delete your account and data
                    </p>
                    <div className="mt-3 flex justify-end">
                      <Button variant="destructive">Delete account</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                <div className="text-center">
                  <h2 className="mb-2 text-2xl font-bold text-white">
                    Coming Soon
                  </h2>
                  <p className="text-white/90">
                    Billing and subscription management features are coming
                    soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "invitations" && <InvitationsTab />}
          {tab === "notifications" && <NotificationsTab />}
        </main>
      </div>
    </div>
  );
}

// Invitations Tab Component
function InvitationsTab() {
  // Get pending course invitations
  const { data: courseInvitations = [], refetch: refetchCourse } =
    api.course.getPendingInvitations.useQuery();

  // Get pending timetable invitations
  const { data: timetableInvitations = [], refetch: refetchTimetable } =
    api.timetable.getPendingInvitations.useQuery();

  // Accept invitation mutations
  const acceptCourseMutation = api.course.acceptInvitation.useMutation({
    onSuccess: () => {
      void refetchCourse();
    },
  });

  const acceptTimetableMutation = api.timetable.acceptInvitation.useMutation({
    onSuccess: () => {
      void refetchTimetable();
    },
  });

  // Reject invitation mutations
  const rejectCourseMutation = api.course.rejectInvitation.useMutation({
    onSuccess: () => {
      void refetchCourse();
    },
  });

  const rejectTimetableMutation = api.timetable.rejectInvitation.useMutation({
    onSuccess: () => {
      void refetchTimetable();
    },
  });

  const allInvitations = [
    ...courseInvitations.map((inv) => ({ ...inv, type: "course" as const })),
    ...timetableInvitations.map((inv) => ({
      ...inv,
      type: "timetable" as const,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Invitations</h2>
        <p className="text-muted-foreground">
          Manage your collaboration invitations
        </p>
      </div>

      {allInvitations.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <UserPlus className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
          <p className="text-muted-foreground">No pending invitations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allInvitations.map((invitation) => (
            <div
              key={`${invitation.type}-${invitation.id}`}
              className="bg-card rounded-lg border p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                      {invitation.type === "course" ? "Course" : "Timetable"}
                    </span>
                    <span className="bg-secondary rounded-full px-3 py-1 text-xs font-medium">
                      {invitation.role}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">
                    {invitation.type === "course"
                      ? invitation.course.title
                      : invitation.timetable.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Invited by{" "}
                    {invitation.type === "course"
                      ? invitation.course.creator.name
                      : invitation.timetable.creator.name}{" "}
                    • {new Date(invitation.invitedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    onClick={() => {
                      if (invitation.type === "course") {
                        acceptCourseMutation.mutate({
                          courseId: invitation.courseId,
                        });
                      } else {
                        acceptTimetableMutation.mutate({
                          timetableId: invitation.timetableId,
                        });
                      }
                    }}
                    disabled={
                      acceptCourseMutation.isPending ||
                      acceptTimetableMutation.isPending
                    }
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (invitation.type === "course") {
                        rejectCourseMutation.mutate({
                          courseId: invitation.courseId,
                        });
                      } else {
                        rejectTimetableMutation.mutate({
                          timetableId: invitation.timetableId,
                        });
                      }
                    }}
                    disabled={
                      rejectCourseMutation.isPending ||
                      rejectTimetableMutation.isPending
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab() {
  const { data: preferences } = api.notification.getPreferences.useQuery();
  const updatePreferences = api.notification.updatePreferences.useMutation();

  const [formData, setFormData] = useState({
    inAppClassReminders: true,
    inAppCollaborationInvites: true,
    inAppAuditLogAlerts: true,
    inAppSystemNotifications: true,
    emailClassReminders: true,
    emailCollaborationInvites: true,
    emailAuditLogAlerts: true,
    emailSystemNotifications: true,
    classReminderMinutes: 10,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        inAppClassReminders: preferences.inAppClassReminders,
        inAppCollaborationInvites: preferences.inAppCollaborationInvites,
        inAppAuditLogAlerts: preferences.inAppAuditLogAlerts,
        inAppSystemNotifications: preferences.inAppSystemNotifications,
        emailClassReminders: preferences.emailClassReminders,
        emailCollaborationInvites: preferences.emailCollaborationInvites,
        emailAuditLogAlerts: preferences.emailAuditLogAlerts,
        emailSystemNotifications: preferences.emailSystemNotifications,
        classReminderMinutes: preferences.classReminderMinutes,
      });
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Manage how you receive notifications
        </p>
      </div>

      <div className="space-y-8">
        {/* In-App Notifications */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Class reminders</span>
              <input
                type="checkbox"
                checked={formData.inAppClassReminders}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inAppClassReminders: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Collaboration invites</span>
              <input
                type="checkbox"
                checked={formData.inAppCollaborationInvites}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inAppCollaborationInvites: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Audit log alerts</span>
              <input
                type="checkbox"
                checked={formData.inAppAuditLogAlerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inAppAuditLogAlerts: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>System notifications</span>
              <input
                type="checkbox"
                checked={formData.inAppSystemNotifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inAppSystemNotifications: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-5 w-5" />
            Email Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Class reminders</span>
              <input
                type="checkbox"
                checked={formData.emailClassReminders}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailClassReminders: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Collaboration invites</span>
              <input
                type="checkbox"
                checked={formData.emailCollaborationInvites}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailCollaborationInvites: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Audit log alerts</span>
              <input
                type="checkbox"
                checked={formData.emailAuditLogAlerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailAuditLogAlerts: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>System notifications</span>
              <input
                type="checkbox"
                checked={formData.emailSystemNotifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailSystemNotifications: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
          </div>
        </div>

        {/* Class Reminder Timing */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Reminder Timing</h3>
          <label className="block">
            <span className="mb-2 block text-sm">
              Send class reminders this many minutes before:
            </span>
            <select
              value={formData.classReminderMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  classReminderMinutes: parseInt(e.target.value),
                })
              }
              className="bg-background w-full rounded-lg border p-2"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </label>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="w-full md:w-auto"
        >
          {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
