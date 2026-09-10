import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ajoService } from "../../services/ajo-service";
import { Card, EmptyState, Skeleton } from "../../components/ui";
import { CalendarIcon, SearchIcon, ShieldIcon, UsersIcon, WalletIcon } from "../../components/icons";
import { Pagination } from "../../components/pagination";
import { QueryErrorState } from "../../components/query-state";
import { DEFAULT_PAGE_SIZE } from "../../config/pagination";
import { formatCurrency, formatDate, frequencyLabel } from "../../utils/formatters";
import { AdminPageIntro, AdminStatus } from "./admin-shared";
import { getInitials } from "../../utils/admin-display";
import "./admin-pages.css";

const groupStatuses = ["ALL", "OPEN", "FILLING", "READY", "ACTIVE", "CYCLE_COMPLETED", "CLOSED"];

function AjoOversightCard({ ajo }) {
  const capacity = Math.max(Number(ajo.slotCount || 0), 0);
  const members = Math.max(Number(ajo.filledSlots || 0), 0);
  const fillPercentage = capacity > 0 ? Math.min(Math.round((members / capacity) * 100), 100) : 0;

  return (
    <Card className="super-admin-ajo-card">
      <header>
        <span className="super-admin-ajo-card__mark">{getInitials(ajo.name)}</span>
        <div><h2>{ajo.name}</h2><small>{ajo.publicId || ajo.id}</small></div>
        <AdminStatus status={ajo.status} />
      </header>
      <p>{ajo.description}</p>
      <div className="super-admin-ajo-card__amount"><WalletIcon /><span><small>CONTRIBUTION</small><strong>{formatCurrency(ajo.contributionAmount)}</strong></span><b>{frequencyLabel[ajo.frequency] || ajo.frequency || "Not set"}</b></div>
      <div className="super-admin-ajo-card__capacity">
        <div><span>Group capacity</span><b>{members} of {capacity} slots</b></div>
        <i><span style={{ width: `${fillPercentage}%` }} /></i>
        <small>{Math.max(capacity - members, 0)} available · {fillPercentage}% filled</small>
      </div>
      <footer>
        <span><i className="super-admin-avatar">{getInitials(ajo.creator)}</i><span><small>CREATED BY</small><b>{ajo.creator}</b></span></span>
        <span><CalendarIcon /><span><small>START DATE</small><b>{ajo.startDate ? formatDate(ajo.startDate) : "Not started"}</b></span></span>
      </footer>
    </Card>
  );
}

export function AdminAjosPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const groups = useQuery({
    queryKey: ["admin-ajos", page],
    queryFn: () => ajoService.list({ page, size: DEFAULT_PAGE_SIZE }),
  });
  const visibleGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (groups.data?.items || []).filter((ajo) => {
      const matchesStatus = status === "ALL" || ajo.status === status;
      const matchesSearch = !term || [ajo.name, ajo.creator, ajo.publicId]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [groups.data?.items, search, status]);

  return (
    <div className="super-admin-page super-admin-ajos">
      <AdminPageIntro
        eyebrow="GROUP OVERSIGHT"
        title="Ajo groups"
        description="Monitor group health, contribution commitments, and membership capacity."
        meta={`${groups.data?.totalElements || 0} groups`}
      />

      <div className="super-admin-ajo-filters">
        <label className="super-admin-search"><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search groups or creators" aria-label="Search Ajo groups on this page" /></label>
        <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{groupStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ").toLowerCase()}</option>)}</select></label>
        <span>{visibleGroups.length} shown on this page</span>
      </div>

      {groups.isError ? (
        <QueryErrorState error={groups.error} title="Ajo groups could not be loaded" />
      ) : groups.isLoading ? (
        <div className="super-admin-ajo-grid">{[1, 2, 3, 4].map((item) => <Skeleton className="skeleton--card" key={item} />)}</div>
      ) : visibleGroups.length ? (
        <div className="super-admin-ajo-grid">{visibleGroups.map((ajo) => <AjoOversightCard ajo={ajo} key={ajo.id} />)}</div>
      ) : (
        <Card><EmptyState icon={<ShieldIcon />} title="No Ajos match this view" text="Try another group status or search term." /></Card>
      )}

      <div className="super-admin-page-pagination">
        <span><UsersIcon /> {groups.data?.totalElements || 0} groups across the platform</span>
        <Pagination {...groups.data} onChange={(nextPage) => { setPage(nextPage); setSearch(""); }} busy={groups.isFetching} />
      </div>
    </div>
  );
}
