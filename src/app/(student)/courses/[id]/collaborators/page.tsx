"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit,
  Crown,
  Trash2,
  Search,
  Sparkles,
  Users,
  Check,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type CollaboratorRole = "CONTRIBUTOR" | "VIEWER";

export default function CollaboratorsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("VIEWER");
  const [searchQuery, setSearchQuery] = useState("");

  const utils = api.useUtils();

  const { data: course, isLoading } = api.course.getById.useQuery({
    id: courseId,
  });

  // Filter collaborators based on search
  const filteredCollaborators =
    course?.collaborators.filter(
      (c) =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="mb-8 h-10 w-32" />
          <Skeleton className="mb-6 h-32 rounded-2xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course || course.userRole !== "OWNER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="mb-6 text-gray-600">
            Only the course owner can manage collaborators.
          </p>
          <Button onClick={() => router.push(`/courses/${courseId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return Crown;
      case "CONTRIBUTOR":
        return Edit;
      case "VIEWER":
        return Eye;
      default:
        return Shield;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return {
          bg: "from-amber-100 to-yellow-100",
          text: "text-amber-700",
          border: "border-amber-300",
          iconBg: "bg-gradient-to-br from-amber-500 to-yellow-600",
        };
      case "CONTRIBUTOR":
        return {
          bg: "from-blue-100 to-indigo-100",
          text: "text-blue-700",
          border: "border-blue-300",
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
        };
      case "VIEWER":
        return {
          bg: "from-gray-100 to-slate-100",
          text: "text-gray-700",
          border: "border-gray-300",
          iconBg: "bg-gradient-to-br from-gray-500 to-slate-600",
        };
      default:
        return {
          bg: "from-purple-100 to-pink-100",
          text: "text-purple-700",
          border: "border-purple-300",
          iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${courseId}`)}
          className="mb-8 hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-6 w-6 animate-pulse text-purple-600" />
            <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Team Management
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900">Collaborators</h1>
          <p className="mt-2 text-gray-600">
            Manage who has access to {course.title}
          </p>
        </div>

        {/* Invite Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Invite Collaborators
              </h2>
              <p className="text-sm text-gray-600">
                Add team members to work on this course
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="colleague@university.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input-primary pl-10"
              />
            </div>
            <Select
              value={inviteRole}
              onValueChange={(value) =>
                setInviteRole(value as CollaboratorRole)
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Viewer
                  </div>
                </SelectItem>
                <SelectItem value="CONTRIBUTOR">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Contributor
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (inviteEmail) {
                  toast.info("Invite functionality coming soon!");
                  // TODO: Implement invite mutation
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Invite
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search collaborators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-primary pl-12"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className="mb-1 text-3xl font-black text-gray-900">
              {course.collaborators.length + 1}
            </div>
            <div className="text-sm font-medium text-gray-600">
              Total Members
            </div>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className="mb-1 text-3xl font-black text-blue-600">
              {
                course.collaborators.filter((c) => c.role === "CONTRIBUTOR")
                  .length
              }
            </div>
            <div className="text-sm font-medium text-gray-600">
              Contributors
            </div>
          </div>
          <div className="rounded-xl border-2 border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className="mb-1 text-3xl font-black text-gray-600">
              {course.collaborators.filter((c) => c.role === "VIEWER").length}
            </div>
            <div className="text-sm font-medium text-gray-600">Viewers</div>
          </div>
        </div>

        {/* Collaborators List */}
        <div className="space-y-4">
          {/* Owner Card */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 opacity-50" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-2xl font-bold text-white shadow-lg ring-4 ring-amber-200">
                    {course.creator.name?.[0]?.toUpperCase() ?? "O"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 ring-2 ring-white">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {course.creator.name}
                    </h3>
                    <Crown className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="mb-2 text-sm text-gray-600">
                    {course.creator.email}
                  </p>
                  <Badge className="border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700">
                    Owner
                  </Badge>
                </div>
              </div>

              {/* Owner badge */}
              <div className="rounded-xl bg-amber-100 px-4 py-2 text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  You
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-yellow-500" />
          </div>

          {/* Collaborators Cards */}
          {filteredCollaborators.length > 0 ? (
            filteredCollaborators.map((collaborator) => {
              const RoleIcon = getRoleIcon(collaborator.role);
              const roleColors = getRoleColor(collaborator.role);

              return (
                <div
                  key={collaborator.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
                    roleColors.border,
                  )}
                >
                  {/* Background gradient */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-30",
                      roleColors.bg,
                    )}
                  />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div
                          className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg ring-4 ring-white",
                            roleColors.iconBg,
                          )}
                        >
                          {collaborator.user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 ring-2 ring-white">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {collaborator.user.name}
                          </h3>
                          <RoleIcon
                            className={cn("h-5 w-5", roleColors.text)}
                          />
                        </div>
                        <p className="mb-2 text-sm text-gray-600">
                          {collaborator.user.email}
                        </p>
                        <Badge
                          className={cn(
                            "border-2",
                            roleColors.border,
                            "bg-gradient-to-r",
                            roleColors.bg,
                            roleColors.text,
                          )}
                        >
                          {collaborator.role}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.info("Role update coming soon!");
                          // TODO: Implement role update
                        }}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Remove ${collaborator.user.name} from this course?`,
                            )
                          ) {
                            toast.info("Remove functionality coming soon!");
                            // TODO: Implement remove mutation
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full",
                      roleColors.iconBg,
                    )}
                  />
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">
                {searchQuery
                  ? "No collaborators found matching your search"
                  : "No collaborators yet. Invite team members to get started!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
