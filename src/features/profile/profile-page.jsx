import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../../services/notification-service";
import {
  AlertIcon,
  LockIcon,
  MapPinIcon,
  ShieldIcon,
  UserIcon,
} from "../../components/icons";
import { Button, Modal, PageHeader } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { BankAccountsCard } from "../bank-accounts/bank-accounts";
import {
  InformationCard,
  PreferencesCard,
  ProfileCompletion,
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  SecurityCard,
} from "./profile-components";
import "./profile.css";
import { notifyError, notifySuccess } from "../../utils/notifications";

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
  profileImageUrl: user?.profileImageUrl || user?.avatarUrl || "",
});

const validateProfile = (values) => {
  const errors = {};
  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";
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
    ["profileImageUrl", "Profile image URL", "url", "https://example.com/photo.jpg"],
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
  const { user, updateProfile, changePassword: changeAccountPassword } = useAuth();
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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [busy, setBusy] = useState(false);
  const preferenceQuery = useQuery({ queryKey: ["notification-preferences"], queryFn: notificationService.getPreferences });
  const [preferences, setPreferences] = useState(null);
  const visiblePreferences = preferences || {
    groupNotifications: preferenceQuery.data?.groupNotificationsEnabled ?? true,
  };

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
      "profileImageUrl",
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
    if (tone === "error") notifyError(message);
    else notifySuccess(message);
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
      await updateProfile({ firstName: editValues.firstName.trim(), lastName: editValues.lastName.trim(), profileImageUrl: editValues.profileImageUrl.trim() || null });
      setInitialEditValues(editValues);
      setEditOpen(false);
      showNotice("Your profile information was updated.");
    } catch (error) {
      setErrors({ form: "We couldn’t save your changes. Please try again." });
      notifyError(error, "We couldn’t save your changes. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitPasswordChange = async (event) => {
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
      await changeAccountPassword(passwords.current, passwords.next);
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
      await notificationService.updatePreferences(visiblePreferences.groupNotifications);
      showNotice("Your communication preferences were saved.");
    } catch {
      showNotice("We couldn’t save your preferences.", "error");
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
      <ProfileHeader user={profileUser} onEdit={openEdit} />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <div className="profile-v2__panel">
          <ProfileStats user={user} />
          <div className="profile-v2__overview-grid">
            <ProfileCompletion percentage={completion} onComplete={openEdit} />
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
            onChangePassword={() => setPasswordOpen(true)}
          />
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="profile-v2__panel profile-v2__stack">
          <PreferencesCard
            values={visiblePreferences}
            onChange={(key, checked) =>
              setPreferences((current) => ({ ...visiblePreferences, ...current, [key]: checked }))
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
        <form className="profile-v2__password-form" onSubmit={submitPasswordChange}>
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

    </div>
  );
}
