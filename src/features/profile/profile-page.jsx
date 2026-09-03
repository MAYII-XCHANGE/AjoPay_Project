import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../../api/mock-service";
import {
  AlertIcon,
  CheckIcon,
  LockIcon,
  MapPinIcon,
  ShieldIcon,
  UserIcon,
} from "../../components/icons";
import { Button, Modal, PageHeader } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { BankAccountsCard } from "../bank-accounts/bank-accounts";
import {
  DangerZone,
  InformationCard,
  PreferencesCard,
  ProfileCompletion,
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  SecurityCard,
  VerificationCard,
} from "./profile-components";
import "./profile.css";

const formatJoinedDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const splitName = (name = "") => {
  const [firstName = "", ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
};

const valuesFromUser = (user) => ({
  ...splitName(user?.name),
  email: user?.email || "",
  phone: user?.phone || "",
  dateOfBirth: user?.dateOfBirth || "",
  address: user?.address || "",
  city: user?.city || "",
  state: user?.state || "",
  country: user?.country || "",
});

const validateProfile = (values) => {
  const errors = {};
  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email))
    errors.email = "Enter a valid email address.";
  if (values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a valid phone number.";
  if (values.dateOfBirth && new Date(values.dateOfBirth) > new Date())
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  return errors;
};

const profileSectionIcons = {
  personal: <UserIcon />,
  address: <MapPinIcon />,
  account: <ShieldIcon />,
};

function EditProfileForm({
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
  busy,
}) {
  const fields = [
    ["firstName", "First name", "text", "Mayowa"],
    ["lastName", "Last name", "text", "Adeyemi"],
    ["email", "Email address", "email", "you@example.com"],
    ["phone", "Phone number", "tel", "+234 800 000 0000"],
    ["dateOfBirth", "Date of birth", "date", ""],
    ["address", "Street address", "text", "Enter your address"],
    ["city", "City", "text", "Lagos"],
    ["state", "State", "text", "Lagos"],
    ["country", "Country", "text", "Nigeria"],
  ];
  return (
    <form className="profile-v2__form" onSubmit={onSubmit} noValidate>
      <p>
        Update your contact and personal information. Account-controlled details
        remain read-only.
      </p>
      <div className="profile-v2__form-grid">
        {fields.map(([name, label, type, placeholder]) => (
          <label key={name} className={name === "address" ? "full" : ""}>
            <span>{label}</span>
            <input
              name={name}
              type={type}
              value={values[name]}
              placeholder={placeholder}
              onChange={onChange}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
            />
            {errors[name] && <small id={`${name}-error`}>{errors[name]}</small>}
          </label>
        ))}
      </div>
      <div className="profile-v2__form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving changes…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  const { user, updateProfile, updateNotificationPreferences, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState(() => valuesFromUser(user));
  const [initialEditValues, setInitialEditValues] = useState(() =>
    valuesFromUser(user),
  );
  const [errors, setErrors] = useState({});
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [preferences, setPreferences] = useState(() => ({
    contributionReminders: user?.preferences?.contributionReminders ?? true,
    payoutUpdates: user?.preferences?.payoutUpdates ?? true,
    groupNotifications: user?.preferences?.groupNotifications ?? true,
    productNews: user?.preferences?.productNews ?? false,
  }));

  const isDirty =
    JSON.stringify(editValues) !== JSON.stringify(initialEditValues);

  useEffect(() => {
    if (!editOpen || !isDirty) return undefined;
    const protectChanges = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectChanges);
    return () => window.removeEventListener("beforeunload", protectChanges);
  }, [editOpen, isDirty]);

  const profileUser = useMemo(
    () => ({
      ...user,
      joinedLabel: formatJoinedDate(user?.joinedAt),
    }),
    [user],
  );

  const completion = useMemo(() => {
    const values = valuesFromUser(user);
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "dateOfBirth",
      "address",
      "city",
      "state",
      "country",
    ];
    return Math.round(
      (required.filter((key) => values[key]?.trim()).length / required.length) *
        100,
    );
  }, [user]);

  const personalFields = [
    { label: "First name", value: splitName(user?.name).firstName },
    { label: "Last name", value: splitName(user?.name).lastName },
    {
      label: "Email address",
      value: user?.email,
      verified: user?.emailVerified !== false,
    },
    {
      label: "Phone number",
      value: user?.phone,
      verified: user?.phoneVerified !== false,
    },
    {
      label: "Date of birth",
      value: user?.dateOfBirth
        ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(
            new Date(user.dateOfBirth),
          )
        : "",
    },
  ];
  const addressFields = [
    { label: "Street address", value: user?.address },
    { label: "City", value: user?.city },
    { label: "State", value: user?.state },
    { label: "Country", value: user?.country },
  ];
  const accountFields = [
    { label: "Account ID", value: user?.id },
    { label: "Date joined", value: profileUser.joinedLabel },
    {
      label: "Account status",
      value: (user?.accountStatus || "ACTIVE").toLowerCase(),
    },
    {
      label: "Verification",
      value: user?.identityVerified === false ? "Pending" : "Identity verified",
      verified: user?.identityVerified !== false,
    },
  ];

  const showNotice = (message, tone = "success") => {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 4200);
  };

  const openEdit = () => {
    const values = valuesFromUser(user);
    setEditValues(values);
    setInitialEditValues(values);
    setErrors({});
    setEditOpen(true);
  };

  const requestCloseEdit = () => {
    if (isDirty) setConfirmDiscard(true);
    else setEditOpen(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfile(editValues);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      await updateProfile({
        name: `${editValues.firstName.trim()} ${editValues.lastName.trim()}`,
        email: editValues.email.trim(),
        phone: editValues.phone.trim(),
        dateOfBirth: editValues.dateOfBirth,
        address: editValues.address.trim(),
        city: editValues.city.trim(),
        state: editValues.state.trim(),
        country: editValues.country.trim(),
      });
      setInitialEditValues(editValues);
      setEditOpen(false);
      showNotice("Your profile information was updated.");
    } catch {
      setErrors({ form: "We couldn’t save your changes. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const toggleTwoFactor = async (checked) => {
    setBusy(true);
    try {
      await updateProfile({ twoFactorEnabled: checked });
      showNotice(
        `Two-factor authentication ${checked ? "enabled" : "disabled"}.`,
      );
    } catch {
      showNotice("We couldn’t update two-factor authentication.", "error");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (!passwords.current)
      return showNotice("Enter your current password.", "error");
    if (passwords.next.length < 8)
      return showNotice(
        "Your new password must be at least 8 characters.",
        "error",
      );
    if (passwords.next !== passwords.confirm)
      return showNotice("The new passwords do not match.", "error");
    setBusy(true);
    try {
      await mockApi.changePassword();
      setPasswordOpen(false);
      setPasswords({ current: "", next: "", confirm: "" });
      showNotice("Your password was changed successfully.");
    } catch {
      showNotice("We couldn’t change your password.", "error");
    } finally {
      setBusy(false);
    }
  };

  const savePreferences = async () => {
    setBusy(true);
    try {
      await updateNotificationPreferences(preferences);
      showNotice("Your communication preferences were saved.");
    } catch {
      showNotice("We couldn’t save your preferences.", "error");
    } finally {
      setBusy(false);
    }
  };

  const logoutEverywhere = async () => {
    setBusy(true);
    try {
      await mockApi.logoutAllDevices();
      setConfirmLogout(false);
      showNotice("Other active sessions have been signed out.");
    } catch {
      showNotice("We couldn’t end your other sessions.", "error");
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setBusy(true);
    try {
      await mockApi.deleteAccount();
      logout();
      navigate("/", { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page profile-v2">
      <PageHeader
        eyebrow="YOUR ACCOUNT"
        title="Profile & Settings"
        description="Manage your personal details, security, and account preferences."
      />
      {notice && (
        <div
          className={`profile-v2__notice profile-v2__notice--${notice.tone}`}
          role="status"
        >
          {notice.tone === "success" ? <CheckIcon /> : <AlertIcon />}
          {notice.message}
        </div>
      )}
      <ProfileHeader user={profileUser} onEdit={openEdit} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="profile-v2__panel">
          <ProfileStats user={user} />
          <div className="profile-v2__overview-grid">
            <ProfileCompletion percentage={completion} onComplete={openEdit} />
            <VerificationCard
              user={user}
              onAction={() => setActiveTab("security")}
            />
          </div>
          <div className="profile-v2__two-column">
            <InformationCard
              icon={profileSectionIcons.personal}
              title="Personal information"
              description="Your primary identity and contact details."
              fields={personalFields.slice(0, 4)}
              onEdit={openEdit}
            />
            <InformationCard
              icon={profileSectionIcons.account}
              title="Account information"
              description="System-managed account details."
              fields={accountFields}
            />
          </div>
        </div>
      )}

      {activeTab === "personal" && (
        <div className="profile-v2__panel profile-v2__stack">
          <div className="profile-v2__two-column">
            <InformationCard
              icon={profileSectionIcons.personal}
              title="Personal information"
              description="Details used to identify and contact you."
              fields={personalFields}
              onEdit={openEdit}
            />
            <InformationCard
              icon={profileSectionIcons.address}
              title="Address information"
              description="Your current residential address."
              fields={addressFields}
              onEdit={openEdit}
            />
          </div>
          <BankAccountsCard />
        </div>
      )}

      {activeTab === "security" && (
        <div className="profile-v2__panel profile-v2__stack">
          <SecurityCard
            twoFactorEnabled={Boolean(user?.twoFactorEnabled)}
            onToggleTwoFactor={toggleTwoFactor}
            onChangePassword={() => setPasswordOpen(true)}
            onLogoutAll={() => setConfirmLogout(true)}
            busy={busy}
          />
          <VerificationCard
            user={user}
            onAction={() =>
              showNotice("Your verification details are up to date.")
            }
          />
          <DangerZone onDelete={() => setDeleteOpen(true)} />
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="profile-v2__panel profile-v2__stack">
          <PreferencesCard
            values={preferences}
            onChange={(key, checked) =>
              setPreferences((current) => ({ ...current, [key]: checked }))
            }
            onSave={savePreferences}
            busy={busy}
          />
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={requestCloseEdit}
        title="Edit profile information"
      >
        {errors.form && <div className="form-error">{errors.form}</div>}
        <EditProfileForm
          values={editValues}
          errors={errors}
          onChange={(event) =>
            setEditValues((current) => ({
              ...current,
              [event.target.name]: event.target.value,
            }))
          }
          onSubmit={saveProfile}
          onCancel={requestCloseEdit}
          busy={busy}
        />
      </Modal>

      <Modal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Discard unsaved changes?"
      >
        <div className="profile-v2__confirm">
          <span>
            <AlertIcon />
          </span>
          <p>
            Your edits haven’t been saved. If you leave now, those changes will
            be lost.
          </p>
          <div>
            <Button
              variant="secondary"
              onClick={() => setConfirmDiscard(false)}
            >
              Keep editing
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDiscard(false);
                setEditOpen(false);
              }}
            >
              Discard changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={passwordOpen}
        onClose={() => !busy && setPasswordOpen(false)}
        title="Change password"
      >
        <form className="profile-v2__password-form" onSubmit={changePassword}>
          <span className="profile-v2__modal-icon">
            <LockIcon />
          </span>
          <p>Choose a unique password with at least 8 characters.</p>
          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(event) =>
                setPasswords((current) => ({
                  ...current,
                  current: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={passwords.next}
              onChange={(event) =>
                setPasswords((current) => ({
                  ...current,
                  next: event.target.value,
                }))
              }
              minLength="8"
              required
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(event) =>
                setPasswords((current) => ({
                  ...current,
                  confirm: event.target.value,
                }))
              }
              minLength="8"
              required
            />
          </label>
          <div className="profile-v2__form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={confirmLogout}
        onClose={() => !busy && setConfirmLogout(false)}
        title="Sign out from other devices?"
      >
        <div className="profile-v2__confirm">
          <span>
            <LockIcon />
          </span>
          <p>
            This will end every other active AjoPay session. You’ll stay signed
            in on this browser.
          </p>
          <div>
            <Button variant="secondary" onClick={() => setConfirmLogout(false)}>
              Cancel
            </Button>
            <Button onClick={logoutEverywhere} disabled={busy}>
              {busy ? "Signing out…" : "Sign out devices"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => !busy && setDeleteOpen(false)}
        title="Delete your account?"
      >
        <div className="profile-v2__delete-confirm">
          <span>
            <AlertIcon />
          </span>
          <p>
            This action is permanent. Your profile and account information will
            no longer be available.
          </p>
          <label>
            Type <b>DELETE</b> to confirm
            <input
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              autoComplete="off"
            />
          </label>
          <div>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={deleteAccount}
              disabled={busy || deleteText !== "DELETE"}
            >
              {busy ? "Deleting…" : "Delete account"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
