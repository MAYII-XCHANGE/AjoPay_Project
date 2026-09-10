import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/admin-service";
import { useAuth } from "../../contexts/auth-context";
import { Button, Card, EmptyState, Modal, Skeleton } from "../../components/ui";
import { CheckIcon, PlusIcon, SearchIcon, SettingsIcon, ShieldIcon } from "../../components/icons";
import { QueryErrorState } from "../../components/query-state";
import { UserRole } from "../../enums/roles";
import { formatDateTime } from "../../utils/formatters";
import { settingCategoryLabel, settingInputType, settingTitle, validateAdminSetting } from "../../utils/admin-settings";
import { AdminPageIntro } from "./admin-shared";
import "./admin-pages.css";

function SettingEditor({ setting, canWrite, saving, onSave }) {
  const [value, setValue] = useState(setting.value);
  const inputType = settingInputType(setting.value);
  const booleanEnabled = String(value).toLowerCase() === "true";
  const dirty = value !== setting.value;

  return (
    <article className="super-admin-setting-row">
      <div className="super-admin-setting-row__identity">
        <span><SettingsIcon /></span>
        <div>
          <h3>{settingTitle(setting.key)}</h3>
          <code>{setting.key}</code>
          <p>{setting.description || "A persisted platform value supplied by the settings API."}</p>
        </div>
      </div>
      <div className="super-admin-setting-row__editor">
        <span className="super-admin-setting-row__type">{inputType}</span>
        {inputType === "boolean" ? (
          <button
            type="button"
            role="switch"
            aria-checked={booleanEnabled}
            className={`super-admin-setting-switch${booleanEnabled ? " active" : ""}`}
            onClick={() => canWrite && setValue(booleanEnabled ? "false" : "true")}
            disabled={!canWrite || saving}
          >
            <i /><span>{booleanEnabled ? "Enabled" : "Disabled"}</span>
          </button>
        ) : inputType === "json" ? (
          <textarea value={value} onChange={(event) => setValue(event.target.value)} readOnly={!canWrite} rows="3" spellCheck="false" />
        ) : (
          <input type={inputType === "number" ? "number" : "text"} value={value} onChange={(event) => setValue(event.target.value)} readOnly={!canWrite} />
        )}
        {canWrite && (
          <Button type="button" variant={dirty ? "primary" : "secondary"} disabled={!dirty || saving || !String(value).trim()} onClick={() => onSave(setting.key, value)}>
            {saving ? "Saving…" : dirty ? "Save change" : <><CheckIcon /> Saved</>}
          </Button>
        )}
      </div>
      <footer>
        <span>Category: {settingCategoryLabel(setting.category)}</span>
        <span>{setting.updatedAt ? `Updated ${formatDateTime(setting.updatedAt)}` : "Persisted by the backend"}</span>
      </footer>
    </article>
  );
}

function CreateSettingModal({ open, busy, error, onClose, onCreate }) {
  const [values, setValues] = useState({ key: "", value: "" });
  const [validation, setValidation] = useState({});

  const close = () => {
    setValues({ key: "", value: "" });
    setValidation({});
    onClose();
  };

  const submit = (event) => {
    event.preventDefault();
    const errors = validateAdminSetting(values);
    setValidation(errors);
    if (Object.keys(errors).length) return;
    onCreate({ key: values.key.trim(), value: values.value.trim() });
  };

  return (
    <Modal open={open} onClose={() => !busy && close()} title="Create platform setting">
      <form className="super-admin-setting-modal" onSubmit={submit} noValidate>
        <div className="super-admin-setting-modal__intro"><span><PlusIcon /></span><div><h3>Add a backend setting</h3><p>The key and value will be persisted through the Admin Settings API.</p></div></div>
        <label>Setting key<input value={values.key} onChange={(event) => { setValues((current) => ({ ...current, key: event.target.value.toLowerCase().replaceAll(" ", "-") })); setValidation((current) => ({ ...current, key: "" })); }} placeholder="ajo.renewal.enabled" />{validation.key && <small className="field-error">{validation.key}</small>}</label>
        <label>Setting value<textarea value={values.value} onChange={(event) => { setValues((current) => ({ ...current, value: event.target.value })); setValidation((current) => ({ ...current, value: "" })); }} placeholder="true" rows="3" />{validation.value && <small className="field-error">{validation.value}</small>}</label>
        {error && <div className="form-error" role="alert">{error.message}</div>}
        <footer><Button type="button" variant="secondary" onClick={close} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create setting"}</Button></footer>
      </form>
    </Modal>
  );
}

export function AdminSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: adminService.settings });
  const rows = useMemo(() => settings.data || [], [settings.data]);
  const categories = useMemo(() => ["all", ...new Set(rows.map((setting) => setting.category))], [rows]);
  const visibleSettings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((setting) => (category === "all" || setting.category === category)
      && (!term || [setting.key, setting.value, setting.description].some((value) => String(value || "").toLowerCase().includes(term))));
  }, [category, rows, search]);
  const canWrite = user?.role === UserRole.SUPER_ADMIN
    && user?.tokenRole === UserRole.SUPER_ADMIN
    && user?.permissions?.isAdmin === true;
  const save = useMutation({
    mutationFn: ({ key, value }) => adminService.saveSetting(key, value),
    meta: { successMessage: "Platform setting saved." },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const create = useMutation({
    mutationFn: ({ key, value }) => adminService.saveSetting(key, value),
    meta: { successMessage: "Platform setting created." },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setCreateOpen(false);
    },
  });

  return (
    <div className="super-admin-page super-admin-settings">
      <AdminPageIntro
        eyebrow="PLATFORM CONTROLS"
        title="System settings"
        description="View backend-managed configuration and safely update persisted platform values."
        meta={`${rows.length} settings`}
      >
        {canWrite && <Button onClick={() => { create.reset(); setCreateOpen(true); }}><PlusIcon /> Add setting</Button>}
      </AdminPageIntro>

      <div className="super-admin-settings-layout">
        <aside className="super-admin-settings-sidebar">
          <Card>
            <small>SETTING GROUPS</small>
            <nav aria-label="Setting categories">
              {categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}><span>{settingCategoryLabel(item)}</span><b>{item === "all" ? rows.length : rows.filter((setting) => setting.category === item).length}</b></button>)}
            </nav>
          </Card>
          <Card className={`super-admin-settings-access${canWrite ? " writable" : ""}`}>
            <ShieldIcon />
            <div><b>{canWrite ? "Super Admin access" : "Read-only access"}</b><span>{canWrite ? "You can create and update persisted settings." : "Only a verified Super Admin can update settings."}</span></div>
          </Card>
        </aside>

        <Card className="super-admin-settings-panel">
          <header>
            <div><h2>{category === "all" ? "All settings" : settingCategoryLabel(category)}</h2><p>{visibleSettings.length} configuration {visibleSettings.length === 1 ? "value" : "values"}</p></div>
            <label className="super-admin-search"><SearchIcon /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search settings" aria-label="Search platform settings" /></label>
          </header>
          {settings.isError ? (
            <QueryErrorState error={settings.error} title="Platform settings could not be loaded" />
          ) : settings.isLoading ? (
            <Skeleton className="skeleton--table" />
          ) : visibleSettings.length ? (
            <div className="super-admin-settings-list">
              {visibleSettings.map((setting) => (
                <SettingEditor
                  key={`${setting.key}-${setting.value}`}
                  setting={setting}
                  canWrite={canWrite}
                  saving={save.isPending && save.variables?.key === setting.key}
                  onSave={(key, value) => save.mutate({ key, value })}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={<SettingsIcon />} title="No settings found" text={search ? "Try another search term or category." : "The backend has not returned settings for this category."} />
          )}
          {save.isError && <div className="super-admin-settings-panel__error form-error" role="alert">{save.error.message}</div>}
        </Card>
      </div>

      {createOpen && <CreateSettingModal open busy={create.isPending} error={create.error} onClose={() => setCreateOpen(false)} onCreate={(values) => create.mutate(values)} />}
    </div>
  );
}
