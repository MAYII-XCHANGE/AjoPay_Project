import { useTranslation } from "react-i18next";
import { GlobeIcon } from "./icons";
import "./language-selector.css";

const languages = [
  { code: "en", nameKey: "language.english", short: "EN" },
  { code: "yo", nameKey: "language.yoruba", short: "YO" },
  { code: "ha", nameKey: "language.hausa", short: "HA" },
  { code: "ig", nameKey: "language.igbo", short: "IG" },
];

export function LanguageSelector({ variant = "default", compact = false }) {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "en";

  return (
    <label
      className={`language-selector language-selector--${variant}${compact ? " language-selector--compact" : ""}`}
    >
      {/* <GlobeIcon /> */}
      <span className="language-selector__label">{t("language.label")}</span>
      <select
        value={activeLanguage}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        aria-label={t("language.select")}
      >
        {languages.map((language) => (
          <option value={language.code} key={language.code}>
            {compact ? language.short : t(language.nameKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
