import {
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  DeviceIcon,
  EditIcon,
  GlobeIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
} from "../../components/icons";
import { Badge, Button, Card } from "../../components/ui";
import { AccountStatus } from "../../enums/statuses";

export function ProfileHeader({ user, onEdit }) {
  const initials = (user?.name || "AjoPay member")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="profile-v2__hero" aria-labelledby="profile-name">
      <div className="profile-v2__avatar-wrap">
        <span className="profile-v2__avatar" aria-hidden="true">
          {user?.profileImageUrl || user?.avatarUrl ? <img src={user.profileImageUrl || user.avatarUrl} alt="" /> : initials}
        </span>
        <button
          type="button"
          className="profile-v2__avatar-action"
          onClick={onEdit}
          aria-label="Edit profile photo"
        >
          <CameraIcon />
        </button>
      </div>
      <div className="profile-v2__identity">
        <div className="profile-v2__name-row">
          <h2 id="profile-name">{user?.name || "AjoPay member"}</h2>
          <Badge tone={user?.identityVerified === false ? "amber" : "green"}>
            <ShieldIcon />
            {user?.identityVerified === false ? "Pending" : "Verified"}
          </Badge>
        </div>
        <div className="profile-v2__contact">
          <span>
            <MailIcon /> {user?.email || "No email added"}
          </span>
          <span>
            <PhoneIcon /> {user?.phone || "No phone added"}
          </span>
        </div>
        <div className="profile-v2__meta">
          <span className="profile-v2__status">
            <i /> {(user?.accountStatus || AccountStatus.ACTIVE).toLowerCase()}
          </span>
          <span>
            <CalendarIcon /> Member since {user?.joinedLabel || "Not available"}
          </span>
        </div>
      </div>
      <Button variant="secondary" onClick={onEdit}>
        <EditIcon /> Edit profile
      </Button>
    </section>
  );
}

export function ProfileTabs({ activeTab, onChange }) {
  const tabs = [
    ["overview", "Overview"],
    ["personal", "Personal information"],
    ["security", "Security"],
    ["preferences", "Preferences"],
  ];

  return (
    <nav className="profile-v2__tabs" aria-label="Profile sections">
      {tabs.map(([value, label]) => (
        <button
          type="button"
          key={value}
          className={activeTab === value ? "active" : ""}
          onClick={() => onChange(value)}
          aria-current={activeTab === value ? "page" : undefined}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

export function ProfileCompletion({ percentage, onComplete }) {
  const isComplete = percentage === 100;
  return (
    <Card className="profile-v2__completion">
      <div className="profile-v2__section-heading">
        <div>
          <span className="profile-v2__eyebrow">PROFILE COMPLETION</span>
          <h2>{isComplete ? "You’re all set" : "A few details to go"}</h2>
        </div>
        <strong>{percentage}%</strong>
      </div>
      <div
        className="profile-v2__progress"
        role="progressbar"
        aria-label="Profile completion"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={percentage}
      >
        <span style={{ width: `${percentage}%` }} />
      </div>
      <p>
        {isComplete
          ? "Your account information is complete and up to date."
          : "Complete your profile to help your Ajo community know and trust you."}
      </p>
      {!isComplete && (
        <Button variant="ghost" onClick={onComplete}>
          Complete profile <EditIcon />
        </Button>
      )}
    </Card>
  );
}

export function ProfileStats({ user }) {
  const stats = [
    ["Followers", user?.followerCount ?? 0, "People following your Ajos"],
    ["Community rating", `★ ${user?.rating ?? "—"}`, "From member ratings"],
    ["Account role", user?.role || "USER", "Server-authorized access"],
  ];
  return (
    <div className="profile-v2__stats" aria-label="Account trust summary">
      {stats.map(([label, value, note]) => (
        <Card key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
          <span>{note}</span>
        </Card>
      ))}
    </div>
  );
}

export function InformationCard({ icon, title, description, fields, onEdit }) {
  return (
    <Card className="profile-v2__info-card">
      <div className="profile-v2__card-head">
        <span className="profile-v2__card-icon">{icon}</span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {onEdit && (
          <Button variant="ghost" onClick={onEdit}>
            <EditIcon /> Edit
          </Button>
        )}
      </div>
      <dl className="profile-v2__details">
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd className={!field.value ? "is-empty" : ""}>
              {field.value || "Not provided"}
              {field.verified && (
                <span className="profile-v2__verified" title="Verified">
                  <CheckIcon />
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`profile-v2__toggle ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span />
    </button>
  );
}

function SettingRow({ icon, title, text, action }) {
  return (
    <div className="profile-v2__setting-row">
      <span className="profile-v2__setting-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

export function SecurityCard({
  onChangePassword,
}) {
  return (
    <Card className="profile-v2__settings-card">
      <div className="profile-v2__card-head">
        <span className="profile-v2__card-icon">
          <LockIcon />
        </span>
        <div>
          <h2>Security settings</h2>
          <p>Protect your account and monitor where you’re signed in.</p>
        </div>
      </div>
      <div className="profile-v2__settings-list">
        <SettingRow
          icon={<KeyIcon />}
          title="Password"
          text="Use a strong password you don’t use elsewhere."
          action={
            <Button variant="secondary" onClick={onChangePassword}>
              Change
            </Button>
          }
        />
        <SettingRow
          icon={<DeviceIcon />}
          title="Active sessions"
          text="Your access and refresh tokens are kept only in memory on this device."
          action={<Badge tone="green">Current</Badge>}
        />
      </div>
    </Card>
  );
}

export function PreferencesCard({ values, onChange, onSave, busy }) {
  const options = [
    [
      "groupNotifications",
      "Group notifications",
      "Receive join-request and membership updates from your Ajos.",
    ],
  ];
  return (
    <Card className="profile-v2__settings-card">
      <div className="profile-v2__card-head">
        <span className="profile-v2__card-icon">
          <GlobeIcon />
        </span>
        <div>
          <h2>Communication preferences</h2>
          <p>Choose which useful updates you want to receive.</p>
        </div>
      </div>
      <div className="profile-v2__settings-list">
        {options.map(([key, title, text]) => (
          <SettingRow
            key={key}
            icon={
              key === "contributionReminders" ? <CalendarIcon /> : <MailIcon />
            }
            title={title}
            text={text}
            action={
              <Toggle
                checked={Boolean(values[key])}
                onChange={(checked) => onChange(key, checked)}
                label={title}
                disabled={busy}
              />
            }
          />
        ))}
      </div>
      <div className="profile-v2__save-row">
        <Button onClick={onSave} disabled={busy}>
          {busy ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </Card>
  );
}
