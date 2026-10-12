import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { HomeLink } from "./home-link";

// `next/link` resolves to vinext's shim via the `nextShims` plugin in vitest.config.ts.
test("renders a next/link as an anchor", () => {
  render(<HomeLink />);

  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});
