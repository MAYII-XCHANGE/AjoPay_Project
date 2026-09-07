import { Link } from "react-router-dom";
import {
  formatCurrency,
  formatDate,
  frequencyLabel,
} from "../../utils/formatters";
import { ArrowIcon, UsersIcon } from "../../components/icons";
import { Badge } from "../../components/ui";
import { useTranslation } from "react-i18next";
import { AjoStatus } from "../../enums/statuses";
export function AjoCard({ ajo }) {
  const { t, i18n } = useTranslation();
  const available = Math.max(ajo.availableSlots ?? ajo.slotCount - ajo.filledSlots, 0);
  return (
    <article className="ajo-card">
      <div className="ajo-card__top">
        <Badge
          tone={
            ajo.status === AjoStatus.ACTIVE
              ? "blue"
              : available <= 2
                ? "amber"
                : "green"
          }
        >
          {ajo.status === AjoStatus.ACTIVE
            ? t("ajoCard.round", { current: ajo.currentRound, total: ajo.slotCount })
            : t("ajoCard.slotsLeft", { count: available })}
        </Badge>
        <span>{ajo.category}</span>
      </div>
      <h3>{ajo.name}</h3>
      <p>{ajo.description}</p>
      <div className="ajo-card__amount">
        <strong>{formatCurrency(ajo.contributionAmount)}</strong>
        <span>{t(`ajoCard.${frequencyLabel[ajo.frequency].toLowerCase()}`)}</span>
      </div>
      {ajo.status === AjoStatus.ACTIVE && (
        <div className="progress" aria-label={t("ajoCard.complete", { value: ajo.progress })}>
          <span style={{ width: `${ajo.progress}%` }} />
        </div>
      )}
      <div className="ajo-card__meta">
        <span>
          <UsersIcon />
          {t("ajoCard.members", { filled: ajo.filledSlots, total: ajo.slotCount })}
        </span>
        <span>
          {ajo.startDate
            ? t("ajoCard.starts", {
                date: formatDate(ajo.startDate, i18n.resolvedLanguage),
              })
            : "Start date set after approval"}
        </span>
      </div>
      <Link to={`/ajos/${ajo.id}`}>
        {t("ajoCard.view")} <ArrowIcon />
      </Link>
    </article>
  );
}
