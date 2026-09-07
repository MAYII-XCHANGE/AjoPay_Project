import { TrashIcon } from "../../components/icons";
import { Button, Modal } from "../../components/ui";

export function DeleteNotificationsModal({ target, busy, onClose, onConfirm }) {
  const deletingAll = target?.scope === "all";

  return (
    <Modal
      open={Boolean(target)}
      onClose={() => !busy && onClose()}
      title={deletingAll ? "Delete all notifications?" : "Delete notification?"}
    >
      <div className="confirm-panel notification-delete-confirmation">
        <span className="notification-delete-confirmation__icon"><TrashIcon /></span>
        <p>
          {deletingAll
            ? "This will permanently remove every notification in your inbox. This action cannot be undone."
            : `“${target?.title || "This notification"}” will be permanently removed from your inbox.`}
        </p>
        <div>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting…" : deletingAll ? "Delete all" : "Delete notification"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
