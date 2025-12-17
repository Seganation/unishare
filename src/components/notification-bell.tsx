"use client";

import { Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { Notification } from "@prisma/client";

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unread count for badge
  const { data: unreadCount = 0, refetch: refetchCount } =
    api.notification.getUnreadCount.useQuery(undefined, {
      refetchInterval: 30000, // Auto-refresh every 30 seconds
    });

  // Get recent notifications
  const { data: notifications = [], refetch: refetchNotifications } =
    api.notification.getRecent.useQuery(undefined, {
      enabled: isOpen, // Only fetch when dropdown is open
    });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark as read mutation
  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchNotifications();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchNotifications();
    },
  });

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }

    // Handle navigation based on type
    if (
      notification.type === "COURSE_INVITATION" ||
      notification.type === "TIMETABLE_INVITATION"
    ) {
      router.push("/settings?tab=invitations");
    }

    // Close dropdown
    setIsOpen(false);
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "COURSE_INVITATION":
      case "TIMETABLE_INVITATION":
        return "📨";
      case "INVITATION_ACCEPTED":
        return "✅";
      case "INVITATION_REJECTED":
        return "❌";
      case "CLASS_REMINDER":
        return "⏰";
      case "AUDIT_LOG_ALERT":
        return "🔔";
      case "SYSTEM_NOTIFICATION":
        return "📢";
      default:
        return "📬";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted relative rounded-lg p-2 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-96 rounded-lg border bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-primary text-sm hover:underline"
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">
                <Bell className="mx-auto mb-2 h-12 w-12 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`hover:bg-muted w-full border-b p-4 text-left transition-colors dark:border-gray-700 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {notification.message}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t p-3 text-center dark:border-gray-700">
              <button
                onClick={() => {
                  router.push("/notifications");
                  setIsOpen(false);
                }}
                className="text-primary text-sm hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
