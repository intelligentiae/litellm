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

  it("keeps LiteLLM and no mark when the proxy has neither setting", () => {
    expect(productBrandFromTheme({ values: {} })).toEqual({ projectName: "LiteLLM", faviconUrl: null });
    expect(productBrandFromTheme({ values: { favicon_url: "/etc/passwd", project_name: "  " } })).toEqual({
      projectName: "LiteLLM",
      faviconUrl: null,
    });
  });
});

describe("ProductWordmark", () => {
  it("shows the favicon beside the project name", () => {
    render(
      <ProductBrandProvider>
        <ProductWordmark />
      </ProductBrandProvider>,
    );

    expect(screen.getByText("LiteLLM")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
