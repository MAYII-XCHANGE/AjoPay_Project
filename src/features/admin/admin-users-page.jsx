import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/admin-service";
import { Button, Card, EmptyState, Modal, Skeleton } from "../../components/ui";
import { CalendarIcon, ChevronIcon, MailIcon, SearchIcon, ShieldIcon, UsersIcon } from "../../components/icons";
import { Pagination } from "../../components/pagination";
import { QueryErrorState } from "../../components/query-state";
import { DEFAULT_PAGE_SIZE } from "../../config/pagination";
import { formatDate } from "../../utils/formatters";
import { AdminPageIntro, AdminStatus } from "./admin-shared";
import { getInitials } from "../../utils/admin-display";
import "./admin-pages.css";

const statusFilters = [
  { value: "", label: "All users" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];

function UserDetailsModal({ user, details, loading, error, busy, actionError, onClose, onUpdate }) {
  const record = details || user;
  return (
    <Modal open={Boolean(user)} onClose={() => !busy && onClose()} title="Manage user account">
      <div className="super-admin-user-modal">
        {loading ? <Skeleton className="skeleton--card" /> : (
          <>
            <header>
              <span className="super-admin-avatar super-admin-avatar--large">{getInitials(record?.name)}</span>
              <div><h3>{record?.name}</h3><p>{record?.email || "No email returned"}</p></div>
              <AdminStatus status={record?.status} />
            </header>
            <dl>
              <div><dt><MailIcon /> Email address</dt><dd>{record?.email || "Not available"}</dd></div>
              <div><dt><ShieldIcon /> Account role</dt><dd>{record?.role || "USER"}</dd></div>
              <div><dt><CalendarIcon /> Joined AjoPay</dt><dd>{formatDate(record?.joinedAt)}</dd></div>
            </dl>
          </>
        )}
        {error && <QueryErrorState error={error} title="User details could not be loaded" />}
        {actionError && <div className="form-error" role="alert">{actionError.message}</div>}
        <div className="super-admin-user-modal__notice">
          Account status changes are enforced by the server and affect sign-in and withdrawal access.
        </div>
        <footer>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          {user?.status !== "ACTIVE" && <Button onClick={() => onUpdate("ACTIVE")} disabled={busy}>{busy ? "Updating…" : "Activate account"}</Button>}
          {user?.status !== "SUSPENDED" && <Button variant="danger" onClick={() => onUpdate("SUSPENDED")} disabled={busy}>{busy ? "Updating…" : "Suspend account"}</Button>}
        </footer>
      </div>
    </Modal>
  );
}

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ["admin-users", page, status],
    queryFn: () => adminService.users({ page, size: DEFAULT_PAGE_SIZE, status }),
  });
  const userDetails = useQuery({
    queryKey: ["admin-user", selected?.id],
    queryFn: () => adminService.user(selected.id),
    enabled: Boolean(selected?.id),
  });
  const update = useMutation({
    meta: { successMessage: (_data, variables) => `The user account is now ${variables.nextStatus.toLowerCase()}.` },
    mutationFn: ({ id, nextStatus }) => adminService.updateUserStatus(id, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelected(null);
    },
  });
  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users.data?.items || [];
    return (users.data?.items || []).filter((user) => [user.name, user.email, user.role, user.status]
      .some((value) => String(value || "").toLowerCase().includes(term)));
  }, [search, users.data?.items]);

  const changeStatus = (nextStatus) => {
    setStatus(nextStatus);
    setPage(0);
    setSearch("");
  };

  return (
    <div className="super-admin-page super-admin-users">
      <AdminPageIntro
        eyebrow="USER OPERATIONS"
        title="User management"
        description="Review customer accounts and control access with server-enforced status changes."
        meta={`${users.data?.totalElements || 0} accounts`}
      />

      <Card className="super-admin-directory">
        <div className="super-admin-directory__toolbar">
          <div className="super-admin-filter-tabs" aria-label="Filter users by status">
            {statusFilters.map((filter) => (
              <button type="button" key={filter.value || "all"} className={status === filter.value ? "active" : ""} onClick={() => changeStatus(filter.value)}>
                {filter.label}
              </button>
            ))}
          </div>
          <label className="super-admin-search">
            <SearchIcon />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page" aria-label="Search users on this page" />
          </label>
        </div>

        {users.isError ? (
          <QueryErrorState error={users.error} title="Users could not be loaded" />
        ) : users.isLoading ? (
          <Skeleton className="skeleton--table" />
        ) : visibleUsers.length ? (
          <div className="super-admin-user-table">
            <div className="super-admin-user-table__head"><span>User</span><span>Role</span><span>Status</span><span>Joined</span><span /></div>
            {visibleUsers.map((user) => (
              <button type="button" className="super-admin-user-row" key={user.id} onClick={() => { update.reset(); setSelected(user); }}>
                <span className="super-admin-user-row__identity">
                  <i className="super-admin-avatar">{getInitials(user.name)}</i>
                  <span><b>{user.name}</b><small>{user.email || "No email returned"}</small></span>
                </span>
                <span className="super-admin-role"><ShieldIcon /> {user.role}</span>
                <AdminStatus status={user.status} />
                <time>{formatDate(user.joinedAt)}</time>
                <ChevronIcon />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={<UsersIcon />} title="No users found" text={search ? "No account on this page matches your search." : "Try another account status."} />
        )}
        <div className="super-admin-directory__footer">
          <span>Showing {visibleUsers.length} of {users.data?.totalElements || 0} accounts</span>
          <Pagination {...users.data} onChange={(nextPage) => { setPage(nextPage); setSearch(""); }} busy={users.isFetching} />
        </div>
      </Card>

      <UserDetailsModal
        user={selected}
        details={userDetails.data}
        loading={userDetails.isLoading}
        error={userDetails.error}
        busy={update.isPending}
        actionError={update.error}
        onClose={() => { update.reset(); setSelected(null); }}
        onUpdate={(nextStatus) => update.mutate({ id: selected.id, nextStatus })}
      />
    </div>
  );
}
