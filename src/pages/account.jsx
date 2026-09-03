import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "../api/mock-service";
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
export function NotificationsPage() {
  const client = useQueryClient();
  const { user } = useAuth();
  const { data: notificationPage, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => mockApi.notifications(user?.id),
  });
  const data = notificationPage?.items || [];
  const markRead = useMutation({
    mutationFn: mockApi.markNotificationRead,
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: ["notifications", user?.id] });
      client.setQueryData(
        ["notifications", user?.id],
        (current) => current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === id ? { ...item, read: true } : item,
              ),
              unreadCount: Math.max(0, current.unreadCount - 1),
            }
          : current,
      );
    },
    onSettled: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const unread = data.filter((item) => !item.read);
  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="STAY UPDATED"
        title="Notifications"
        description={`${unread.length} unread update${unread.length === 1 ? "" : "s"} about your savings.`}
        action={
          unread.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => unread.forEach((item) => markRead.mutate(item.id))}
            >
              Mark all as read
            </Button>
          )
        }
      />
      <Card className="notification-list">
        {isLoading ? (
          <Skeleton className="skeleton--table" />
        ) : data.length ? (
          data.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.read && markRead.mutate(item.id)}
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
    </div>
  );
}
export { ProfilePage } from "../features/profile/profile-page";
