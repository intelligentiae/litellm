"use client";

import { createContext, useContext } from "react";

import { builtinLanguageConfig, type LanguageConfig } from "./languages";

const LanguageSettingsContext = createContext<LanguageConfig>(builtinLanguageConfig);

export const LanguageSettingsProvider = LanguageSettingsContext.Provider;

export const useLanguageSettings = (): LanguageConfig => useContext(LanguageSettingsContext);
