const PRODUCT_WORD = /(?<![\w-])LiteLLM(?!\w)/g;

let activeProjectName: string | null = null;

export const visibleProjectName = (value: string): string => {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned || cleaned === "LiteLLM") return "";
  return cleaned;
};

export const readVisibleProjectName = (): string | null => activeProjectName;

export const setVisibleProjectName = (projectName: string | null): void => {
  activeProjectName = projectName === null ? null : visibleProjectName(projectName);
};

const tidyStripped = (text: string): string =>
  text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,!?;:])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/(^|\s)-(?=\w)/g, "$1")
    .replace(/^[ \t]+|[ \t]+$/gm, "");

export const brandVisibleCopy = (text: string, projectName: string | null): string => {
  if (projectName === null || !text.includes("LiteLLM")) return text;
  const name = visibleProjectName(projectName);
  const replaced = text.replace(PRODUCT_WORD, name);
  return name ? replaced : tidyStripped(replaced);
};

export const projectBrandPostProcessor = {
  type: "postProcessor" as const,
  name: "projectBrand",
  process(value: string): string {
    return brandVisibleCopy(value, activeProjectName);
  },
};
