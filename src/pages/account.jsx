import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "../api/mock-service";
import { BellIcon, CheckIcon, ShieldIcon, UserIcon } from "../components/icons";
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { formatDate } from "../utils/formatters";
export function NotificationsPage() {
    const client = useQueryClient();
    const { data = [], isLoading } = useQuery({ queryKey: ["notifications"], queryFn: mockApi.notifications });
    const markRead = useMutation({ mutationFn: mockApi.markNotificationRead, onMutate: async (id) => { await client.cancelQueries({ queryKey: ["notifications"] }); client.setQueryData(["notifications"], data.map((item) => item.id === id ? { ...item, read: true } : item)); }, onSettled: () => client.invalidateQueries({ queryKey: ["notifications"] }) });
    const unread = data.filter((item) => !item.read);
    return <div className="page page--narrow"><PageHeader eyebrow="STAY UPDATED" title="Notifications" description={`${unread.length} unread update${unread.length === 1 ? "" : "s"} about your savings.`} action={unread.length > 0 && <Button variant="secondary" onClick={() => unread.forEach((item) => markRead.mutate(item.id))}>Mark all as read</Button>}/><Card className="notification-list">{isLoading ? <Skeleton className="skeleton--table"/> : data.length ? data.map((item) => <button key={item.id} onClick={() => !item.read && markRead.mutate(item.id)} className={!item.read ? "unread" : ""}><span className={`notification-icon notification-icon--${item.kind}`}>{item.kind === "payment" ? <CheckIcon /> : item.kind === "group" ? <UserIcon /> : <BellIcon />}</span><span><b>{item.title}</b><small>{item.message}</small><time>{formatDate(item.date)}</time></span>{!item.read && <i aria-label="Unread"/>}</button>) : <EmptyState icon={<BellIcon />} title="You’re all caught up" text="Important updates about your Ajos will appear here."/>}</Card></div>;
}
export function ProfilePage() {
    const { user } = useAuth();
    return <div className="page page--narrow"><PageHeader eyebrow="YOUR ACCOUNT" title="Profile" description="Manage your details and see the trust you’ve built."/><section className="profile-hero"><span className="profile-avatar">{user?.name.split(" ").map((p) => p[0]).join("")}</span><div><h2>{user?.name}</h2><p>{user?.email} • {user?.phone}</p><Badge tone="green"><ShieldIcon />Identity verified</Badge></div><Button variant="secondary">Edit profile</Button></section><div className="stats-grid profile-stats"><Card><small>Community rating</small><strong>★ {user?.rating}</strong><span>From 10 member ratings</span></Card><Card><small>Completed cycles</small><strong>{user?.completedCycles}</strong><span>Strong saving history</span></Card><Card><small>On-time payments</small><strong>98%</strong><span>49 of 50 payments</span></Card></div><Card><h2>Account details</h2><dl className="account-details"><div><dt>Full name</dt><dd>{user?.name}</dd></div><div><dt>Email address</dt><dd>{user?.email}</dd></div><div><dt>Phone number</dt><dd>{user?.phone}</dd></div><div><dt>Bank account</dt><dd>GTBank •••• 8842</dd></div></dl></Card></div>;
}
