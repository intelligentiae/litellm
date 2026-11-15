import { describe, expect, it } from "vitest";

import {
  englishName,
  languageConfigFromUiConfig,
  Locales,
  nativeName,
  resolveLanguage,
  supportedLanguages,
} from "./languages";

const locales: Locales = new Map([["ja", async () => ({})]]);

describe("resolveLanguage", () => {
  it("uses the stored language when it has translations", () => {
    expect(resolveLanguage("ja", locales)).toBe("ja");
  });

  it.each([null, "", "en", "fr", "JA", "ja-JP", "__proto__"])("shows English when the stored value is %j", (stored) => {
    expect(resolveLanguage(stored, locales)).toBe("en");
  });

  it("shows English when no language besides English has translations", () => {
    expect(resolveLanguage("ja", new Map())).toBe("en");
  });

  it("uses the configured default when nothing valid is stored", () => {
    expect(resolveLanguage(null, locales, "ja")).toBe("ja");
  });

  it("keeps a stored language ahead of the configured default", () => {
    expect(resolveLanguage("ja", locales, "en")).toBe("ja");
  });

  it("ignores a configured default that has no translations", () => {
    expect(resolveLanguage(null, locales, "fr")).toBe("en");
  });
});

describe("languageConfigFromUiConfig", () => {
  it("reads the proxy language settings", () => {
    expect(languageConfigFromUiConfig({ default_language: "it", language_storage_key: "intelligo_language" })).toEqual({
      defaultLanguage: "it",
      storageKey: "intelligo_language",
    });
  });

  it("keeps the built-in settings when the proxy omits them or sends a value the browser cannot store", () => {
    expect(languageConfigFromUiConfig({})).toEqual({ defaultLanguage: "en", storageKey: "litellm_language" });
    expect(languageConfigFromUiConfig({ default_language: "not a language", language_storage_key: "bad key" })).toEqual({
      defaultLanguage: "en",
      storageKey: "litellm_language",
    });
  });
});

describe("supportedLanguages", () => {
  it("puts English first, then every language with translations", () => {
    expect(supportedLanguages(locales)).toEqual(["en", "ja"]);
    expect(supportedLanguages(new Map())).toEqual(["en"]);
  });
});

describe("language names", () => {
  it("names a language in itself, starting with a capital letter", () => {
    const spanish = nativeName("es");

    expect(spanish.toLocaleLowerCase("es")).toBe(
      new Intl.DisplayNames(["es"], { type: "language" }).of("es")?.toLocaleLowerCase("es"),
    );
    expect(spanish.charAt(0)).toBe(spanish.charAt(0).toLocaleUpperCase("es"));
  });

  it("names a language in English for the secondary label", () => {
    expect(englishName("ja")).toBe(new Intl.DisplayNames(["en"], { type: "language" }).of("ja"));
    expect(englishName("ja")).not.toBe(nativeName("ja"));
  });
});
