import { afterEach, describe, expect, it } from "vitest";

import i18n from "./i18n";
import { brandVisibleCopy, setVisibleProjectName, visibleProjectName } from "./projectBrand";

afterEach(() => {
  setVisibleProjectName(null);
});

describe("visibleProjectName", () => {
  it("keeps a configured name and drops the LiteLLM fallback", () => {
    expect(visibleProjectName("  Intelligo  ")).toBe("Intelligo");
    expect(visibleProjectName("LiteLLM")).toBe("");
    expect(visibleProjectName("   ")).toBe("");
  });
});

describe("brandVisibleCopy", () => {
  it("leaves copy alone until a project name is published", () => {
    expect(brandVisibleCopy("LiteLLM Dashboard", null)).toBe("LiteLLM Dashboard");
    expect(brandVisibleCopy("X-LiteLLM-Key", null)).toBe("X-LiteLLM-Key");
  });

  it("replaces the visible product word and leaves identifiers alone", () => {
    const text = "LiteLLM's LiteLLM-injected row in LiteLLM_TelemetryReport uses X-LiteLLM-Key";
    expect(brandVisibleCopy(text, "Intelligo")).toBe(
      "Intelligo's Intelligo-injected row in LiteLLM_TelemetryReport uses X-LiteLLM-Key",
    );
    expect(brandVisibleCopy("LiteLLM Dashboard", "Intelligo")).toBe("Intelligo Dashboard");
    expect(brandVisibleCopy("LiteLLM Proxy Admin UI", "Intelligo")).toBe("Intelligo Proxy Admin UI");
    expect(brandVisibleCopy("LiteLLM home", "Intelligo")).toBe("Intelligo home");
    expect(brandVisibleCopy("LiteLLM Proxy", "Intelligo")).toBe("Intelligo Proxy");
    expect(brandVisibleCopy("LiteLLM MCP OAuth", "Intelligo")).toBe("Intelligo MCP OAuth");
  });

  it("removes the product word when no name is configured", () => {
    expect(brandVisibleCopy("LiteLLM Dashboard", "")).toBe("Dashboard");
    expect(brandVisibleCopy("LiteLLM Proxy Admin UI", "")).toBe("Proxy Admin UI");
    expect(brandVisibleCopy("Access your LiteLLM Admin UI.", "")).toBe("Access your Admin UI.");
    expect(brandVisibleCopy("Thanks for using LiteLLM!", "")).toBe("Thanks for using!");
    expect(brandVisibleCopy("PostgreSQL pgvector (LiteLLM Connector)", "")).toBe("PostgreSQL pgvector (Connector)");
    expect(brandVisibleCopy("the LiteLLM-injected share", "")).toBe("the injected share");
    expect(brandVisibleCopy("LiteLLM home", "")).toBe("home");
    expect(brandVisibleCopy("LiteLLM_TelemetryReport", "")).toBe("LiteLLM_TelemetryReport");
    expect(brandVisibleCopy("X-LiteLLM-Key", "")).toBe("X-LiteLLM-Key");
    expect(brandVisibleCopy("LiteLLM Dashboard", "LiteLLM")).toBe("Dashboard");
  });

  it("rewrites translated console copy once a project name is published", () => {
    setVisibleProjectName("Intelligo");
    expect(i18n.t("shell.nav.homeLink")).toBe("Intelligo home");
    setVisibleProjectName("");
    expect(i18n.t("shell.nav.homeLink")).toBe("home");
    setVisibleProjectName(null);
    expect(i18n.t("shell.nav.homeLink")).toBe("LiteLLM home");
  });
});
