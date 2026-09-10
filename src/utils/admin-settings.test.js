import { describe, expect, it } from "vitest";
import { settingCategoryLabel, settingInputType, settingTitle, validateAdminSetting } from "./admin-settings";

describe("admin setting presentation", () => {
  it("turns a namespaced setting key into readable labels", () => {
    expect(settingTitle("ajo.renewal.enabled")).toBe("Renewal Enabled");
    expect(settingCategoryLabel("late-fee")).toBe("Late Fee");
  });

  it("detects appropriate editors from backend string values", () => {
    expect(settingInputType("true")).toBe("boolean");
    expect(settingInputType("2500.50")).toBe("number");
    expect(settingInputType('{"enabled":true}')).toBe("json");
    expect(settingInputType("manual")).toBe("text");
  });

  it("validates namespaced keys and values before sending them", () => {
    expect(validateAdminSetting({ key: "ajo.renewal.enabled", value: "true" })).toEqual({});
    expect(validateAdminSetting({ key: "invalid key", value: "" })).toEqual({
      key: "Use a namespaced key such as ajo.renewal.enabled.",
      value: "Enter a setting value.",
    });
  });
});
