import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { notifyError, notifySuccess } from "../utils/notifications";
import { LogoutIcon } from "./icons";
import { Button, Modal } from "./ui";

export function LogoutConfirmationModal({ open, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const confirmLogout = async () => {
    setBusy(true);
    try {
      await logout();
      notifySuccess("You have been signed out safely.");
    } catch (error) {
      notifyError(error, "You were signed out locally, but the server could not be reached.");
    } finally {
      setBusy(false);
      onClose();
      navigate("/", { replace: true });
    }
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title="Sign out of AjoPay?">
      <div className="logout-confirmation">
        <span className="logout-confirmation__icon"><LogoutIcon /></span>
        <div>
          <h3>Are you sure you want to sign out?</h3>
        </div>
        <div className="logout-confirmation__actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="button" variant="danger" onClick={confirmLogout} disabled={busy}>
            {busy ? "Signing out…" : "Yes, sign out"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
