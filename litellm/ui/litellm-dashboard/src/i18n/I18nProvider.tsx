"use client";

import type { i18n as I18n } from "i18next";
import { useEffect, useState, useSyncExternalStore } from "react";
import { I18nextProvider } from "react-i18next";

import LoadingScreen from "@/components/common_components/LoadingScreen";
import { getUiConfig } from "@/components/networking";

import i18n from "./i18n";
import { LanguageSettingsProvider } from "./languageSettings";
import {
  builtinLanguageConfig,
  createLanguageStore,
  DEFAULT_LANGUAGE,
  LanguageConfig,
  languageConfigFromUiConfig,
  LanguageStore,
  Locales,
  LOCALES,
  resolveLanguage,
} from "./languages";

type LanguageGateProps = {
  i18n: I18n;
  locales: Locales;
  store?: LanguageStore;
  loadConfig?: () => Promise<LanguageConfig>;
  children: React.ReactNode;
};

const loadLanguageConfig = async (): Promise<LanguageConfig> => {
  try {
    return languageConfigFromUiConfig(await getUiConfig());
  } catch {
    return builtinLanguageConfig;
  }
};

const neverChanges = () => () => undefined;

export function LanguageGate({ i18n, locales, store, loadConfig, children }: LanguageGateProps) {
  const [config, setConfig] = useState<LanguageConfig | null>(loadConfig ? null : builtinLanguageConfig);

  useEffect(() => {
    if (!loadConfig) return;
    let current = true;
    loadConfig()
      .then((loaded) => {
        if (current) setConfig(loaded);
      })
      .catch(() => {
        if (current) setConfig(builtinLanguageConfig);
      });
    return () => {
      current = false;
    };
  }, [loadConfig]);

  const resolved = config ?? builtinLanguageConfig;
  const activeStore = store ?? createLanguageStore(resolved.storageKey);
  const language = useSyncExternalStore(
    neverChanges,
    () => resolveLanguage(activeStore.read(), locales, resolved.defaultLanguage),
    () => DEFAULT_LANGUAGE,
  );
  const [settled, setSettled] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (config === null) return;
    const load = locales.get(language);
    if (!load) return;
    load()
      .then((messages) => {
        i18n.addResourceBundle(language, "translation", messages);
        return i18n.changeLanguage(language);
      })
      .then(() => {
        document.documentElement.lang = language;
      })
      .catch((error: unknown) => console.warn(`Couldn't load the "${language}" translations`, error))
      .finally(() => setSettled(language));
  }, [config, i18n, language, locales]);

  if (config === null || language !== settled) return <LoadingScreen />;

  return <LanguageSettingsProvider value={resolved}>{children}</LanguageSettingsProvider>;
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageGate i18n={i18n} locales={LOCALES} loadConfig={loadLanguageConfig}>
        {children}
      </LanguageGate>
    </I18nextProvider>
  );
}
