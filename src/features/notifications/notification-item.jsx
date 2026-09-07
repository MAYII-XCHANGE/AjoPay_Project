import { BellIcon, CheckIcon, TrashIcon, UserIcon } from "../../components/icons";
import { formatDate } from "../../utils/formatters";

function NotificationKindIcon({ kind }) {
  if (kind === "payment") return <CheckIcon />;
  if (kind === "group") return <UserIcon />;
  return <BellIcon />;
}

export function NotificationItem({ item, selected, markingRead, onSelect, onMarkRead, onDelete }) {
  return (
    <article className={`notification-item${item.read ? "" : " unread"}${selected ? " selected" : ""}`}>
      <label className="notification-item__select" title="Select notification">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.id)}
          aria-label={`Select ${item.title} notification`}
        />
      </label>
      <button
        type="button"
        className="notification-item__content"
        onClick={() => !item.read && onMarkRead(item.id)}
        disabled={markingRead}
        aria-label={item.read ? `${item.title}, read` : `${item.title}, mark as read`}
      >
        <span className={`notification-icon notification-icon--${item.kind}`}>
          <NotificationKindIcon kind={item.kind} />
        </span>
        <span className="notification-item__copy">
          <b>{item.title}</b>
          <small>{item.message}</small>
          <time dateTime={item.date}>{formatDate(item.date)}</time>
        </span>
        {!item.read && <i className="notification-item__unread" aria-label="Unread" />}
      </button>
      <button
        type="button"
        className="notification-item__delete"
        onClick={() => onDelete(item)}
        aria-label={`Delete ${item.title} notification`}
        title="Delete notification"
      >
        <TrashIcon />
      </button>
    </article>
  );
}
