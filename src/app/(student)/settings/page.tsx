"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Pencil, Image, User, Mail, CreditCard } from "lucide-react";

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
  const { data: session, update: updateSession } = useSession();

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
  const [tab, setTab] = useState<"profile" | "billing">("profile");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({ name, avatarIndex });
      // Invalidate the profile query to refetch updated data
      await utils.user.getProfile.invalidate();
      // Update the NextAuth session to refresh header name immediately
      await updateSession();
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <nav className="space-y-2">
            <button
              onClick={() => setTab("profile")}
              className={
                "w-full text-left rounded-lg px-4 py-2 font-medium transition-colors " +
                (tab === "profile"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground")
              }
            >
              General
            </button>

            <button
              onClick={() => setTab("billing")}
              className={
                "w-full text-left rounded-lg px-4 py-2 font-medium transition-colors " +
                (tab === "billing"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground")
              }
            >
              Billing
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="md:col-span-3">
          {/* Small screen tabs */}
          <div className="flex gap-2 md:hidden mb-4">
            <button
              onClick={() => setTab("profile")}
              className={
                "flex-1 rounded-md px-3 py-2 text-sm font-medium " +
                (tab === "profile" ? "bg-muted text-foreground" : "bg-card")
              }
            >
              General
            </button>
            <button
              onClick={() => setTab("billing")}
              className={
                "flex-1 rounded-md px-3 py-2 text-sm font-medium " +
                (tab === "billing" ? "bg-muted text-foreground" : "bg-card")
              }
            >
              Billing
            </button>
          </div>

          {tab === "profile" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Profile card */}
              <div className="bg-card col-span-1 rounded-lg border p-6">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`h-20 w-20 rounded-full ${AVATAR_COLORS[avatarIndex].bg} flex items-center justify-center text-3xl font-bold text-white`}
                  >
                    {name.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{name || "User Name"}</p>
                    <p className="text-muted-foreground text-sm">Student • {upgradeTier === "free" ? "Free" : "Pro"}</p>
                  </div>

                  <div className="w-full">
                    <label className="mb-3 block text-sm font-medium">Choose Avatar Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_COLORS.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAvatarIndex(idx)}
                          className={`h-10 w-10 rounded-full ${AVATAR_COLORS[idx].bg} transition-transform ${
                            avatarIndex === idx ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"
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
                      <label className="mb-1 block text-sm font-medium">Full name</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Email</label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Bio</label>
                    <textarea className="input-primary h-28 w-full resize-none p-3" placeholder="Short bio about you" />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 relative">
              <div className="blur-sm opacity-50">
                <h2 className="text-lg font-semibold mb-4">Billing</h2>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Upgrade to Pro</p>
                      <p className="text-muted-foreground text-sm">Unlock advanced AI credits, larger uploads</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">{upgradeTier === "free" ? "Free" : "Pro"}</div>
                      {upgradeTier === "free" ? (
                        <Button onClick={handleUpgrade} disabled={isUpgrading}>{isUpgrading ? "Processing..." : "Upgrade"}</Button>
                      ) : (
                        <Button variant="outline" disabled>Active</Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="font-semibold">Payment</p>
                    <p className="text-muted-foreground text-sm">Manage saved cards and billing</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input placeholder="Cardholder name" />
                      <Input placeholder="Card number" />
                      <Button className="sm:w-auto"><CreditCard className="mr-2 h-4 w-4"/>Add Card</Button>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="font-semibold">Danger Zone</p>
                    <p className="text-muted-foreground text-sm">Delete your account and data</p>
                    <div className="mt-3 flex justify-end"><Button variant="destructive">Delete account</Button></div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
                  <p className="text-white/90">Billing and subscription management features are coming soon.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
