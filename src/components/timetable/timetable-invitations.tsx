"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Calendar, Check, X, Users } from "lucide-react";
import { useState } from "react";

export function TimetableInvitations() {
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
    <div className="mb-8 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Timetable Invitations</h3>
          <p className="text-sm text-gray-600">
            You have {invitations.length} pending invitation{invitations.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
                <Users className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {invitation.timetable.creator.name} shared a timetable with you
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">
                    {invitation.timetable.name}
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    {invitation.role.toLowerCase()} access
                  </span>
                  {invitation.timetable._count.events > 0 && (
                    <>
                      <span>•</span>
                      <span>{invitation.timetable._count.events} classes</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
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
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="mr-1 h-4 w-4" />
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
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
