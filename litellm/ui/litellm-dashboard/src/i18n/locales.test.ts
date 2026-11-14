import { describe, expect, it } from "vitest";

import i18n from "./i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";
import italian from "./locales/it.json";

type Messages = { readonly [key: string]: string | Messages };

const isGroup = (value: unknown): value is Messages =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const leaves = (node: Messages, prefix: string): ReadonlyArray<readonly [string, unknown]> =>
  Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return isGroup(value) ? leaves(value, path) : [[path, value] as const];
  });

const pluralCounterpart = (key: string): string | null => {
  if (key.endsWith("_one")) return `${key.slice(0, -"_one".length)}_other`;
  if (key.endsWith("_other")) return `${key.slice(0, -"_other".length)}_one`;
  return null;
};

const entries = leaves(en, "");
const keys = new Set(entries.map(([key]) => key));

describe("en.json", () => {
  it("has a non-empty string at every leaf", () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter(([, value]) => typeof value !== "string" || value === "").map(([key]) => key)).toEqual([]);
  });

  it("only uses placeholders named like identifiers, with an optional lowercase format", () => {
    expect(entries.some(([, value]) => String(value).includes("{{"))).toBe(true);
    const malformed = entries.filter(([, value]) => {
      const text = String(value);
      const wellFormed = text.match(/\{\{[A-Za-z_][A-Za-z0-9_]*(?:, [a-z]+)?\}\}/g)?.length ?? 0;
      return text.split("{{").length - 1 !== wellFormed || text.split("}}").length - 1 !== wellFormed;
    });
    expect(malformed.map(([key]) => key)).toEqual([]);
  });

  it("pairs every _one key with an _other key and back", () => {
    expect([...keys].some((key) => pluralCounterpart(key) !== null)).toBe(true);
    const unpaired = [...keys].filter((key) => {
      const counterpart = pluralCounterpart(key);
      return counterpart !== null && !keys.has(counterpart);
    });
    expect(unpaired).toEqual([]);
  });

  it("is what the i18n instance resolves keys from", () => {
    expect(i18n.t("workflows.drawer.eventCount", { count: 2 })).toBe("2 events");
  });
});

const placeholders = (value: string): string[] => value.match(/\{\{[A-Za-z_][A-Za-z0-9_]*(?:, [a-z]+)?\}\}/g) ?? [];
const tags = (value: string): string[] => value.match(/<\/?[A-Za-z0-9]+\/>|<\/?[A-Za-z0-9]+>/g) ?? [];

describe.each([
  ["it", italian],
  ["es", es],
] as const)("%s.json", (language, messages) => {
  const translated = leaves(messages, "");
  const translatedKeys = new Map(translated);

  it("has the same keys as English, including the format templates", () => {
    expect([...translatedKeys.keys()].sort()).toEqual([...keys].sort());
  });

  it("keeps every placeholder and inline tag from the English string", () => {
    const drifted = entries.flatMap(([key, value]) => {
      const source = String(value);
      const target = translatedKeys.get(key);
      if (typeof target !== "string") return [key];
      const samePlaceholders =
        JSON.stringify([...placeholders(source)].sort()) === JSON.stringify([...placeholders(target)].sort());
      const sameTags = JSON.stringify(tags(source)) === JSON.stringify(tags(target));
      return samePlaceholders && sameTags ? [] : [key];
    });
    expect(drifted).toEqual([]);
  });

  it("translates a sentence that is not a proper noun", () => {
    expect(translatedKeys.get("shell.sidebarAccountMenu.logout")).not.toBe(en.shell.sidebarAccountMenu.logout);
    expect(language).toMatch(/^(it|es)$/);
  });
});
