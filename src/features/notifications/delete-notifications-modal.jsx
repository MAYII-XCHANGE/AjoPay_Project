import { TrashIcon } from "../../components/icons";
import { Button, Modal } from "../../components/ui";

export function DeleteNotificationsModal({ target, busy, onClose, onConfirm }) {
  const deletingAll = target?.scope === "all";
  const deletingSelected = target?.scope === "selected";
  const selectedCount = target?.ids?.length || 0;

  return (
    <Modal
      open={Boolean(target)}
      onClose={() => !busy && onClose()}
      title={deletingAll ? "Delete all notifications?" : deletingSelected ? `Delete ${selectedCount} notifications?` : "Delete notification?"}
    >
      <div className="confirm-panel notification-delete-confirmation">
        <span className="notification-delete-confirmation__icon"><TrashIcon /></span>
        <p>
          {deletingAll
            ? "This will permanently remove every notification in your inbox. This action cannot be undone."
            : deletingSelected
              ? `The ${selectedCount} selected notifications will be permanently removed from your inbox.`
              : `“${target?.title || "This notification"}” will be permanently removed from your inbox.`}
        </p>
        <div>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : deletingAll ? "Delete all" : deletingSelected ? "Delete selected" : "Delete notification"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
