import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import { registerFormats } from "./formats";
import en from "./locales/en.json";
import { projectBrandPostProcessor } from "./projectBrand";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof en };
  }
}

const options: InitOptions = {
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  postProcess: ["projectBrand"],
  resources: { en: { translation: en } },
  initAsync: false,
};

void i18n.use(projectBrandPostProcessor).use(initReactI18next).init(options);

if (i18n.services.formatter) registerFormats(i18n.services.formatter);

export default i18n;
