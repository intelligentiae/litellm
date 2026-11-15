"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getProxyBaseUrl } from "@/components/networking";
import { productNames } from "@/i18n/untranslated/productNames";
import { cn } from "@/lib/cva.config";

export type ProductBrand = {
  readonly projectName: string;
  readonly faviconUrl: string | null;
};

const builtinBrand: ProductBrand = { projectName: productNames.liteLLM, faviconUrl: null };

const ProductBrandContext = createContext<ProductBrand>(builtinBrand);

const isPublicHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const productBrandFromTheme = (payload: unknown): ProductBrand => {
  if (typeof payload !== "object" || payload === null || !("values" in payload)) return builtinBrand;
  const values = payload.values;
  if (typeof values !== "object" || values === null) return builtinBrand;
  const projectName =
    "project_name" in values && typeof values.project_name === "string" ? values.project_name.trim() : "";
  const faviconUrl = "favicon_url" in values && typeof values.favicon_url === "string" ? values.favicon_url : "";
  return {
    projectName: projectName || productNames.liteLLM,
    faviconUrl: isPublicHttpUrl(faviconUrl) ? faviconUrl : null,
  };
};

export const useProductBrand = (): ProductBrand => useContext(ProductBrandContext);

export function ProductBrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<ProductBrand>(builtinBrand);

  useEffect(() => {
    const proxyBaseUrl = getProxyBaseUrl();
    const url = proxyBaseUrl ? `${proxyBaseUrl}/get/ui_theme_settings` : "/get/ui_theme_settings";
    let current = true;
    fetch(url)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (current && payload !== null) setBrand(productBrandFromTheme(payload));
      })
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, []);

  return <ProductBrandContext.Provider value={brand}>{children}</ProductBrandContext.Provider>;
}

export function ProductWordmark({ className }: { className?: string }) {
  const { projectName, faviconUrl } = useProductBrand();
  return (
    <span className={cn("inline-flex items-center justify-center gap-[0.4em]", className)}>
      {faviconUrl ? <img src={faviconUrl} alt="" className="h-[1em] w-[1em] object-contain" /> : null}
      <span>{projectName}</span>
    </span>
  );
}
