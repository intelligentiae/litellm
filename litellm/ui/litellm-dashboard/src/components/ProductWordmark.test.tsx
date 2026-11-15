import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductBrandProvider, ProductWordmark, productBrandFromTheme } from "./ProductWordmark";

describe("productBrandFromTheme", () => {
  it("builds the wordmark from the favicon url and the project name", () => {
    expect(
      productBrandFromTheme({
        values: {
          favicon_url: "https://daria.intelligentiae.it/wp-content/uploads/2026/11/intelligo-litellm.jpeg",
          project_name: "Intelligo",
        },
      }),
    ).toEqual({
      projectName: "Intelligo",
      faviconUrl: "https://daria.intelligentiae.it/wp-content/uploads/2026/11/intelligo-litellm.jpeg",
    });
  });

  it("leaves the name blank when the proxy has no project name", () => {
    expect(productBrandFromTheme({ values: {} })).toEqual({ projectName: "", faviconUrl: null });
    expect(productBrandFromTheme({ values: { favicon_url: "/etc/passwd", project_name: "  " } })).toEqual({
      projectName: "",
      faviconUrl: null,
    });
    expect(productBrandFromTheme({ values: { project_name: "LiteLLM" } })).toEqual({
      projectName: "",
      faviconUrl: null,
    });
  });
});

describe("ProductWordmark", () => {
  it("shows nothing until a project name is configured", () => {
    render(
      <ProductBrandProvider>
        <ProductWordmark />
      </ProductBrandProvider>,
    );

    expect(screen.queryByText("LiteLLM")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
