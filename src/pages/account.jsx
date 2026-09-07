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
  const [selectedIds, setSelectedIds] = useState([]);
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
    mutationFn: (target) => {
      if (target.scope === "all") return notificationService.removeAll();
      if (target.scope === "selected") {
        return Promise.all(target.ids.map((id) => notificationService.remove(id)));
      }
      return notificationService.remove(target.id);
    },
    onSuccess: (_, target) => {
      setDeleteTarget(null);
      setSelectedIds([]);
      if (target.scope === "all") {
        setPage(0);
        notifySuccess("All notifications have been deleted.");
      } else if (target.scope === "selected") {
        if (target.ids.length === data.length && page > 0) setPage((currentPage) => currentPage - 1);
        notifySuccess(`${target.ids.length} notification${target.ids.length === 1 ? "" : "s"} deleted.`);
      } else {
        if (data.length === 1 && page > 0) setPage((currentPage) => currentPage - 1);
        notifySuccess("Notification deleted.");
      }
    },
    onError: (mutationError, target) => {
      if (target.scope === "selected") {
        setDeleteTarget(null);
        setSelectedIds([]);
      }
      notifyError(mutationError, target.scope === "selected"
        ? "One or more selected notifications could not be deleted."
        : "The notification could not be deleted.");
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const unreadOnPage = data.filter((item) => !item.read);
  const unreadCount = notificationPage?.unreadCount ?? 0;
  const selectedOnPage = data.filter((item) => selectedIds.includes(item.id));
  const allOnPageSelected = data.length > 0 && selectedOnPage.length === data.length;

  const toggleSelected = (id) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  };

  const changePage = (nextPage) => {
    setSelectedIds([]);
    setPage(nextPage);
  };
  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="STAY UPDATED"
        title="Notifications"
        description={`${unreadCount} unread update${unreadCount === 1 ? "" : "s"} about your savings.`}
        action={data.length > 0 && (
          <div className="notification-toolbar">
            {selectedOnPage.length > 0 && (
              <Button
                variant="danger"
                onClick={() => setDeleteTarget({ scope: "selected", ids: selectedOnPage.map((item) => item.id) })}
                disabled={deleteNotifications.isPending}
              >
                <TrashIcon /> Delete selected ({selectedOnPage.length})
              </Button>
            )}
            {unreadOnPage.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => markRead.mutate(unreadOnPage.map((item) => item.id))}
              disabled={markRead.isPending}
            >
              {markRead.isPending ? "Marking as read…" : "Mark page as read"}
            </Button>
            )}
          </div>
        )}
      />
      <Card className="notification-list">
        {isError ? (
          <QueryErrorState error={error} title="Notifications could not be loaded" />
        ) : isLoading ? (
          <Skeleton className="skeleton--table" />
        ) : data.length ? (
          <>
            {selectedOnPage.length > 0 && (
              <div className="notification-selection-bar">
                <label>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    ref={(element) => {
                      if (element) element.indeterminate = !allOnPageSelected;
                    }}
                    onChange={() => setSelectedIds(allOnPageSelected ? [] : data.map((item) => item.id))}
                  />
                  Select all on this page
                </label>
                <span>{selectedOnPage.length} selected for deletion</span>
              </div>
            )}
            {data.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                markingRead={markRead.isPending && markRead.variables?.includes(item.id)}
                onSelect={toggleSelected}
                onMarkRead={(id) => markRead.mutate([id])}
                onDelete={(notification) => setDeleteTarget({ ...notification, scope: "one" })}
              />
            ))}
          </>
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
        onChange={changePage}
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
