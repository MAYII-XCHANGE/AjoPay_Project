import { Link } from "react-router-dom";
import { formatCurrency, formatDate, frequencyLabel } from "../../utils/formatters";
import { ArrowIcon, UsersIcon } from "../../components/icons";
import { Badge } from "../../components/ui";
export function AjoCard({ ajo }) {
    const available = ajo.slotCount - ajo.filledSlots;
    return (<article className="ajo-card">
      <div className="ajo-card__top"><Badge tone={ajo.status === "ACTIVE" ? "blue" : available <= 2 ? "amber" : "green"}>{ajo.status === "ACTIVE" ? `Round ${ajo.currentRound} of ${ajo.slotCount}` : `${available} slots left`}</Badge><span>{ajo.category}</span></div>
      <h3>{ajo.name}</h3><p>{ajo.description}</p>
      <div className="ajo-card__amount"><strong>{formatCurrency(ajo.contributionAmount)}</strong><span>{frequencyLabel[ajo.frequency].toLowerCase()}</span></div>
      {ajo.status === "ACTIVE" && <div className="progress" aria-label={`${ajo.progress}% complete`}><span style={{ width: `${ajo.progress}%` }}/></div>}
      <div className="ajo-card__meta"><span><UsersIcon />{ajo.filledSlots}/{ajo.slotCount} members</span><span>Starts {formatDate(ajo.startDate)}</span></div>
      <Link to={`/ajos/${ajo.id}`}>View Ajo <ArrowIcon /></Link>
    </article>);
}
