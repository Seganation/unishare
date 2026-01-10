"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Calendar, Check, X, Users, ChevronDown, ChevronUp } from "lucide-react";

export function InvitationsBanner() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: invitations, refetch } = api.timetable.getPendingInvitations.useQuery();
  const acceptMutation = api.timetable.acceptInvitation.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const rejectMutation = api.timetable.rejectInvitation.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="border-border bg-card group relative mb-6 overflow-hidden rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Subtle gradient overlay */}
      <div className="bg-primary/5 absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <Calendar className="text-primary h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Timetable Invitations
              </h3>
              <p className="text-muted-foreground text-sm font-medium">
                {invitations.length} pending invitation{invitations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-accent rounded-xl p-2 transition-all"
            aria-label={isExpanded ? "Collapse invitations" : "Expand invitations"}
          >
            {isExpanded ? (
              <ChevronUp className="text-muted-foreground h-5 w-5" />
            ) : (
              <ChevronDown className="text-muted-foreground h-5 w-5" />
            )}
          </button>
        </div>

        {/* Invitations List */}
        <div
          className={`space-y-3 overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {invitations.map((invitation, index) => (
            <div
              key={invitation.id}
              className="border-border bg-card group/item relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="bg-primary/10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
                    <Users className="text-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {invitation.timetable.creator.name}
                    </p>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-primary truncate font-medium">
                        {invitation.timetable.name}
                      </span>
                      <span className="flex-shrink-0">•</span>
                      <span className="flex-shrink-0 capitalize">
                        {invitation.role.toLowerCase()}
                      </span>
                      {invitation.timetable._count.events > 0 && (
                        <>
                          <span className="flex-shrink-0">•</span>
                          <span className="flex-shrink-0">
                            {invitation.timetable._count.events} classes
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processingId === invitation.id}
                    onClick={() => {
                      setProcessingId(invitation.id);
                      rejectMutation.mutate(
                        { timetableId: invitation.timetableId },
                        {
                          onSettled: () => setProcessingId(null),
                        },
                      );
                    }}
                    className="group/btn border-red-200 text-red-600 transition-all hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <X className="mr-1 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={processingId === invitation.id}
                    onClick={() => {
                      setProcessingId(invitation.id);
                      acceptMutation.mutate(
                        { timetableId: invitation.timetableId },
                        {
                          onSettled: () => setProcessingId(null),
                        },
                      );
                    }}
                    className="group/btn bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 transition-all hover:shadow-lg hover:shadow-green-500/30 dark:shadow-green-500/10"
                  >
                    <Check className="mr-1 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    Accept
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
