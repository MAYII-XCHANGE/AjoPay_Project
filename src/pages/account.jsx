import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification-service";
import { DEFAULT_PAGE_SIZE } from "../config/pagination";
import { BellIcon, TrashIcon } from "../components/icons";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { QueryErrorState } from "../components/query-state";
import { Pagination } from "../components/pagination";
import { NotificationItem } from "../features/notifications/notification-item";
import { DeleteNotificationsModal } from "../features/notifications/delete-notifications-modal";
import { notifyError, notifySuccess } from "../utils/notifications";
export function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const client = useQueryClient();
  const { user } = useAuth();
  const { data: notificationPage, isLoading, isError, error } = useQuery({
    queryKey: ["notifications", user?.id, page],
    queryFn: () => notificationService.list({ page, size: DEFAULT_PAGE_SIZE }),
    enabled: Boolean(user?.id),
    refetchInterval: 60_000,
  });
  const data = notificationPage?.items || [];
  const markRead = useMutation({
    mutationFn: (ids) => Promise.all(ids.map((id) => notificationService.markRead(id))),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (mutationError) => notifyError(mutationError, "The notification could not be marked as read."),
  });
  const deleteNotifications = useMutation({
    mutationFn: (target) => target.scope === "all"
      ? notificationService.removeAll()
      : notificationService.remove(target.id),
    onSuccess: async (_, target) => {
      setDeleteTarget(null);
      if (target.scope === "all") {
        setPage(0);
        notifySuccess("All notifications have been deleted.");
      } else {
        if (data.length === 1 && page > 0) setPage((currentPage) => currentPage - 1);
        notifySuccess("Notification deleted.");
      }
      await client.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (mutationError) => notifyError(mutationError, "The notification could not be deleted."),
  });
  const unreadOnPage = data.filter((item) => !item.read);
  const unreadCount = notificationPage?.unreadCount ?? 0;
  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="STAY UPDATED"
        title="Notifications"
        description={`${unreadCount} unread update${unreadCount === 1 ? "" : "s"} about your savings.`}
        action={data.length > 0 && (
          <div className="notification-toolbar">
            {unreadOnPage.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => markRead.mutate(unreadOnPage.map((item) => item.id))}
              disabled={markRead.isPending}
            >
              {markRead.isPending ? "Marking as read…" : "Mark page as read"}
            </Button>
            )}
            <Button
              variant="danger"
              onClick={() => setDeleteTarget({ scope: "all" })}
              disabled={deleteNotifications.isPending}
            >
              <TrashIcon /> Delete all
            </Button>
          </div>
        )}
      />
      <Card className="notification-list">
        {isError ? (
          <QueryErrorState error={error} title="Notifications could not be loaded" />
        ) : isLoading ? (
          <Skeleton className="skeleton--table" />
        ) : data.length ? (
          data.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              markingRead={markRead.isPending && markRead.variables?.includes(item.id)}
              onMarkRead={(id) => markRead.mutate([id])}
              onDelete={(notification) => setDeleteTarget({ ...notification, scope: "one" })}
            />
          ))
        ) : (
          <EmptyState
            icon={<BellIcon />}
            title="You’re all caught up"
            text="Important updates about your Ajos will appear here."
          />
        )}
      </Card>
      <Pagination
        {...notificationPage}
        onChange={setPage}
        busy={isLoading || deleteNotifications.isPending}
        alwaysVisible={data.length > 0}
      />
      <DeleteNotificationsModal
        target={deleteTarget}
        busy={deleteNotifications.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteNotifications.mutate(deleteTarget)}
      />
    </div>
  );
}
export { ProfilePage } from "../features/profile/profile-page";
