import { getLocalStorageItem, setLocalStorageItem } from "@/utils/localStorageUtils";

export type Messages = { readonly [key: string]: string | Messages };
export type Locales = ReadonlyMap<string, () => Promise<Messages>>;
export type LanguageStore = { readonly read: () => string | null; readonly write: (language: string) => void };

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "litellm_language";

const LANGUAGE_CODE = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/;
const STORAGE_KEY = /^[A-Za-z0-9._:-]{1,128}$/;

export type LanguageConfig = {
  readonly defaultLanguage: string;
  readonly storageKey: string;
};

export const builtinLanguageConfig: LanguageConfig = {
  defaultLanguage: DEFAULT_LANGUAGE,
  storageKey: LANGUAGE_STORAGE_KEY,
};

export const languageConfigFromUiConfig = (payload: {
  readonly default_language?: string;
  readonly language_storage_key?: string;
}): LanguageConfig => ({
  defaultLanguage:
    payload.default_language !== undefined && LANGUAGE_CODE.test(payload.default_language)
      ? payload.default_language
      : DEFAULT_LANGUAGE,
  storageKey:
    payload.language_storage_key !== undefined && STORAGE_KEY.test(payload.language_storage_key)
      ? payload.language_storage_key
      : LANGUAGE_STORAGE_KEY,
});

export const LOCALES: Locales = new Map([
  ["it", () => import("./locales/it.json").then((module) => module.default)],
  ["es", () => import("./locales/es.json").then((module) => module.default)],
]);

export const createLanguageStore = (storageKey: string): LanguageStore => ({
  read: () => getLocalStorageItem(storageKey),
  write: (language) => setLocalStorageItem(storageKey, language),
});

export const browserLanguageStore: LanguageStore = createLanguageStore(LANGUAGE_STORAGE_KEY);

export const resolveLanguage = (
  stored: string | null,
  locales: Locales,
  defaultLanguage: string = DEFAULT_LANGUAGE,
): string => {
  if (stored === DEFAULT_LANGUAGE) return DEFAULT_LANGUAGE;
  if (stored !== null && locales.has(stored)) return stored;
  if (defaultLanguage !== DEFAULT_LANGUAGE && locales.has(defaultLanguage)) return defaultLanguage;
  return DEFAULT_LANGUAGE;
};

export const supportedLanguages = (locales: Locales): readonly string[] => [DEFAULT_LANGUAGE, ...locales.keys()];

const displayName = (language: string, displayLanguage: string): string =>
  new Intl.DisplayNames([displayLanguage], { type: "language" }).of(language) ?? language;

export const nativeName = (language: string): string => {
  const name = displayName(language, language);
  return name.charAt(0).toLocaleUpperCase(language) + name.slice(1);
};

export const englishName = (language: string): string => displayName(language, DEFAULT_LANGUAGE);
