import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notification-service";
import { DEFAULT_PAGE_SIZE } from "../config/pagination";
import { BellIcon, CheckIcon, UserIcon } from "../components/icons";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
} from "../components/ui";
import { formatDate } from "../utils/formatters";
import { useAuth } from "../contexts/auth-context";
import { QueryErrorState } from "../components/query-state";
import { Pagination } from "../components/pagination";
export function NotificationsPage() {
  const [page, setPage] = useState(0);
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
  });
  const unreadOnPage = data.filter((item) => !item.read);
  const unreadCount = notificationPage?.unreadCount ?? 0;
  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="STAY UPDATED"
        title="Notifications"
        description={`${unreadCount} unread update${unreadCount === 1 ? "" : "s"} about your savings.`}
        action={
          unreadOnPage.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => markRead.mutate(unreadOnPage.map((item) => item.id))}
              disabled={markRead.isPending}
            >
              {markRead.isPending ? "Marking as read…" : "Mark page as read"}
            </Button>
          )
        }
      />
      <Card className="notification-list">
        {isError ? (
          <QueryErrorState error={error} title="Notifications could not be loaded" />
        ) : isLoading ? (
          <Skeleton className="skeleton--table" />
        ) : data.length ? (
          data.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.read && markRead.mutate([item.id])}
              disabled={markRead.isPending && markRead.variables?.includes(item.id)}
              className={!item.read ? "unread" : ""}
            >
              <span
                className={`notification-icon notification-icon--${item.kind}`}
              >
                {item.kind === "payment" ? (
                  <CheckIcon />
                ) : item.kind === "group" ? (
                  <UserIcon />
                ) : (
                  <BellIcon />
                )}
              </span>
              <span>
                <b>{item.title}</b>
                <small>{item.message}</small>
                <time>{formatDate(item.date)}</time>
              </span>
              {!item.read && <i aria-label="Unread" />}
            </button>
          ))
        ) : (
          <EmptyState
            icon={<BellIcon />}
            title="You’re all caught up"
            text="Important updates about your Ajos will appear here."
          />
        )}
      </Card>
      <Pagination {...notificationPage} onChange={setPage} busy={isLoading} />
    </div>
  );
}
export { ProfilePage } from "../features/profile/profile-page";
